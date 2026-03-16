from typing import Union

from fastapi import APIRouter, HTTPException

from backend.database.ticket_store import ticket_store
from backend.models.ticket_models import (
    SubmitTicketRequest,
    SubmitTicketTier1Response,
    SubmitTicketTier2Response,
    SubmitTicketTier3Response,
    TicketStatusResponse,
)
from backend.services.ai_service import analyze_ticket
from backend.services.routing_service import routing_logic
from backend.services.sentiment_service import sentiment_engine  # ← fixed import

router = APIRouter(tags=["tickets"])


@router.post(
    "/submit-ticket",
    response_model=Union[
        SubmitTicketTier1Response,
        SubmitTicketTier2Response,
        SubmitTicketTier3Response,
    ],
)
def submit_ticket(payload: SubmitTicketRequest):
    analysis = analyze_ticket(payload.text)
    confidence = float(analysis["confidence"])
    draft_reply = str(analysis["draft_reply"])

    sentiment_result = sentiment_engine.analyze(payload.text)  # ← returns dict
    sentiment = float(sentiment_result["score"])    

    print(f"DEBUG sentiment: {sentiment_result}")  # ← add this
    print(f"DEBUG sentiment score: {sentiment}")         # ← extract float

    tier, adjusted_confidence = routing_logic(confidence, sentiment)
    print(f"DEBUG tier: {tier}, adjusted_confidence: {adjusted_confidence}") 

    if tier == "tier1":
        return SubmitTicketTier1Response(tier="tier1", reply=draft_reply)

    if tier == "tier2":
        ticket = ticket_store.create_ticket(
            text=payload.text,
            tier="tier2",
            status="waiting_for_agent",
            draft_reply=draft_reply,
            confidence=adjusted_confidence,
        )
        return SubmitTicketTier2Response(
            tier="tier2",
            ticket_id=ticket.ticket_id,
            message="Agent reviewing your request",
        )

    ticket = ticket_store.create_ticket(
        text=payload.text,
        tier="tier3",
        status="escalated",
        draft_reply=draft_reply,
        confidence=adjusted_confidence,
    )
    return SubmitTicketTier3Response(
        tier="tier3",
        ticket_id=ticket.ticket_id,
        message="Ticket escalated to specialist support",
    )


@router.get("/ticket-status/{ticket_id}", response_model=TicketStatusResponse)
def ticket_status(ticket_id: int):
    ticket = ticket_store.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == "resolved":
        return TicketStatusResponse(status="resolved", reply=ticket.final_reply)

    if ticket.status == "waiting_for_agent":
        return TicketStatusResponse(status="waiting_for_agent")

    return TicketStatusResponse(status="escalated")