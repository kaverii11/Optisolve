from fastapi import APIRouter, HTTPException

from backend.database.conversation_store import conversation_store
from backend.models.conversation_models import (
    AgentReplyRequest,
    AgentReplyResponse,
    ConversationListItem,
    ConversationMetricsResponse,
    Message,
    PostConversationMessageRequest,
    PostConversationMessageResponse,
    ResolveConversationResponse,
    StartConversationRequest,
    StartConversationResponse,
)
from backend.services.ai_service import analyze_ticket, store_resolved_conversation_memory
from backend.services.routing_service import routing_logic
from backend.services.sentiment_service import sentiment_engine

router = APIRouter(tags=["conversations"])


@router.post("/conversation/start", response_model=StartConversationResponse)
def start_conversation(payload: StartConversationRequest):
    conversation = conversation_store.start_conversation(payload.username)
    return StartConversationResponse(
        conversation_id=conversation.conversation_id,
        status=conversation.status,
    )


@router.get("/conversation/user/{username}", response_model=list[ConversationListItem])
def get_user_conversations(username: str):
    conversations = conversation_store.get_user_conversations(username)
    response: list[ConversationListItem] = []
    for conversation in conversations:
        history = conversation_store.get_history(conversation.conversation_id)
        preview = history[-1].content if history else "No messages yet"
        response.append(
            ConversationListItem(
                conversation_id=conversation.conversation_id,
                username=conversation.username,
                status=conversation.status,
                updated_at=conversation.updated_at,
                last_message_preview=preview[:120],
                pending_agent_draft=conversation.pending_agent_draft,
            )
        )
    return response


@router.post(
    "/conversation/{conversation_id}/message",
    response_model=PostConversationMessageResponse,
)
def post_conversation_message(
    conversation_id: str, payload: PostConversationMessageRequest
):
    conversation = conversation_store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    current_status = conversation.status

    if current_status == "resolved":
        updated = conversation_store.update_conversation_status(
            conversation_id, "ai_handling"
        )
        if not updated:
            raise HTTPException(status_code=500, detail="Failed to reopen conversation")
        conversation_store.update_pending_agent_draft(conversation_id, None)
        current_status = "ai_handling"

    if current_status in ["pending_agent", "agent_handling"]:
        user_message = conversation_store.add_message(
            conversation_id=conversation_id,
            role="user",
            content=payload.content,
        )
        if not user_message:
            raise HTTPException(status_code=500, detail="Failed to save message")

        if current_status == "pending_agent":
            notice = "Your message is saved. An agent will respond shortly."
        else:
            notice = "Your message is saved. The assigned agent will continue this conversation."

        conversation_store.add_message(
            conversation_id=conversation_id,
            role="ai",
            content=notice,
        )

        return PostConversationMessageResponse(
            role="ai",
            content=notice,
            confidence=None,
            tier=None,
            status=current_status,
        )

    analysis = analyze_ticket(payload.content)
    confidence = float(analysis["confidence"])
    draft_reply = str(analysis["draft_reply"])

    sentiment_result = sentiment_engine.analyze(payload.content)
    sentiment = float(sentiment_result["score"])

    tier, adjusted_confidence = routing_logic(confidence, sentiment)

    user_message = conversation_store.add_message(
        conversation_id=conversation_id,
        role="user",
        content=payload.content,
        confidence=adjusted_confidence,
        tier=tier,
        agent_draft_reply=draft_reply if tier == "tier2" else None,
    )
    if not user_message:
        raise HTTPException(status_code=500, detail="Failed to save message")

    if tier == "tier1":
        conversation_store.update_pending_agent_draft(conversation_id, None)
        ai_message = conversation_store.add_message(
            conversation_id=conversation_id,
            role="ai",
            content=draft_reply,
            confidence=adjusted_confidence,
        )
        if not ai_message:
            raise HTTPException(status_code=500, detail="Failed to save AI response")

        return PostConversationMessageResponse(
            role="ai",
            content=draft_reply,
            confidence=adjusted_confidence,
            tier="tier1",
            status="ai_handling",
        )

    updated = conversation_store.update_conversation_status(conversation_id, "pending_agent")
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update conversation status")

    conversation_store.update_pending_agent_draft(
        conversation_id, draft_reply if tier == "tier2" else None
    )

    handoff_notice = "I am escalating this to a human agent for better support."
    conversation_store.add_message(
        conversation_id=conversation_id,
        role="ai",
        content=handoff_notice,
        confidence=adjusted_confidence,
    )

    return PostConversationMessageResponse(
        role="ai",
        content=handoff_notice,
        confidence=adjusted_confidence,
        tier=tier,
        status="pending_agent",
    )


@router.get("/conversation/{conversation_id}/history", response_model=list[Message])
def get_conversation_history(conversation_id: str):
    conversation = conversation_store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    return conversation_store.get_history(conversation_id)


@router.get("/agent/conversations", response_model=list[ConversationListItem])
def get_agent_conversations():
    conversations = conversation_store.get_agent_conversations()
    response: list[ConversationListItem] = []
    for conversation in conversations:
        history = conversation_store.get_history(conversation.conversation_id)
        preview = history[-1].content if history else "No messages yet"
        response.append(
            ConversationListItem(
                conversation_id=conversation.conversation_id,
                username=conversation.username,
                status=conversation.status,
                updated_at=conversation.updated_at,
                last_message_preview=preview[:120],
                pending_agent_draft=conversation.pending_agent_draft,
            )
        )
    return response


@router.post(
    "/agent/conversation/{conversation_id}/reply",
    response_model=AgentReplyResponse,
)
def agent_reply(conversation_id: str, payload: AgentReplyRequest):
    conversation = conversation_store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    if conversation.status not in ["pending_agent", "agent_handling"]:
        raise HTTPException(
            status_code=400,
            detail="Conversation is not available for agent reply",
        )

    message = conversation_store.add_message(
        conversation_id=conversation_id,
        role="agent",
        content=payload.content,
    )
    if not message:
        raise HTTPException(status_code=500, detail="Failed to save agent message")

    updated = conversation_store.update_conversation_status(
        conversation_id, "agent_handling"
    )
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to update conversation status")

    conversation_store.update_pending_agent_draft(conversation_id, None)

    return AgentReplyResponse(message_id=message.message_id, status=updated.status)


@router.post(
    "/agent/conversation/{conversation_id}/resolve",
    response_model=ResolveConversationResponse,
)
def resolve_conversation(conversation_id: str):
    conversation = conversation_store.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")

    history = conversation_store.get_history(conversation_id)

    updated = conversation_store.update_conversation_status(conversation_id, "resolved")
    if not updated:
        raise HTTPException(status_code=500, detail="Failed to resolve conversation")

    conversation_store.update_pending_agent_draft(conversation_id, None)

    history_payload = [message.model_dump() for message in history]
    store_resolved_conversation_memory(
        conversation_id=conversation_id,
        username=conversation.username,
        messages=history_payload,
    )

    return ResolveConversationResponse(status=updated.status)


@router.get("/conversation-metrics", response_model=ConversationMetricsResponse)
def get_conversation_metrics():
    conversations = conversation_store.get_all_conversations()
    total = len(conversations)

    return ConversationMetricsResponse(
        total_conversations=total,
        ai_handling=sum(1 for row in conversations if row.status == "ai_handling"),
        pending_agent=sum(1 for row in conversations if row.status == "pending_agent"),
        agent_handling=sum(1 for row in conversations if row.status == "agent_handling"),
        resolved=sum(1 for row in conversations if row.status == "resolved"),
    )
