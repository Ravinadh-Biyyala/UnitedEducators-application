import { motion } from "framer-motion";
import { X, Sparkles, BarChart, Calculator, Send, ChevronRight, ListChecks, ShieldAlert } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export function UnderwritingChat({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState([
    { role: "agent", content: "Hi Sarah. I'm reviewing the queue. How can I help with today's submissions?", type: "text" }
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const options = [
    { icon: BarChart, label: "Run appetite check", id: "appetite" },
    { icon: ListChecks, label: "Summarize red flags", id: "flags" },
    { icon: Calculator, label: "Draft quote options", id: "quote" },
  ];

  const handleOptionClick = (id: string, label: string) => {
    setMessages(prev => [...prev, { role: "user", content: label, type: "text" }]);
    
    setTimeout(() => {
      if (id === "appetite") {
        setMessages(prev => [...prev, { role: "agent", content: "Here is the appetite analysis for Riverside Unified SD:", type: "card_appetite" }]);
      } else if (id === "flags") {
        setMessages(prev => [...prev, { role: "agent", content: "I found 2 items requiring your attention:", type: "card_flags" }]);
      } else if (id === "quote") {
        setMessages(prev => [...prev, { role: "agent", content: "Here is a preliminary quote structure based on similar K-12 risks:", type: "card_quote" }]);
      }
    }, 1000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: input, type: "text" }]);
    setInput("");
    setTimeout(() => {
      setMessages(prev => [...prev, { role: "agent", content: "I understand. I'll update the workspace.", type: "text" }]);
    }, 1000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className="fixed right-0 top-16 bottom-0 w-[420px] bg-white border-l border-border shadow-[-20px_0_40px_rgba(0,0,0,0.08)] z-50 flex flex-col font-sans"
    >
      <div className="px-5 py-4 border-b border-border/50 bg-secondary/30 flex items-center justify-between">
        <div className="flex items-center gap-2 text-brand-blue">
          <Sparkles size={18} />
          <h3 className="font-display font-semibold text-lg">UE Assistant</h3>
        </div>
        <button onClick={onClose} className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
          <X size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-6 bg-[#FAFBFC]">
        {messages.map((msg, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i} 
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.type === "text" && (
              <div className={`px-4 py-3 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${
                msg.role === "user" 
                  ? "bg-brand-blue text-white rounded-tr-sm" 
                  : "bg-white border border-border text-foreground rounded-tl-sm"
              }`}>
                {msg.content}
              </div>
            )}
            
            {msg.type === "card_appetite" && (
              <div className="w-full mt-2 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-secondary/20">
                  <p className="text-sm font-semibold text-foreground">Appetite Match: Riverside Unified</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Overall Score</span>
                    <span className="font-bold text-brand-blue">87 / 100</span>
                  </div>
                  <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-brand-blue w-[87%] rounded-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <div className="bg-green-50 p-2 rounded text-xs border border-green-100">
                      <span className="font-semibold text-green-700 block">Class (K-12)</span>
                      <span className="text-green-600">In Appetite</span>
                    </div>
                    <div className="bg-yellow-50 p-2 rounded text-xs border border-yellow-100">
                      <span className="font-semibold text-yellow-700 block">TIV ($412M)</span>
                      <span className="text-yellow-600">Referral Req.</span>
                    </div>
                  </div>
                  <button className="w-full mt-2 py-2 text-xs font-bold text-brand-blue bg-brand-blue/5 rounded-lg hover:bg-brand-blue/10 transition-colors">
                    View Full Radar
                  </button>
                </div>
              </div>
            )}

            {msg.type === "card_flags" && (
              <div className="w-full mt-2 bg-white border border-border rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-border/50 bg-secondary/20 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-yellow-600" />
                  <p className="text-sm font-semibold text-foreground">Risk Flags</p>
                </div>
                <div className="p-0 divide-y divide-border/50">
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Open ELL Claim</p>
                    <p className="text-xs text-muted-foreground mt-1">CLM-2021-027 currently pending mediation. Reserve: $145k.</p>
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold text-foreground">Aging HVAC System</p>
                    <p className="text-xs text-muted-foreground mt-1">Jefferson Elem noted in COPE. Recommend subjectivity condition.</p>
                  </div>
                </div>
              </div>
            )}

            {msg.type === "card_quote" && (
              <div className="w-full mt-2 bg-brand-blue text-white rounded-xl shadow-md overflow-hidden">
                <div className="p-4 border-b border-white/10 bg-white/5">
                  <p className="text-sm font-semibold">Suggested Quote Framework</p>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">General Liability</span>
                    <span className="font-semibold">$145k (+4%)</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/70">ELL</span>
                    <span className="font-semibold text-brand-gold">$182k (+12%)</span>
                  </div>
                  <div className="pt-3 border-t border-white/10 flex justify-between text-sm font-bold">
                    <span>Total Indicated</span>
                    <span>$577,700</span>
                  </div>
                  <button className="w-full mt-3 py-2 text-xs font-bold text-brand-blue-dark bg-brand-gold rounded-lg hover:bg-brand-gold-light transition-colors">
                    Apply to Quote Builder
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="p-4 bg-white border-t border-border/50 shadow-[0_-4px_10px_rgba(0,0,0,0.02)] relative z-10">
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Suggested Actions</p>
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => (
              <button 
                key={i}
                onClick={() => handleOptionClick(opt.id, opt.label)}
                className="flex items-center justify-between p-2.5 rounded-xl border border-border/60 bg-secondary/20 hover:border-brand-blue/30 hover:bg-brand-blue/5 text-left transition-all group"
              >
                <div className="flex items-center gap-3 text-sm font-medium text-foreground group-hover:text-brand-blue">
                  <div className="p-1.5 rounded-md bg-white border border-border shadow-sm text-muted-foreground group-hover:border-brand-blue/20 group-hover:text-brand-blue transition-colors">
                    <opt.icon size={14} />
                  </div>
                  {opt.label}
                </div>
                <ChevronRight size={14} className="text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="relative">
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask UE Assistant..." 
            className="w-full bg-white border border-border shadow-sm rounded-xl pl-4 pr-12 py-3.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-shadow"
          />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors disabled:opacity-50 disabled:bg-muted-foreground"
            disabled={!input.trim()}
          >
            <Send size={14} />
          </button>
        </form>
      </div>
    </motion.div>
  );
}