import {
    LayoutDashboard,
    Ticket,
    BarChart3,
    Settings,
} from "lucide-react";

const navItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Ticket, label: "Active Tickets" },
    { icon: BarChart3, label: "Analytics" },
    { icon: Settings, label: "Settings" },
];

export default function Sidebar({ activeTab, onTabChange }) {
    return (
        <aside className="w-[68px] bg-bg-sidebar flex flex-col items-center py-6 justify-between shrink-0 border-r border-border-subtle z-10">
            {/* Logo */}
            <div className="mb-8">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <span className="text-white font-bold text-sm">OS</span>
                </div>
            </div>

            {/* Nav Icons */}
            <nav className="flex flex-col items-center gap-2 flex-1">
                {navItems.map(({ icon: Icon, label }) => {
                    const active = label === activeTab;
                    return (
                        <button
                            key={label}
                            title={label}
                            onClick={() => onTabChange(label)}
                            className={`relative w-10 h-10 flex items-center justify-center group cursor-pointer transition-all duration-200
                  ${active
                                    ? "bg-[#1E293B] text-accent border-l-[4px] border-accent"
                                    : "text-text-secondary hover:text-text-primary hover:bg-[#243044]"
                                }`}
                        >

                            <Icon size={20} strokeWidth={1.8} />
                        </button>
                    );
                })}
            </nav>

            {/* Agent Avatar */}
            <div className="mt-auto">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xs font-semibold shadow-[0_4px_10px_rgba(16,185,129,0.3)] cursor-pointer ring-2 ring-border-subtle hover:ring-emerald-400/50 transition-all duration-200 hover:-translate-y-[1px]">
                    KS
                </div>
            </div>
        </aside>
    );
}
