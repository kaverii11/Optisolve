from fastapi import APIRouter, HTTPException

from backend.database.ticket_store import ticket_store
from backend.models.ticket_models import (
    AdminTicketView,
    AgentResponseRequest,
    AgentTicketView,
    DashboardMetricsResponse,
)
from backend.services.ai_service import get_vector_update_count, store_agent_resolution

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


@router.get("/admin-tickets", response_model=list[AdminTicketView])
def get_admin_tickets():
    all_tickets = ticket_store.get_all_tickets()
    return [
        AdminTicketView(
            ticket_id=ticket.ticket_id,
            text=ticket.text,
            tier=ticket.tier,
            status=ticket.status,
            draft_reply=ticket.draft_reply,
            final_reply=ticket.final_reply,
            confidence=ticket.confidence,
        )
        for ticket in all_tickets
    ]


@router.get("/dashboard-metrics", response_model=DashboardMetricsResponse)
def get_dashboard_metrics():
    tickets = ticket_store.get_all_tickets()
    total_tickets = len(tickets)
    tier1_auto_resolved = sum(1 for ticket in tickets if ticket.tier == "tier1")
    tier2_human_review = sum(1 for ticket in tickets if ticket.tier == "tier2")
    tier3_escalated = sum(1 for ticket in tickets if ticket.tier == "tier3")
    ai_helped_tickets = sum(1 for ticket in tickets if ticket.tier in ["tier1", "tier2"])

    return DashboardMetricsResponse(
        total_tickets=total_tickets,
        ai_helped_tickets=ai_helped_tickets,
        tier1_auto_resolved=tier1_auto_resolved,
        tier2_human_review=tier2_human_review,
        tier3_escalated=tier3_escalated,
        vector_db_updates=get_vector_update_count(),
    )


@router.post("/agent-response")
def post_agent_response(payload: AgentResponseRequest):
    ticket = ticket_store.get_ticket(payload.ticket_id)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    if ticket.status == "resolved":
        raise HTTPException(status_code=400, detail="Ticket is already resolved")

    if ticket.tier in ["tier2", "tier3"]:
        store_agent_resolution(ticket.text, payload.final_reply, ticket.tier)

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
