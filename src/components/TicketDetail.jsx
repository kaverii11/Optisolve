import { Clock, AlertTriangle, MoreHorizontal, Send, Loader2 } from "lucide-react";
import AICoPilotPanel from "./AICoPilotPanel";

function MessageBubble({ message }) {
    const isUser = message.from === "user";
    return (
        <div className={`flex gap-3 ${isUser ? "" : "flex-row-reverse"}`}>
            <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${isUser
                        ? "bg-slate-200 text-slate-600"
                        : "bg-blue-600 text-white"
                    }`}
            >
                {message.name
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
            </div>
            <div className={`flex-1 max-w-[85%] ${isUser ? "" : "text-right"}`}>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-slate-700">
                        {message.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{message.time}</span>
                    {message.sentiment === "angry" && (
                        <span className="flex items-center gap-1 text-[10px] font-medium text-red-600 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
                            <AlertTriangle size={10} />
                            Angry
                        </span>
                    )}
                </div>
                <div
                    className={`inline-block text-sm leading-relaxed px-4 py-3 rounded-2xl ${isUser
                            ? "bg-white border border-slate-200 text-slate-700 rounded-tl-sm"
                            : "bg-blue-600 text-white rounded-tr-sm"
                        }`}
                >
                    {message.text}
                </div>
            </div>
        </div>
    );
}

export default function TicketDetail({ ticket, liveAI, aiLoading, aiError }) {
    if (!ticket) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                Select a ticket to view details
            </div>
        );
    }

    const badgeColor = {
        red: "bg-red-50 text-red-700 border-red-200",
        orange: "bg-amber-50 text-amber-700 border-amber-200",
        green: "bg-emerald-50 text-emerald-700 border-emerald-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
    };

    // Use live API data when available, fall back to mock data
    const aiData = liveAI || ticket.ai;

    return (
        <div className="flex-1 flex flex-col min-w-0 bg-white">
            {/* Header */}
            <div className="shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-lg font-semibold text-slate-800">
                                Ticket #{ticket.id}: {ticket.snippet}
                            </h2>
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                            <span className="text-sm text-slate-500">by {ticket.user}</span>
                            <span className="flex items-center gap-1 text-xs text-slate-400">
                                <Clock size={12} />
                                {ticket.timestamp}
                            </span>
                        </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer">
                        <MoreHorizontal size={18} />
                    </button>
                </div>

                {/* Badge row */}
                <div className="flex flex-wrap gap-2 mt-3">
                    {ticket.badges.map((badge) => (
                        <span
                            key={badge.label}
                            className={`text-[11px] font-medium px-2.5 py-1 rounded-full border ${badgeColor[badge.color] || ""}`}
                        >
                            {badge.label}
                        </span>
                    ))}
                </div>
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

                {!aiLoading && !aiError && aiData && (
                    <AICoPilotPanel ai={aiData} isLive={!!liveAI} />
                )}
            </div>

            {/* Reply bar */}
            <div className="shrink-0 px-6 py-3 border-t border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type a reply or use AI draft…"
                        className="flex-1 px-4 py-2.5 text-sm rounded-xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    />
                    <button className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-200 cursor-pointer">
                        <Send size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
}
