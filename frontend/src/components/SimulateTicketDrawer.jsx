import { useState } from "react";
import { X, Loader2, Send, ChevronDown } from "lucide-react";

const categories = ["Login", "Billing", "Technical Bug", "Other"];

const defaultForm = {
    name: "Jane Smith",
    category: "Login",
    message: "",
};

export default function SimulateTicketDrawer({ open, onClose, onSubmit }) {
    const [form, setForm] = useState(defaultForm);
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    function handleChange(field, value) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.message.trim()) return;

        setSubmitting(true);
        try {
            await onSubmit({
                name: form.name.trim() || "Jane Smith",
                category: form.category,
                message: form.message.trim(),
            });
            setForm(defaultForm);
            onClose();
        } catch {
            // keep drawer open on error
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] animate-[fadeIn_0.2s_ease-out]"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className="fixed top-0 right-0 z-50 h-screen w-full max-w-md flex flex-col bg-white border-l border-slate-200 shadow-2xl shadow-slate-300/50 animate-[slideIn_0.25s_ease-out]">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            Simulate Live Customer Ticket
                        </h2>
                        <p className="text-xs text-slate-400 mt-0.5">
                            Submit a ticket to the AI Routing Engine
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-y-auto">
                    <div className="flex-1 px-6 py-5 space-y-5">
                        {/* Customer Name */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Customer Name
                            </label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="Jane Smith"
                                className="w-full px-4 py-2.5 text-sm rounded-xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                            />
                        </div>

                        {/* Issue Category */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Issue Category
                            </label>
                            <div className="relative">
                                <select
                                    value={form.category}
                                    onChange={(e) => handleChange("category", e.target.value)}
                                    className="w-full appearance-none px-4 py-2.5 pr-10 text-sm rounded-xl bg-white border border-slate-200 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 cursor-pointer"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {cat}
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown
                                    size={16}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
                                />
                            </div>
                        </div>

                        {/* Customer Message */}
                        <div className="flex-1 flex flex-col">
                            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                                Customer Message
                            </label>
                            <textarea
                                value={form.message}
                                onChange={(e) => handleChange("message", e.target.value)}
                                rows={7}
                                placeholder="Type a highly frustrated message here to test the AI sentiment penalty..."
                                className="w-full flex-1 px-4 py-3 text-sm rounded-xl bg-white border border-slate-200 text-slate-700 placeholder:text-slate-400 leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
                            />
                            <p className="text-[11px] text-slate-400 mt-2">
                                💡 Tip: Try angry language to trigger a high sentiment penalty and escalation routing.
                            </p>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="shrink-0 px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="px-4 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:border-slate-300 shadow-sm cursor-pointer disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || !form.message.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-md shadow-blue-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    AI Analyzing Intent &amp; Sentiment…
                                </>
                            ) : (
                                <>
                                    <Send size={15} />
                                    Submit to AI Routing Engine
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
        </>
    );
}
