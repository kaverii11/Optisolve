import { Search, SlidersHorizontal, Plus } from "lucide-react";
import TicketCard from "./TicketCard";

export default function TicketQueue({ tickets, selectedId, onSelect, onSimulate }) {
    return (
        <div className="w-[340px] shrink-0 border-r border-border-subtle bg-bg-sidebar/30 flex flex-col z-0">
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-text-primary tracking-tight">
                            Ticket Queue
                        </h2>
                        <p className="text-xs text-text-secondary mt-0.5">
                            {tickets.length} active tickets
                        </p>
                    </div>
                    <button className="p-2 rounded-xl hover:bg-bg-card text-text-secondary hover:text-text-primary transition-colors cursor-pointer">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
                    />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-xl bg-bg-card border border-border-subtle text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-accent focus:border-accent transition-all"
                    />
                </div>

                {/* Simulate Ticket Button */}
                <button
                    onClick={onSimulate}
                    className="btn-primary w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium cursor-pointer"
                >
                    <Plus size={16} strokeWidth={2.5} />
                    Simulate Ticket
                </button>
            </div>

            {/* Ticket List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-3 pb-4 space-y-2">
                {tickets.map((ticket) => (
                    <TicketCard
                        key={ticket.id}
                        ticket={ticket}
                        selected={ticket.id === selectedId}
                        onClick={() => onSelect(ticket.id)}
                    />
                ))}
            </div>
        </div>
    );
}
