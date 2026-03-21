import { useState } from "react";
import { Sparkles, CheckCircle2, PenLine, ChevronDown, ChevronUp, Info, RefreshCcw, KeyRound, Banknote, AlertTriangle } from "lucide-react";

function ConfidenceBar({ label, value, gradientClasses }) {
    return (
        <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-text-secondary">{label}</span>
                <span className={`text-xs font-bold text-text-primary`}>{value > 0 ? "" : ""}{value}%</span>
            </div>
            <div className="h-2 bg-bg-main rounded-full overflow-hidden border border-border-subtle/50">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${gradientClasses}`}
                    style={{ width: `${Math.abs(value)}%` }}
                />
            </div>
        </div>
    );
}

export default function AICoPilotPanel({ ai, isLive = false }) {
    const [showReasoning, setShowReasoning] = useState(false);

    const scoreColor =
        ai.finalScore >= 80
            ? "text-emerald-400"
            : ai.finalScore >= 50
                ? "text-amber-400"
                : "text-red-400";

    const statusBg =
        ai.status?.includes("Escalated")
            ? "bg-error/10 text-error border-error/20"
            : ai.status?.includes("Auto-Resolved")
                ? "bg-success/10 text-success border-success/20"
                : ai.status?.includes("Approval")
                    ? "bg-warning/10 text-warning border-warning/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20";

    return (
        <div className="bg-gradient-to-br from-[#1E293B] to-[#111827] rounded-2xl border border-accent/20 p-6 mt-5 card-hover relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/20 rounded-full blur-3xl pointer-events-none" />

            {/* Panel Header */}
            <div className="flex items-center gap-3 mb-5 relative z-10">
                <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-accent/10 border border-accent/20">
                    <Sparkles size={16} className="text-accent" />
                </div>
                <h3 className="text-sm font-semibold text-text-primary tracking-tight">AI Co-Pilot</h3>
                {isLive && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                        Live
                    </span>
                )}
                <span className={`ml-auto text-[10px] font-semibold px-3 py-1.5 rounded-full border uppercase tracking-wider ${statusBg}`}>
                    {ai.status}
                </span>
            </div>

            {/* Confidence Breakdown */}
            <div className="bg-bg-main/50 rounded-xl border border-border-subtle p-5 mb-5 relative z-10">
                <div className="flex items-center justify-between mb-4">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        AI Confidence Breakdown
                    </p>
                    <div className="bg-bg-sidebar border border-border-subtle px-2 py-1 rounded-md flex items-center gap-1.5">
                        <span className="text-[10px] font-medium text-text-secondary uppercase">Confidence:</span>
                        <span className={`text-[11px] font-bold ${scoreColor}`}>{ai.finalScore}%</span>
                    </div>
                </div>
                
                <div className="flex flex-wrap gap-5">
                    <ConfidenceBar
                        label="Base Retrieval Match"
                        value={ai.baseRetrieval}
                        gradientClasses="bg-gradient-to-r from-emerald-500 to-emerald-400"
                    />
                    <ConfidenceBar
                        label="Sentiment Modifier"
                        value={ai.sentimentModifier}
                        gradientClasses="bg-gradient-to-r from-red-500 to-red-400"
                    />
                    <div className="flex-1 min-w-[140px]">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-semibold text-text-secondary">Final Score</span>
                            <span className={`text-xs font-bold ${scoreColor}`}>{ai.finalScore}%</span>
                        </div>
                        <div className="h-2.5 bg-bg-main rounded-full overflow-hidden border border-border-subtle/50">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${ai.finalScore >= 80
                                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400"
                                    : ai.finalScore >= 50
                                        ? "bg-gradient-to-r from-amber-500 to-amber-400"
                                        : "bg-gradient-to-r from-red-500 to-red-400"
                                    }`}
                                style={{ width: `${ai.finalScore}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Expendable Reasoning Toggle */}
                <button 
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="mt-4 flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent-hover transition-colors cursor-pointer"
                >
                    <Info size={14} />
                    Why this response?
                    {showReasoning ? <ChevronUp size={14} className="ml-0.5" /> : <ChevronDown size={14} className="ml-0.5" />}
                </button>

                {/* Expandable Explanation Panel */}
                {showReasoning && (
                    <div className="mt-3 p-3 bg-bg-sidebar rounded-lg border border-border-subtle text-xs text-text-secondary space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        <p><span className="font-semibold text-text-primary">Sentiment Detected:</span> Angry 😡 (Penalty applied)</p>
                        <p><span className="font-semibold text-text-primary">Keywords Matched:</span> "broken", "losing money", "fix this"</p>
                        <p><span className="font-semibold text-text-primary">Action Taken:</span> High urgency detected. Routing to Tier 2 Support with proposed apologetic draft.</p>
                    </div>
                )}
            </div>

            {/* Proposed Draft */}
            <div className="mb-5 relative z-10">
                <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                        Proposed AI Draft
                    </p>
                    <select className="bg-bg-sidebar border border-border-subtle text-xs font-medium text-text-primary rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-accent appearance-none cursor-pointer">
                        <option>Apologetic Tone</option>
                        <option>Professional Tone</option>
                        <option>Friendly Tone</option>
                        <option>Firm Tone</option>
                    </select>
                </div>
                <div className="bg-bg-sidebar rounded-xl border border-border-subtle p-5 text-sm text-text-primary leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar focus-within:ring-1 focus-within:ring-accent transition-all cursor-text selection:bg-accent/30" contentEditable suppressContentEditableWarning>
                    {ai.draft}
                </div>
            </div>

            {/* AI Action Buttons */}
            <div className="flex items-center gap-3 relative z-10">
                <button className="btn-secondary flex items-center gap-2 px-5 py-2.5 text-sm cursor-pointer">
                    <PenLine size={16} />
                    Edit Draft
                </button>
                <button className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm cursor-pointer shadow-lg shadow-accent/20">
                    <CheckCircle2 size={16} />
                    Approve &amp; Send
                </button>
            </div>

            {/* Quick Actions Panel */}
            <div className="flex flex-wrap gap-2.5 mt-5 pt-5 border-t border-border-subtle relative z-10">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar hover:bg-bg-main border border-border-subtle rounded-lg text-xs font-medium text-text-primary transition-colors cursor-pointer shadow-sm">
                    <KeyRound size={12} className="text-text-muted" /> Reset Password
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar hover:bg-bg-main border border-border-subtle rounded-lg text-xs font-medium text-text-primary transition-colors cursor-pointer shadow-sm">
                    <RefreshCcw size={12} className="text-text-muted" /> Send OTP
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-bg-sidebar hover:bg-bg-main border border-border-subtle rounded-lg text-xs font-medium text-text-primary transition-colors cursor-pointer shadow-sm">
                    <Banknote size={12} className="text-text-muted" /> Refund
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-error/10 hover:bg-error/20 border border-error/20 rounded-lg text-xs font-medium text-error transition-colors cursor-pointer ml-auto">
                    <AlertTriangle size={12} /> Escalate
                </button>
            </div>
        </div>
    );
}
