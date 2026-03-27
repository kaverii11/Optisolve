from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field


ConversationStatus = Literal["ai_handling", "pending_agent", "agent_handling", "resolved"]
MessageRole = Literal["user", "ai", "agent"]
MessageTier = Literal["tier1", "tier2", "tier3"]


class Conversation(BaseModel):
    conversation_id: str
    username: str
    status: ConversationStatus
    pending_agent_draft: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class Message(BaseModel):
    message_id: str
    conversation_id: str
    role: MessageRole
    content: str
    confidence: Optional[float] = None
    tier: Optional[MessageTier] = None
    agent_draft_reply: Optional[str] = None
    timestamp: datetime


class StartConversationRequest(BaseModel):
    username: str = Field(..., min_length=1)


class StartConversationResponse(BaseModel):
    conversation_id: str
    status: ConversationStatus


class PostConversationMessageRequest(BaseModel):
    content: str = Field(..., min_length=1)


class PostConversationMessageResponse(BaseModel):
    role: MessageRole
    content: str
    confidence: Optional[float] = None
    tier: Optional[MessageTier] = None
    status: ConversationStatus


class AgentReplyRequest(BaseModel):
    content: str = Field(..., min_length=1)


class AgentReplyResponse(BaseModel):
    message_id: str
    status: ConversationStatus


class ResolveConversationResponse(BaseModel):
    status: ConversationStatus


class ConversationListItem(BaseModel):
    conversation_id: str
    username: str
    status: ConversationStatus
    updated_at: datetime
    last_message_preview: str
    pending_agent_draft: Optional[str] = None


class ConversationMetricsResponse(BaseModel):
    total_conversations: int
    ai_handling: int
    pending_agent: int
    agent_handling: int
    resolved: int
