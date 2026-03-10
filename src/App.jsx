import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import TicketQueue from "./components/TicketQueue";
import TicketDetail from "./components/TicketDetail";
import MetricsToast from "./components/MetricsToast";
import SimulateTicketDrawer from "./components/SimulateTicketDrawer";
import { tickets as initialTickets } from "./data/tickets";
import { analyzeTicket } from "./services/api";

let nextId = 5000;

export default function App() {
  const [tickets, setTickets] = useState(initialTickets);
  const [selectedId, setSelectedId] = useState(initialTickets[0].id);
  const [liveAI, setLiveAI] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const selectedTicket = tickets.find((t) => t.id === selectedId) || null;

  // Fetch live AI analysis whenever the selected ticket changes
  useEffect(() => {
    if (!selectedTicket) return;

    const lastUserMsg = [...selectedTicket.messages]
      .reverse()
      .find((m) => m.from === "user");

    if (!lastUserMsg) return;

    let cancelled = false;
    setAiLoading(true);
    setAiError(null);
    setLiveAI(null);

    analyzeTicket(selectedTicket.id, lastUserMsg.text)
      .then((data) => {
        if (!cancelled) {
          setLiveAI({
            baseRetrieval: data.base_retrieval_match,
            sentimentModifier: data.sentiment_modifier,
            finalScore: data.final_score,
            status: data.routing_decision,
            draft: data.ai_draft,
          });
        }
      })
      .catch((err) => {
        if (!cancelled) setAiError(err.message);
      })
      .finally(() => {
        if (!cancelled) setAiLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  // Handle simulated ticket submission
  async function handleSimulateSubmit({ name, category, message }) {
    const id = nextId++;
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    // Call backend to get AI routing
    const data = await analyzeTicket(id, message);

    // Determine badge from routing decision
    const badges = [];
    if (data.routing_decision.includes("Escalated")) {
      badges.push({ label: "Sentiment Penalty applied", color: "red" });
      badges.push({ label: "Requires Approval", color: "orange" });
    } else if (data.routing_decision.includes("Approval")) {
      badges.push({ label: "Requires Approval", color: "orange" });
    } else {
      badges.push({ label: "Auto-Resolved", color: "green" });
    }

    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
    const timestamp = `${now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })} · ${time}`;

    const polarity =
      data.sentiment_modifier < -20
        ? "angry"
        : data.sentiment_modifier < 0
          ? "frustrated"
          : "neutral";

    const newTicket = {
      id,
      user: name,
      avatar: initials,
      snippet: `${category} — ${message.slice(0, 40)}…`,
      status:
        data.routing_decision.includes("Escalated")
          ? "urgent"
          : data.routing_decision.includes("Approval")
            ? "pending"
            : "active",
      badges,
      timestamp,
      messages: [
        {
          from: "user",
          name,
          time,
          text: message,
          sentiment: polarity,
        },
      ],
      ai: {
        baseRetrieval: data.base_retrieval_match,
        sentimentModifier: data.sentiment_modifier,
        finalScore: data.final_score,
        status: data.routing_decision,
        draft: data.ai_draft,
      },
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedId(id);
  }

  return (
    <div className="h-screen w-screen flex bg-white font-sans text-slate-800 antialiased">
      <Sidebar />
      <TicketQueue
        tickets={tickets}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onSimulate={() => setDrawerOpen(true)}
      />
      <TicketDetail
        ticket={selectedTicket}
        liveAI={liveAI}
        aiLoading={aiLoading}
        aiError={aiError}
      />
      <MetricsToast />
      <SimulateTicketDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSubmit={handleSimulateSubmit}
      />
    </div>
  );
}
