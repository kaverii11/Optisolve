import { Sparkles, ShieldAlert, TrendingDown, CheckCircle2, PenLine } from "lucide-react";

function ConfidenceBar({ label, value, color }) {
    return (
        <div className="flex-1 min-w-[140px]">
            <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-medium text-slate-600">{label}</span>
                <span className={`text-xs font-bold ${color}`}>{value > 0 ? "" : ""}{value}%</span>
            </div>
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-700 ease-out ${value >= 0
                        ? value >= 80
                            ? "bg-emerald-500"
                            : value >= 50
                                ? "bg-amber-500"
                                : "bg-red-500"
                        : "bg-red-400"
                        }`}
                    style={{ width: `${Math.abs(value)}%` }}
                />
            </div>
        </div>
    );
}

export default function AICoPilotPanel({ ai, isLive = false }) {
    const scoreColor =
        ai.finalScore >= 80
            ? "text-emerald-600"
            : ai.finalScore >= 50
                ? "text-amber-600"
                : "text-red-600";

    const statusBg =
        ai.status?.includes("Escalated")
            ? "bg-red-100 text-red-700 border-red-200"
            : ai.status?.includes("Auto-Resolved")
                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                : ai.status?.includes("Approval")
                    ? "bg-amber-100 text-amber-700 border-amber-200"
                    : "bg-blue-100 text-blue-700 border-blue-200";

    return (
        <div className="bg-gradient-to-br from-indigo-50/80 via-blue-50/50 to-sky-50/80 rounded-2xl border border-indigo-200/60 p-5 mt-5 shadow-sm">
            {/* Panel Header */}
            <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100">
                    <Sparkles size={15} className="text-indigo-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-800">AI Co-Pilot</h3>
                {isLive && (
                    <span className="flex items-center gap-1.5 text-[10px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                    </span>
                )}
                <span className={`ml-auto text-[10px] font-semibold px-2.5 py-1 rounded-full border ${statusBg}`}>
                    {ai.status}
                </span>
            </div>

            {/* Confidence Breakdown */}
            <div className="bg-white/70 backdrop-blur-sm rounded-xl border border-slate-200/60 p-4 mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    AI Confidence Breakdown
                </p>
                <div className="flex flex-wrap gap-4">
                    <ConfidenceBar
                        label="Base Retrieval Match"
                        value={ai.baseRetrieval}
                        color="text-emerald-600"
                    />
                    <ConfidenceBar
                        label="Sentiment Modifier"
                        value={ai.sentimentModifier}
                        color="text-red-500"
                    />
                    <div className="flex-1 min-w-[140px]">
                        <div className="flex items-center justify-between mb-1.5">
                            <span className="text-xs font-medium text-slate-600">Final Score</span>
                            <span className={`text-xs font-bold ${scoreColor}`}>{ai.finalScore}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${ai.finalScore >= 80
                                    ? "bg-emerald-500"
                                    : ai.finalScore >= 50
                                        ? "bg-gradient-to-r from-amber-400 to-amber-500"
                                        : "bg-gradient-to-r from-red-400 to-red-500"
                                    }`}
                                style={{ width: `${ai.finalScore}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Proposed Draft */}
            <div className="mb-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Proposed AI Draft
                </p>
                <div className="bg-white/80 rounded-xl border border-slate-200/60 p-4 text-sm text-slate-700 leading-relaxed whitespace-pre-line max-h-48 overflow-y-auto custom-scrollbar">
                    {ai.draft}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer">
                    <PenLine size={15} />
                    Edit Draft
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl hover:from-emerald-600 hover:to-green-600 shadow-md shadow-emerald-200 cursor-pointer">
                    <CheckCircle2 size={15} />
                    Approve &amp; Send
                </button>
            </div>
        </div>
    );
}
