import { useState } from "react";
import { Clock, AlertTriangle, MoreHorizontal, Send, Loader2 } from "lucide-react";
import AICoPilotPanel from "./AICoPilotPanel";
import { sendAgentResponse, getTicketStatus } from "../services/api";

function MessageBubble({ message }) {
    const isUser = message.from === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "" : "flex-row-reverse"}`}>
            <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm ${isUser
                        ? "bg-bg-sidebar border border-border-subtle text-text-secondary"
                        : "bg-gradient-to-br from-accent to-blue-500 text-white"
                    }`}
            >
                {message.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
            </div>
            <div className={`flex-1 max-w-[85%] ${isUser ? "" : "text-right"}`}>
                <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-semibold text-text-primary">
                        {message.name}
                    </span>
                    <span className="text-[11px] text-text-muted">{message.time}</span>
                    {message.sentiment === "angry" && (
                        <span className="pill-angry ml-1">
                            😡 Angry
                        </span>
                    )}
                </div>
                <div
                    className={`inline-block text-sm leading-relaxed px-4 py-3 rounded-2xl shadow-sm ${isUser
                            ? "bg-bg-sidebar border border-border-subtle text-text-primary rounded-tl-sm"
                            : "bg-gradient-to-br from-accent to-blue-600 text-white rounded-tr-sm shadow-accent/20"
                        }`}
                >
                    {message.text}
                </div>
            </div>
        </div>
    );
}

export default function TicketDetail({ ticket, liveAI, aiLoading, aiError, onTicketResolved }) {
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);
    const [localError, setLocalError] = useState(null);

    if (!ticket) {
        return (
            <div className="flex-1 flex items-center justify-center text-text-muted text-sm bg-bg-main">
                Select a ticket to view details
            </div>
        );
    }

    const badgeColor = {
        red: "pill-angry",
        orange: "pill-neutral",
        green: "pill-positive",
        blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-[10px] font-semibold",
    };

    // Use live API data when available, fall back to mock data
    const aiData = liveAI || ticket.ai;

    const hasBackendId = !!ticket.backendId || Number.isInteger(ticket.id);

    async function handleSendReply() {
        if (!replyText.trim()) return;
        if (!hasBackendId) return;

        setSending(true);
        setLocalError(null);

        const targetId = ticket.backendId ?? ticket.id;

        try {
            await sendAgentResponse(targetId, replyText.trim());

            // Poll backend status until resolved (or a few attempts)
            let finalReply = null;
            for (let i = 0; i < 5; i++) {
                const status = await getTicketStatus(targetId);
                if (status.status === "resolved") {
                    finalReply = status.reply;
                    break;
                }
                await new Promise((resolve) => setTimeout(resolve, 500));
            }

            if (onTicketResolved) {
                onTicketResolved(targetId, finalReply ?? replyText.trim());
            }

            setReplyText("");
        } catch (err) {
            setLocalError(err.message || "Failed to send response");
        } finally {
            setSending(false);
        }
    }

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-bg-main">
            {/* Header */}
            <div className="shrink-0 px-6 py-5 border-b border-border-subtle bg-bg-main flex items-start justify-between">
                <div>
                    <div className="flex items-center gap-3">
                        <h2 className="text-lg font-semibold text-text-primary tracking-tight">
                            Ticket #{ticket.id}: {ticket.snippet}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                        <span className="text-sm font-medium text-text-secondary">by {ticket.user}</span>
                        <span className="flex items-center gap-1.5 text-xs text-text-muted">
                            <Clock size={12} />
                            {ticket.timestamp}
                        </span>
                    </div>
                </div>
                
                <div className="flex items-center gap-4">
                    {ticket.status !== 'resolved' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error/10 border border-error/20 text-error font-semibold text-xs animate-pulse">
                            <Clock size={14} />
                            Respond in 4:32
                        </div>
                    )}
                    <button className="p-2 rounded-xl hover:bg-bg-sidebar text-text-muted hover:text-text-primary transition-colors cursor-pointer">
                        <MoreHorizontal size={18} />
                    </button>
                </div>
            </div>

            {/* Badge row moved directly under header context */}
            <div className="px-6 py-3 bg-bg-sidebar/30 border-b border-border-subtle flex flex-wrap gap-2">
                {ticket.badges.map((badge) => (
                    <span
                        key={badge.label}
                        className={badgeColor[badge.color] || "text-[10px] font-semibold px-2.5 py-1 rounded-full bg-bg-sidebar border border-border-subtle text-text-secondary"}
                    >
                        {badge.label}
                    </span>
                ))}
            </div>

            {/* Message History + AI Panel */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-5">
                {/* Messages */}
                <div className="space-y-4 mb-4">
                    {ticket.messages.map((msg, i) => (
                        <MessageBubble key={i} message={msg} />
                    ))}
                </div>

                {/* AI Co-Pilot Panel — loading / error / live */}
                {aiLoading && (
                    <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-sky-50/80 rounded-2xl border border-indigo-200/60 p-8 mt-5 flex flex-col items-center justify-center gap-3">
                        <Loader2 size={24} className="text-indigo-500 animate-spin" />
                        <p className="text-sm font-medium text-slate-500">
                            AI Co-Pilot analyzing ticket…
                        </p>
                    </div>
                )}

                {aiError && (
                    <div className="bg-red-50 rounded-2xl border border-red-200 p-6 mt-5 text-center">
                        <p className="text-sm font-medium text-red-700 mb-1">
                            Failed to reach AI backend
                        </p>
                        <p className="text-xs text-red-500">{aiError}</p>
                    </div>
                )}

                {localError && (
                    <div className="bg-red-50 rounded-2xl border border-red-200 p-4 mt-4 text-xs text-red-600">
                        {localError}
                    </div>
                )}

                {!aiLoading && !aiError && aiData && (
                    <AICoPilotPanel ai={aiData} isLive={!!liveAI} />
                )}
            </div>

            {/* Reply bar & Smart Suggestions */}
            <div className="shrink-0 px-6 py-4 border-t border-border-subtle bg-bg-main flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type a reply or use AI draft…"
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        disabled={sending || !hasBackendId}
                        className="flex-1 px-4 py-3 text-sm rounded-xl bg-bg-sidebar border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    />
                    <button
                        onClick={handleSendReply}
                        disabled={sending || !replyText.trim() || !hasBackendId}
                        className="btn-primary p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {sending && <Loader2 size={16} className="animate-spin" />}
                        <Send size={18} className="translate-x-[1px] translate-y-[-1px]" />
                    </button>
                </div>
                
                {/* Smart Suggestions */}
                <div className="flex gap-2">
                    <button onClick={() => setReplyText("Here is the tracking link for your order: ")} className="btn-secondary px-3 py-1.5 text-xs">
                        Tracking Link
                    </button>
                    <button onClick={() => setReplyText("I have processed a full refund for you.")} className="btn-secondary px-3 py-1.5 text-xs">
                        Full Refund
                    </button>
                    <button onClick={() => setReplyText("Could you please provide a screenshot of the issue?")} className="btn-secondary px-3 py-1.5 text-xs">
                        Request Screenshot
                    </button>
                </div>
            </div>
        </div>
    );
}
