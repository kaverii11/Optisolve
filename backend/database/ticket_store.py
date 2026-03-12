from threading import Lock

from backend.models.ticket_models import Ticket


class TicketStore:
    def __init__(self) -> None:
        self._tickets: dict[int, Ticket] = {}
        self._next_ticket_id = 1
        self._lock = Lock()

    def create_ticket(
        self,
        text: str,
        tier: str,
        status: str,
        draft_reply: str,
        confidence: float,
    ) -> Ticket:
        with self._lock:
            ticket_id = self._next_ticket_id
            self._next_ticket_id += 1

            ticket = Ticket(
                ticket_id=ticket_id,
                text=text,
                status=status,
                tier=tier,
                draft_reply=draft_reply,
                final_reply=None,
                confidence=confidence,
            )
            self._tickets[ticket_id] = ticket
            return ticket

    def get_ticket(self, ticket_id: int) -> Ticket | None:
        return self._tickets.get(ticket_id)

    def update_ticket(self, ticket_id: int, **updates) -> Ticket | None:
        ticket = self._tickets.get(ticket_id)
        if not ticket:
            return None

        updated_data = ticket.model_dump()
        updated_data.update(updates)
        updated_ticket = Ticket(**updated_data)
        self._tickets[ticket_id] = updated_ticket
        return updated_ticket

    def get_agent_queue(self) -> list[Ticket]:
        return [
            ticket
            for ticket in self._tickets.values()
            if ticket.tier == "tier2" and ticket.status == "waiting_for_agent"
        ]


ticket_store = TicketStore()
