import { Shield, Bell, Sparkles, Building2, Wallet, Users } from "lucide-react";

export default function Settings() {
  const tabs = [
    { id: "general", label: "General", icon: Building2, active: true },
    { id: "ai", label: "AI & Routing", icon: Sparkles },
    { id: "team", label: "Team", icon: Users },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "security", label: "Security", icon: Shield },
    { id: "billing", label: "Billing", icon: Wallet },
  ];

  return (
    <div className="flex-1 overflow-y-auto bg-bg-main flex custom-scrollbar">
      <div className="w-64 border-r border-border-subtle bg-bg-sidebar p-6 flex flex-col gap-1 shrink-0">
        <h2 className="text-lg font-semibold text-text-primary mb-4 px-2 tracking-tight">Settings</h2>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer
              ${tab.active 
                ? "bg-[#1E293B] text-accent font-semibold" 
                : "text-text-secondary hover:bg-[#1E293B]/50 hover:text-text-primary"
              }`}
          >
            <tab.icon size={18} className={tab.active ? "text-accent" : "text-text-muted"} />
            {tab.label}
          </button>
        ))}
      </div>
      
      <div className="flex-1 p-10 max-w-4xl">
        <div className="card-base overflow-hidden mb-6">
          <div className="p-6 border-b border-border-subtle bg-bg-sidebar/50">
            <h3 className="text-xl font-semibold text-text-primary tracking-tight">General Profile</h3>
            <p className="text-sm text-text-secondary mt-1">Manage your workspace details and preferences.</p>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Workspace Name</label>
                <input 
                  type="text" 
                  defaultValue="Acme Corp Support"
                  className="w-full max-w-md px-4 py-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium placeholder:text-text-muted"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Support Email</label>
                <input 
                  type="email" 
                  defaultValue="support@acme.com"
                  className="w-full max-w-md px-4 py-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all font-medium placeholder:text-text-muted"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-primary mb-1.5">Timezone</label>
                <select className="w-full max-w-md px-4 py-2.5 bg-bg-sidebar border border-border-subtle rounded-xl text-sm text-text-primary focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all cursor-pointer font-medium appearance-none">
                  <option>America/Los_Angeles (PST)</option>
                  <option>America/New_York (EST)</option>
                  <option>Europe/London (GMT)</option>
                </select>
              </div>
            </div>

            <div className="pt-6 border-t border-border-subtle flex justify-start">
              <button className="btn-primary px-6 py-2.5 text-sm">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
