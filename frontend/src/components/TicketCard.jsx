const colorMap = {
    red: "pill-angry",
    orange: "pill-neutral",
    green: "pill-positive",
    blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20 px-2.5 py-1 rounded-full text-xs font-semibold",
};

const statusDot = {
    urgent: "bg-error",
    active: "bg-success",
    pending: "bg-warning",
};

export default function TicketCard({ ticket, selected, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left p-4 rounded-2xl cursor-pointer transition-all duration-200 border
        ${selected
                    ? "bg-[#1E293B] border-accent shadow-[0_0_15px_rgba(99,102,241,0.15)] ring-1 ring-accent"
                    : "bg-bg-card border-border-subtle hover:border-text-muted hover:shadow-lg hover:-translate-y-[1px]"
                }`}
        >
            {/* Top row: avatar + name + status dot */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 shadow-sm
            ${selected ? "bg-gradient-to-br from-accent to-blue-500 text-white" : "bg-bg-sidebar border border-border-subtle text-text-secondary"}`}
                >
                    {ticket.avatar}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-[13px] text-text-primary truncate tracking-tight">
                            {ticket.user}
                        </span>
                        <span
                            className={`w-2 h-2 rounded-full shrink-0 ${statusDot[ticket.status] || "bg-text-muted"}`}
                        />
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                        #{ticket.id} · {ticket.snippet}
                    </p>
                </div>
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mt-2">
                {ticket.badges.map((badge) => (
                    <span
                        key={badge.label}
                        className={colorMap[badge.color] || "text-[10px] font-medium px-2 py-0.5 rounded-full bg-bg-sidebar text-text-secondary"}
                    >
                        {badge.label}
                    </span>
                ))}
            </div>
        </button>
    );
}
