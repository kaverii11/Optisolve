from fastapi import APIRouter, HTTPException

from backend.database.ticket_store import ticket_store
from backend.models.ticket_models import AgentResponseRequest, AgentTicketView

router = APIRouter(tags=["agents"])


@router.get("/agent-tickets", response_model=list[AgentTicketView])
def get_agent_tickets():
    queue = ticket_store.get_agent_queue()
    return [
        AgentTicketView(
            ticket_id=ticket.ticket_id,
            text=ticket.text,
            draft_reply=ticket.draft_reply,
            confidence=ticket.confidence,
        )
        for ticket in queue
    ]


@router.post("/agent-response")
def post_agent_response(payload: AgentResponseRequest):
    ticket = ticket_store.get_ticket(payload.ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == "resolved":
        raise HTTPException(status_code=400, detail="Ticket is already resolved")

    updated_ticket = ticket_store.update_ticket(
        payload.ticket_id,
        final_reply=payload.final_reply,
        status="resolved",
    )

    if not updated_ticket:
        raise HTTPException(status_code=500, detail="Failed to update ticket")

    return {
        "message": "Agent response saved",
        "ticket_id": payload.ticket_id,
        "status": updated_ticket.status,
    }
