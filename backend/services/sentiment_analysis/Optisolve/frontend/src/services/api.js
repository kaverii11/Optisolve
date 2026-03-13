const API_BASE = "http://localhost:8000";

async function request(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
        },
        ...options,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `API error: ${res.status}`);
    }

    return res.json();
}

// User-facing: submit a new ticket for routing
export async function submitTicket(text) {
    return request("/submit-ticket", {
        method: "POST",
        body: JSON.stringify({ text }),
    });
}

// User-facing: check status of an existing ticket
export async function getTicketStatus(ticketId) {
    return request(`/ticket-status/${ticketId}`, {
        method: "GET",
    });
}

// Agent-facing: get the current agent queue
export async function getAgentTickets() {
    return request("/agent-tickets", {
        method: "GET",
    });
}

// Agent-facing: submit an agent reply that resolves a ticket
export async function sendAgentResponse(ticketId, finalReply) {
    return request("/agent-response", {
        method: "POST",
        body: JSON.stringify({ ticket_id: ticketId, final_reply: finalReply }),
    });
}
