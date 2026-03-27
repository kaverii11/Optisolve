# OptiSolve

OptiSolve is an AI-assisted support platform with human escalation.

It includes:
- A FastAPI backend for ticket and conversation workflows
- A React + Vite frontend for user and agent portals
- A Chroma vector database for retrieval-augmented support responses and learning from resolved cases

## What This Project Does

OptiSolve routes incoming support requests into 3 support tiers:
- `tier1`: High-confidence AI response (auto-resolved)
- `tier2`: AI draft + human agent review
- `tier3`: Full escalation to specialist/human support

It supports two interaction styles:
- Ticket mode (`/submit-ticket`) for one-shot support requests
- Conversation mode (`/conversation/*`) for ongoing chat threads between user, AI, and agent

The system continuously improves by storing agent-resolved outcomes into the vector memory.

## Tech Stack

- Backend: FastAPI, Pydantic, Uvicorn
- Frontend: React 18, Vite
- AI APIs: Groq (OpenAI-compatible client), SambaNova (sentiment)
- Vector Store: ChromaDB + sentence-transformers embeddings (`all-MiniLM-L6-v2`)

## Project Structure

```text
optisolve/
  backend/
    main.py                    # FastAPI app, router mounting, CORS, startup seeding
    config.py                  # app settings
    routes/                    # HTTP endpoints (tickets, agents, conversations)
    services/                  # AI analysis, routing logic, sentiment analysis
    database/                  # in-memory stores for tickets/conversations
    models/                    # Pydantic request/response/domain models
    utils/knowledge_base.py    # Chroma client, collection, seed data
  chroma_db/                   # persistent Chroma vector database files
  frontend/
    src/App.jsx                # user + agent portal UI
    src/api.js                 # frontend API client
```

## How It Works

### 1) Inference + Retrieval

When a user submits text:
1. `analyze_ticket()` retrieves similar support examples from Chroma.
2. A confidence score is computed from retrieval quality and consistency.
3. Similarity with previously resolved conversations can boost confidence.
4. A draft reply is generated with Groq (`llama-3.3-70b-versatile`).

### 2) Sentiment-Aware Routing

Sentiment is computed using SambaNova and merged with confidence in `routing_logic()`:
- Very negative sentiment (`<= -0.7`) reduces confidence by `0.2`
- Final confidence thresholds:
  - `>= 0.85` -> `tier1`
  - `>= 0.60` and `< 0.85` -> `tier2`
  - `< 0.60` -> `tier3`

### 3) Human-in-the-Loop Learning

When agents resolve requests:
- Ticket resolutions are stored as `agent_resolution` entries in Chroma.
- Resolved conversations are stored as:
  - conversation summaries (`resolved_conversation`)
  - high-signal user->agent turn chunks (`agent_turn`)

This enables retrieval of better context in future requests.

## Backend Design (Important)

### API Modules

- `ticket_routes.py`
  - Submit ticket
  - Get ticket status
- `agent_routes.py`
  - View agent/admin queues
  - Submit final agent response
  - Dashboard metrics
- `conversation_routes.py`
  - Start conversation
  - Post user/agent messages
  - Resolve conversation
  - Conversation metrics

### Service Layer

- `ai_service.py`
  - RAG retrieval from Chroma
  - Draft generation via Groq
  - Memory write-back for resolved outcomes
- `sentiment_service.py`
  - External sentiment scoring (`-1` to `1`)
- `routing_service.py`
  - Tier decision logic from confidence + sentiment

### Data Layer

- `ticket_store.py`: in-memory ticket store (`dict[int, Ticket]`)
- `conversation_store.py`: in-memory conversation/message store

Note: Ticket and conversation stores are currently in-memory. Restarting backend will clear runtime ticket/conversation state. Vector memory in `chroma_db/` persists.

## Environment Variables

Create a `.env` file at project root:

```env
GROQ_API_KEY=your_groq_api_key
SAMBANOVA_API_KEY=your_sambanova_api_key
```

Required because:
- Groq key is used in `ai_service.py`
- SambaNova key is used in `sentiment_service.py`

## Run Locally

### 1) Backend Setup

From project root:

```bash
python -m venv .venv
# Windows PowerShell
.\.venv\Scripts\Activate.ps1

pip install -r requirements.txt
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Backend health check:

- `GET http://localhost:8000/health` -> `{ "status": "ok" }`

On startup, the backend seeds Chroma once if the collection is empty.

### 2) Frontend Setup

In a new terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:
- `http://localhost:5173`

By default frontend API target:
- `http://localhost:8000`

To override backend URL, create `frontend/.env`:

```env
VITE_API_BASE_URL=http://YOUR_HOST:8000
```

## Core API Endpoints

### Conversation Flow

- `POST /conversation/start`
- `GET /conversation/user/{username}`
- `POST /conversation/{conversation_id}/message`
- `GET /conversation/{conversation_id}/history`
- `GET /agent/conversations`
- `POST /agent/conversation/{conversation_id}/reply`
- `POST /agent/conversation/{conversation_id}/resolve`
- `GET /conversation-metrics`

### Ticket Flow

- `POST /submit-ticket`
- `GET /ticket-status/{ticket_id}`
- `GET /agent-tickets`
- `GET /admin-tickets`
- `POST /agent-response`
- `GET /dashboard-metrics`

FastAPI interactive docs:
- `http://localhost:8000/docs`

## Typical User Journey

1. User starts a conversation or submits a ticket.
2. AI analyzes the text with retrieval context from Chroma.
3. Sentiment and confidence determine tier.
4. Tier behavior:
   - `tier1`: AI responds directly.
   - `tier2`: AI suggests draft, agent finalizes.
   - `tier3`: escalated to specialist workflow.
5. Resolved human responses are stored to improve future retrieval.

## Current Limitations

- Ticket and conversation runtime stores are in-memory (non-persistent across backend restarts).
- External API keys are required for full AI + sentiment behavior.
- Debug `print()` statements are present in some routes/services.

## Why This Architecture

This architecture balances speed, quality, and safety:
- AI handles repetitive high-confidence support quickly.
- Human agents step in for ambiguous or high-risk cases.
- Every resolved case can become future retrieval context, improving performance over time.

## Team/Project Highlights

- Tiered support automation with confidence + sentiment fusion
- Human-in-the-loop correction and learning loop
- Conversation memory compression (summaries + turn chunks)
- Clear separation of routes, services, stores, and models for maintainability
