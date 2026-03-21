import { Zap, Activity } from "lucide-react";

export default function Analytics() {
  return (
    <div className="flex-1 overflow-y-auto bg-bg-main p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-text-primary tracking-tight">Analytics</h1>
            <p className="text-text-secondary mt-2">Deep dive into AI deflection and sentiment trends.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary px-4 py-2 text-sm font-medium">Last 7 days</button>
            <button className="btn-secondary px-4 py-2 text-sm font-medium">Export CSV</button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="card-base card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary tracking-tight">AI Confidence Impact</h3>
              <Zap className="text-warning" size={20} />
            </div>
            <div className="flex items-center justify-center h-72 text-text-muted border-2 border-dashed border-border-subtle rounded-xl bg-bg-sidebar/50">
               Confidence Distribution Chart
            </div>
          </div>
          
          <div className="card-base card-hover p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-text-primary tracking-tight">Customer Sentiment Trends</h3>
              <Activity className="text-accent" size={20} />
            </div>
            <div className="flex items-center justify-center h-72 text-text-muted border-2 border-dashed border-border-subtle rounded-xl bg-bg-sidebar/50">
               Sentiment Analysis Chart
            </div>
          </div>
        </div>

        <div className="card-base p-6">
           <h3 className="text-lg font-semibold text-text-primary mb-6 tracking-tight">Top Deflected Categories</h3>
           <div className="space-y-4">
              {[
                { name: "Password Resets", count: 124, progress: "85%" },
                { name: "Billing Inquiry", count: 89, progress: "60%" },
                { name: "Feature Request", count: 45, progress: "35%" },
                { name: "Bug Report", count: 12, progress: "15%" },
              ].map((cat, i) => (
                <div key={i} className="flex items-center gap-4 group">
                  <div className="w-48 text-sm font-medium text-text-primary group-hover:text-accent transition-colors">{cat.name}</div>
                  <div className="flex-1 h-2.5 bg-border-subtle rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-accent to-[#3B82F6] rounded-full group-hover:scale-[1.01] transition-transform origin-left" style={{ width: cat.progress }}></div>
                  </div>
                  <div className="w-12 text-right text-sm text-text-secondary font-medium">{cat.count}</div>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
