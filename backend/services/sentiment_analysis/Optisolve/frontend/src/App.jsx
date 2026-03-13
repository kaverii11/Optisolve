import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import TicketQueue from "./components/TicketQueue";
import TicketDetail from "./components/TicketDetail";
import MetricsToast from "./components/MetricsToast";
import SimulateTicketDrawer from "./components/SimulateTicketDrawer";
import { tickets as initialTickets } from "./data/tickets";
import { submitTicket, getAgentTickets } from "./services/api";

let nextId = 5000;

function mapAgentTicketToUi(agentTicket) {
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

  return {
    id: agentTicket.ticket_id,
    backendId: agentTicket.ticket_id,
    user: "Customer",
    avatar: "C",
    snippet: agentTicket.text.slice(0, 60),
    status: "pending",
    badges: [{ label: "Waiting for human agent", color: "orange" }],
    timestamp,
    messages: [
      {
        from: "user",
        name: "Customer",
        time,
        text: agentTicket.text,
        sentiment: "neutral",
      },
    ],
    ai: {
      baseRetrieval: agentTicket.confidence,
      sentimentModifier: 0,
      finalScore: agentTicket.confidence,
      status: "Waiting for agent",
      draft: agentTicket.draft_reply,
    },
  };
}

export default function App() {
  const [tickets, setTickets] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [liveAI, setLiveAI] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [queueLoading, setQueueLoading] = useState(false);
  const [queueError, setQueueError] = useState(null);

  const selectedTicket = tickets.find((t) => t.id === selectedId) || null;

  function handleTicketResolved(backendId, finalReply) {
    const now = new Date();
    const time = now.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    setTickets((prev) =>
      prev.map((ticket) => {
        if (ticket.backendId === backendId || ticket.id === backendId) {
          return {
            ...ticket,
            status: "resolved",
            badges: [{ label: "Resolved", color: "green" }],
            messages: [
              ...ticket.messages,
              {
                from: "agent",
                name: "Support Agent",
                time,
                text: finalReply,
                sentiment: "neutral",
              },
            ],
          };
        }
        return ticket;
      })
    );
  }

  async function refreshAgentQueue() {
    setQueueLoading(true);
    setQueueError(null);
    try {
      const data = await getAgentTickets();
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapAgentTicketToUi);
        setTickets(mapped);
        setSelectedId((prev) => prev ?? mapped[0].id);
      } else if (!tickets.length) {
        // If backend queue is empty and we have no tickets yet, fall back to seeded demo data
        setTickets(initialTickets);
        setSelectedId(initialTickets[0]?.id ?? null);
      }
    } catch (err) {
      setQueueError(err.message);
      if (!tickets.length) {
        setTickets(initialTickets);
        setSelectedId(initialTickets[0]?.id ?? null);
      }
    } finally {
      setQueueLoading(false);
    }
  }

  useEffect(() => {
    refreshAgentQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle simulated ticket submission
  async function handleSimulateSubmit({ name, category, message }) {
    const id = nextId++;
    const initials = name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

    // Call backend to submit ticket and get routing tier
    setAiLoading(true);
    setAiError(null);
    setLiveAI(null);

    let tier;
    let backendTicketId = null;
    let autoReply = null;

    try {
      const data = await submitTicket(message);
      tier = data.tier;

      if (tier === "tier1") {
        autoReply = data.reply;
      } else {
        backendTicketId = data.ticket_id;
      }
    } catch (err) {
      setAiError(err.message);
      setAiLoading(false);
      return;
    }

    // Build a new ticket card in the UI so the simulation is always visible
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

    const badges = [];
    let status = "active";

    if (tier === "tier1") {
      badges.push({ label: "Auto-Resolved by AI", color: "green" });
      status = "active";
    } else if (tier === "tier2") {
      badges.push({ label: "Waiting for human agent", color: "orange" });
      status = "pending";
    } else if (tier === "tier3") {
      badges.push({ label: "Escalated to specialist", color: "red" });
      status = "urgent";
    }

    const newTicket = {
      id,
      backendId: backendTicketId,
      user: name,
      avatar: initials,
      snippet: `${category} — ${message.slice(0, 40)}…`,
      status,
      badges,
      timestamp,
      messages: [
        {
          from: "user",
          name,
          time,
          text: message,
          sentiment: "neutral",
        },
        ...(autoReply
          ? [
              {
                from: "agent",
                name: "OptiSolve AI",
                time,
                text: autoReply,
                sentiment: "neutral",
              },
            ]
          : []),
      ],
      ai: null,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setSelectedId(id);

    setAiLoading(false);
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
        onTicketResolved={handleTicketResolved}
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
