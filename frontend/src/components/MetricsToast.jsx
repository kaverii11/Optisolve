import { TrendingUp, X } from "lucide-react";
import { useState } from "react";

export default function MetricsToast() {
    const [visible, setVisible] = useState(true);
    if (!visible) return null;

    return (
        <div className="fixed bottom-5 right-5 z-50 animate-[slideUp_0.4s_ease-out]">
            <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-xl border border-slate-200 shadow-lg shadow-slate-200/50">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                    <TrendingUp size={16} className="text-emerald-600" />
                </div>
                <div>
                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        MTTR Deflection
                    </p>
                    <p className="text-sm font-bold text-slate-800">
                        12 mins <span className="font-normal text-slate-500">saved today</span>
                    </p>
                </div>
                <button
                    onClick={() => setVisible(false)}
                    className="ml-2 p-1 rounded-md hover:bg-slate-100 text-slate-400 cursor-pointer"
                >
                    <X size={14} />
                </button>
            </div>

            <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
        </div>
    );
}
