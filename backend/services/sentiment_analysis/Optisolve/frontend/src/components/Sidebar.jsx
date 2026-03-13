import {
    LayoutDashboard,
    Ticket,
    BarChart3,
    Settings,
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Ticket, label: "Active Tickets", active: true },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
];

export default function Sidebar() {
    return (
        <aside className="w-[68px] bg-slate-900 flex flex-col items-center py-6 justify-between shrink-0">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-sm">OS</span>
                </div>
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col items-center gap-2 flex-1">
                {navItems.map(({ icon: Icon, label, active }) => (
                    <button
                        key={label}
                        title={label}
                        className={`relative w-10 h-10 rounded-xl flex items-center justify-center group cursor-pointer
              ${active
                                ? "bg-blue-600/20 text-blue-400"
                                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                            }`}
                    >
                        {active && (
                            <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-blue-400 rounded-r-full -ml-[5px]" />
                        )}
                        <Icon size={20} strokeWidth={1.8} />
                    </button>
                ))}
            </nav>

            {/* Agent Avatar */}
            <div className="mt-auto">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold shadow-lg shadow-emerald-500/20 cursor-pointer ring-2 ring-slate-700 hover:ring-emerald-400/50">
                    KS
                </div>
            </div>
        </aside>
    );
}
