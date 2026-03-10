from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from textblob import TextBlob
import random

app = FastAPI(title="OptiSolve AI Routing API")

# Allow the React frontend to talk to this backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 1. Define the Data Models
class TicketRequest(BaseModel):
    ticket_id: str
    user_message: str


class RoutingResponse(BaseModel):
    base_retrieval_match: int
    sentiment_modifier: int
    final_score: int
    routing_decision: str
    ai_draft: str


# 2. Mock AI Retrieval Function (Simulating Vector DB / LangChain)
def simulate_rag_retrieval(message: str) -> int:
    # In a real app, this queries ChromaDB to find matching docs.
    # For the MVP demo, we'll pretend the AI is highly confident about password resets.
    if "log in" in message.lower() or "password" in message.lower():
        return 92
    return random.randint(60, 85)


# 3. The Core API Endpoint
@app.post("/api/tickets/analyze", response_model=RoutingResponse)
async def analyze_ticket(ticket: TicketRequest):
    # Step A: Get base technical confidence
    base_score = simulate_rag_retrieval(ticket.user_message)

    # Step B: Analyze Sentiment
    analysis = TextBlob(ticket.user_message)
    polarity = analysis.sentiment.polarity  # Ranges from -1.0 (angry) to 1.0 (happy)

    # Step C: Calculate Sentiment Penalty
    sentiment_modifier = 0
    if polarity < -0.3:  # User is frustrated
        sentiment_modifier = -35
    elif polarity < 0:  # User is slightly annoyed
        sentiment_modifier = -15

    # Step D: Calculate Final Composite Score
    final_score = base_score + sentiment_modifier

    # Step E: Apply Three-Tier Routing Logic
    decision = ""
    if final_score >= 85:
        decision = "Auto-Resolved"
    elif 60 <= final_score < 85:
        decision = "Requires Approval (Tier 2)"
    else:
        decision = "Escalated (Tier 3)"

    # Step F: Generate Mock Draft
    draft = "Dear customer, I apologize for the frustration. Here is a secure link to reset your credentials..."

    return RoutingResponse(
        base_retrieval_match=base_score,
        sentiment_modifier=sentiment_modifier,
        final_score=final_score,
        routing_decision=decision,
        ai_draft=draft,
    )


# Run instructions at the bottom
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
