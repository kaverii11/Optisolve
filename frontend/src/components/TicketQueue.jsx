import { Search, SlidersHorizontal, Plus } from "lucide-react";
import TicketCard from "./TicketCard";

export default function TicketQueue({ tickets, selectedId, onSelect, onSimulate }) {
    return (
        <div className="w-[340px] shrink-0 border-r border-slate-200 bg-slate-50/50 flex flex-col">
            {/* Header */}
            <div className="px-5 pt-5 pb-3">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            Ticket Queue
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            {tickets.length} active tickets
                        </p>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-600 cursor-pointer">
                        <SlidersHorizontal size={16} />
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                        type="text"
                        placeholder="Search tickets..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                    />
                </div>

                {/* Simulate Ticket Button */}
                <button
                    onClick={onSimulate}
                    className="w-full mt-3 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl hover:from-indigo-700 hover:to-blue-700 shadow-md shadow-indigo-200 cursor-pointer"
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
