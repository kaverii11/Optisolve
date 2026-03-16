import os
import numpy as np
from openai import OpenAI
from difflib import SequenceMatcher
from dotenv import load_dotenv
from typing import Union, Dict

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

def analyze_ticket(text: str) -> Dict[str, Union[float, str]]:
    """
    RAG-based analysis using Groq (Llama 3.3)
    """
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
    retrieval_conf = 0.75 * top_similarity + 0.25 * mean_similarity  # ← changed
    consistency = 1 - np.std(similarities)
    
    confidence = (0.7 * retrieval_conf) + (0.3 * consistency)
    confidence = round(float(np.clip(confidence, 0.0, 1.0)), 4)

    print(f"DEBUG confidence: {confidence}")

    retrieved_context = "\n---\n".join([m['reply'] for m in results['metadatas'][0]])
    
    system_prompt = """You are a helpful customer support agent.
    You will be given a support ticket and relevant past solutions.
    Write a clear, professional, empathetic reply.
    If the context doesn't clearly address the issue, say so honestly."""

    user_prompt = f"Support ticket:\n{text}\n\nRelevant past solutions:\n{retrieved_context}\n\nWrite a reply:"

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
