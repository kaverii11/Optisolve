from typing import Literal, Optional

from pydantic import BaseModel, Field


TicketStatus = Literal["waiting_for_agent", "resolved", "escalated"]
TicketTier = Literal["tier1", "tier2", "tier3"]


class SubmitTicketRequest(BaseModel):
    text: str = Field(..., min_length=1)


class SubmitTicketTier1Response(BaseModel):
    tier: Literal["tier1"]
    reply: str


class SubmitTicketTier2Response(BaseModel):
    tier: Literal["tier2"]
    ticket_id: int
    message: str


class SubmitTicketTier3Response(BaseModel):
    tier: Literal["tier3"]
    ticket_id: int
    message: str


class TicketStatusResponse(BaseModel):
    status: TicketStatus
    reply: Optional[str] = None


class AgentTicketView(BaseModel):
    ticket_id: int
    text: str
    draft_reply: Optional[str] = None
    confidence: float


class AdminTicketView(BaseModel):
    ticket_id: int
    text: str
    tier: TicketTier
    status: TicketStatus
    draft_reply: Optional[str] = None
    final_reply: Optional[str] = None
    confidence: float


class AgentResponseRequest(BaseModel):
    ticket_id: int
    final_reply: str = Field(..., min_length=1)


class DashboardMetricsResponse(BaseModel):
    total_tickets: int
    ai_helped_tickets: int
    tier1_auto_resolved: int
    tier2_human_review: int
    tier3_escalated: int
    vector_db_updates: int


class Ticket(BaseModel):
    ticket_id: int
    text: str
    status: TicketStatus
    tier: TicketTier
    draft_reply: Optional[str] = None
    final_reply: Optional[str] = None
    confidence: float
