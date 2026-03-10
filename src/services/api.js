const API_BASE = "http://localhost:8000";

export async function analyzeTicket(ticketId, userMessage) {
    const res = await fetch(`${API_BASE}/api/tickets/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ticket_id: String(ticketId),
            user_message: userMessage,
        }),
    });

    if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
    }

    return res.json();
}
