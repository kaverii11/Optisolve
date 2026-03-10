const colorMap = {
    red: "bg-red-50 text-red-700 border border-red-200",
    orange: "bg-amber-50 text-amber-700 border border-amber-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    blue: "bg-blue-50 text-blue-700 border border-blue-200",
};

const statusDot = {
    urgent: "bg-red-500",
    active: "bg-emerald-500",
    pending: "bg-amber-400",
};

export default function TicketCard({ ticket, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-xl border cursor-pointer transition-all duration-200
        ${selected
                    ? "bg-blue-50/80 border-blue-200 shadow-sm shadow-blue-100 ring-1 ring-blue-200"
                    : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-sm"
                }`}
        >
            {/* Top row: avatar + name + status dot */}
            <div className="flex items-center gap-3 mb-2">
                <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0
            ${selected ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"}`}
                >
                    {ticket.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-slate-800 truncate">
                            {ticket.user}
                        </span>
                        <span
                            className={`w-2 h-2 rounded-full shrink-0 ${statusDot[ticket.status] || "bg-slate-300"}`}
                        />
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                        #{ticket.id} · {ticket.snippet}
                    </p>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-1.5 mt-2">
                {ticket.badges.map((badge) => (
                    <span
                        key={badge.label}
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorMap[badge.color] || ""}`}
                    >
                        {badge.label}
                    </span>
                ))}
            </div>
        </button>
    );
}
