import os
import numpy as np
from openai import OpenAI
from difflib import SequenceMatcher
from dotenv import load_dotenv
from typing import Union, Dict
from hashlib import sha256

# 1. LOAD DOTENV FIRST
load_dotenv()

# 2. INITIALIZE GROQ CLIENT
# Groq is OpenAI-compatible, so we just change the base_url
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    raise ValueError("❌ Groq API Key not found! Check your .env file.")

client = OpenAI(
    base_url="https://api.groq.com/openai/v1",
    api_key=api_key
)

# 3. IMPORTS AND SEEDING
from backend.utils.knowledge_base import get_collection, seed_knowledge_base

collection = get_collection()


def _normalize_text(text: str) -> str:
    return " ".join(text.lower().strip().split())

def _retrieve_phase2_memory(text: str, n_results: int = 3) -> tuple[list[dict], list[float]]:
    """
    Phase 3: Retrieve agent-resolved conversations and turn chunks from Phase 2.
    Returns (metadata_rows, similarities) for high-quality agent examples.
    """
    try:
        results = collection.query(
            query_texts=[text],
            n_results=n_results,
            where={
                "$or": [
                    {"source": "resolved_conversation"},
                    {"source": "agent_turn"},
                ]
            }
        )
        
        if not results or not results.get("ids") or not results["ids"][0]:
            return [], []
        
        distances = results['distances'][0]
        similarities = [max(0, 1 - d) for d in distances]
        metadata_rows = results.get("metadatas", [[]])[0]
        
        return metadata_rows, similarities
    except Exception as e:
        print(f"DEBUG Phase 3 retrieval error: {e}")
        return [], []


def _calculate_confidence_boost(similarities: list[float]) -> float:
    """
    Phase 3: Calculate confidence boost based on Phase 2 memory retrieved.
    Boost is proportional to top match quality.
    """
    if not similarities:
        return 0.0
    
    top_similarity = max(similarities)
    
    if top_similarity >= 0.85:
        return 0.20  # Strong match from agent-resolved example
    elif top_similarity >= 0.75:
        return 0.15  # Good match
    elif top_similarity >= 0.65:
        return 0.10  # Moderate match
    else:
        return 0.0   # Weak match, no boost


def analyze_ticket(text: str) -> Dict[str, Union[float, str]]:
    """
    RAG-based analysis using Groq (Llama 3.3) with Phase 3 retrieval reranking.
    
    Phase 3 improvement: Boost confidence when similar resolved conversations 
    (summaries and turn chunks from Phase 2) are found in Chroma.
    """
    normalized_text = _normalize_text(text)
    learned_matches = collection.get(
        where={
            "$and": [
                {"source": "agent_resolution"},
                {"ticket_text_normalized": normalized_text},
            ]
        }
    )

    learned_replies = learned_matches.get("metadatas", [])
    if learned_replies:
        latest_reply = learned_replies[-1].get("reply")
        if latest_reply:
            return {"confidence": 0.98, "draft_reply": latest_reply}

    # Standard retrieval (all knowledge base)
    results = collection.query(
        query_texts=[text],
        n_results=3
    )

    distances = results['distances'][0]
    similarities = [max(0, 1 - d) for d in distances]

    print(f"DEBUG distances: {distances}")
    print(f"DEBUG similarities: {similarities}")
    
    if not similarities:
        return {"confidence": 0.0, "draft_reply": "No context found."}
    
    top_similarity = similarities[0]
    mean_similarity = np.mean(similarities)
    retrieval_conf = 0.75 * top_similarity + 0.25 * mean_similarity
    consistency = 1 - np.std(similarities)
    
    confidence = (0.7 * retrieval_conf) + (0.3 * consistency)
    confidence = round(float(np.clip(confidence, 0.0, 1.0)), 4)

    # ===== PHASE 3: Retrieve and rerank with Phase 2 memory =====
    phase2_metadata, phase2_similarities = _retrieve_phase2_memory(text, n_results=3)
    confidence_boost = _calculate_confidence_boost(phase2_similarities)
    
    # Apply boost, staying within [0.0, 1.0]
    original_confidence = confidence
    confidence = round(float(np.clip(confidence + confidence_boost, 0.0, 1.0)), 4)
    
    print(f"DEBUG original_confidence: {original_confidence}, phase2_boost: {confidence_boost}, final_confidence: {confidence}")
    # ===== END PHASE 3 =====

    metadata_rows = results.get("metadatas", [[]])[0]
    context_parts = []
    for metadata in metadata_rows:
        if not isinstance(metadata, dict):
            continue
        text_val = metadata.get("reply") or metadata.get("resolution")
        if text_val:
            context_parts.append(str(text_val))

    # Add Phase 2 context if available
    if phase2_metadata:
        context_parts.append("[Agent-Resolved Examples]")
        for metadata in phase2_metadata:
            if not isinstance(metadata, dict):
                continue
            text_val = metadata.get("reply") or metadata.get("resolution")
            if text_val:
                context_parts.append(str(text_val))

    retrieved_context = "\n---\n".join(context_parts) if context_parts else "No context found."

    system_prompt = """You are a friendly technical support assistant.
Be concise, helpful, and human.

Rules:
- Keep total response under 110 words.
- Start with one short empathetic line (natural, not scripted).
- Give clear numbered steps (2-4 max).
- End with one brief check-in line (for example: "Tell me what you see after step 2.").
- Avoid overly formal or robotic phrasing.
- Avoid long explanations, but keep the tone warm.
- If key details are missing, ask at most 2 short clarifying questions.
- Use provided context where relevant.
"""

    user_prompt = (
        f"Support ticket:\n{text}\n\n"
        f"Relevant past solutions:\n{retrieved_context}\n\n"
        "Write a pinpoint support reply following the required structure."
    )

    # Using llama-3.3-70b-versatile for high quality responses
    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        temperature=0.2
    )

    return {
        "confidence": confidence,
        "draft_reply": response.choices[0].message.content
    }

def store_correction(original_ticket: str, ai_draft: str, agent_reply: str) -> bool:
    similarity = SequenceMatcher(None, ai_draft, agent_reply).ratio()
    if similarity < 0.85:
        corr_id = f"corr_{hash(original_ticket + agent_reply) % 10**8}"
        collection.add(
            documents=[original_ticket],
            metadatas=[{"reply": agent_reply, "source": "agent_correction"}],
            ids=[corr_id]
        )
        return True
    return False


def store_agent_resolution(original_ticket: str, agent_reply: str, tier: str) -> bool:
    if not original_ticket or not agent_reply:
        return False

    normalized_text = _normalize_text(original_ticket)
    digest = sha256(f"{normalized_text}|{agent_reply}".encode("utf-8")).hexdigest()[:16]
    resolution_id = f"res_{digest}"

    try:
        collection.add(
            documents=[original_ticket],
            metadatas=[
                {
                    "reply": agent_reply,
                    "source": "agent_resolution",
                    "tier": tier,
                    "ticket_text_normalized": normalized_text,
                }
            ],
            ids=[resolution_id],
        )
        return True
    except Exception:
        return False


def get_vector_update_count() -> int:
    correction_records = collection.get(where={"source": "agent_correction"})
    resolution_records = collection.get(where={"source": "agent_resolution"})
    return len(correction_records.get("ids", [])) + len(resolution_records.get("ids", []))


def _build_conversation_text(messages: list[dict]) -> str:
    lines: list[str] = []
    for message in messages:
        role = str(message.get("role", "unknown")).upper()
        content = str(message.get("content", "")).strip()
        lines.append(f"{role}: {content}")
    return "\n".join(lines)


def _generate_conversation_summary(full_conversation_text: str) -> str | None:
    if not full_conversation_text.strip():
        return None

    summary_prompt = f"""
Summarize this support conversation in 2-3 sentences.
Focus on: what the user's issue was, what solution was provided.
Be specific and concrete.

Conversation:
{full_conversation_text}
"""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {"role": "system", "content": "You are a concise support summarizer."},
                {"role": "user", "content": summary_prompt},
            ],
            temperature=0.1,
        )
        summary = response.choices[0].message.content
        if not summary:
            return None
        return summary.strip()
    except Exception:
        return None


def store_resolved_conversation_memory(
    conversation_id: str,
    username: str,
    messages: list[dict],
) -> dict:
    user_messages = [message for message in messages if message.get("role") == "user"]
    summary_written = False
    chunk_writes = 0

    if len(user_messages) >= 2:
        full_conversation_text = _build_conversation_text(messages)
        summary = _generate_conversation_summary(full_conversation_text)
        final_agent_messages = [
            message.get("content", "")
            for message in messages
            if message.get("role") == "agent"
        ]
        final_agent_message = final_agent_messages[-1] if final_agent_messages else ""

        if summary:
            try:
                collection.upsert(
                    documents=[summary],
                    metadatas=[
                        {
                            "type": "conversation_summary",
                            "conversation_id": conversation_id,
                            "username": username,
                            "resolution": final_agent_message,
                            "source": "resolved_conversation",
                        }
                    ],
                    ids=[f"summary_{conversation_id}"],
                )
                summary_written = True
            except Exception:
                summary_written = False

    last_user_message = None
    turn_index = 0
    for message in messages:
        role = message.get("role")

        if role == "user":
            last_user_message = message
            continue

        if role != "agent" or not last_user_message:
            continue

        user_content = str(last_user_message.get("content", "")).strip()
        agent_content = str(message.get("content", "")).strip()
        ai_draft = last_user_message.get("agent_draft_reply")

        if not user_content or not agent_content:
            last_user_message = None
            continue

        if ai_draft:
            similarity = SequenceMatcher(None, str(ai_draft), agent_content).ratio()
            if similarity >= 0.85:
                last_user_message = None
                continue

        turn_index += 1
        chunk_id = f"chunk_{conversation_id}_{turn_index}"
        try:
            collection.upsert(
                documents=[user_content],
                metadatas=[
                    {
                        "type": "turn_chunk",
                        "conversation_id": conversation_id,
                        "reply": agent_content,
                        "source": "agent_turn",
                        "turn_index": turn_index,
                    }
                ],
                ids=[chunk_id],
            )
            chunk_writes += 1
        except Exception:
            pass

        last_user_message = None

    return {
        "summary_written": summary_written,
        "chunk_writes": chunk_writes,
    }