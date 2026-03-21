import { Users, Clock, CheckCircle2, AlertCircle, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Active Tickets", value: "24", change: "+12%", trend: "up", icon: AlertCircle, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "AI Deflected", value: "156", change: "+4.2%", trend: "up", icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Avg Resolution Time", value: "14m", change: "-2.1%", trend: "down", icon: Clock, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Active Agents", value: "8", change: "0%", trend: "neutral", icon: Users, color: "text-orange-500", bg: "bg-orange-500/10" },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        <header>
          <h1 className="text-3xl font-semibold text-text-primary tracking-tight">Dashboard overview</h1>
          <p className="text-text-secondary mt-2">Monitor your support orchestration metrics and agent performance.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, i) => (
            <div key={i} className="card-base card-hover p-6 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl bg-opacity-20 ${stat.bg}`}>
                  <stat.icon size={22} className={stat.color} />
                </div>
                <div className={`flex items-center text-sm font-medium ${stat.trend === 'up' && stat.label !== 'Avg Resolution Time' ? 'text-emerald-600' : stat.trend === 'down' ? 'text-emerald-600' : 'text-slate-400'}`}>
                  {stat.change}
                  {stat.trend === 'up' ? <ArrowUpRight size={16} className="ml-1" /> : stat.trend === 'down' ? <ArrowDownRight size={16} className="ml-1" /> : null}
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-text-primary">{stat.value}</h3>
                <p className="text-sm font-medium text-text-secondary mt-1">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 card-base p-6 min-h-[400px]">
            <h3 className="text-lg font-semibold text-text-primary mb-6 tracking-tight">Ticket Volume</h3>
            <div className="flex items-center justify-center h-64 text-text-muted border-2 border-dashed border-border-subtle rounded-xl bg-bg-sidebar/50">
               Chart visualization area
            </div>
          </div>
          <div className="card-base p-6 flex flex-col">
            <h3 className="text-lg font-semibold text-text-primary mb-6 tracking-tight">Recent Activity</h3>
            <div className="space-y-6 flex-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-accent ring-4 ring-accent/20 shrink-0"></div>
                  <div>
                    <p className="text-sm font-medium text-text-primary">AI resolved ticket #{5000 + i}</p>
                    <p className="text-xs text-text-secondary mt-0.5">{i * 12} mins ago</p>
                  </div>
                </div>
              ))}
            </div>
            <button className="btn-secondary mt-4 w-full py-2.5 text-sm font-medium">
              View all activity
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
