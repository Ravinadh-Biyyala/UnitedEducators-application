import { motion } from "framer-motion";
import { CornerUpLeft, Star, MoreHorizontal, Paperclip } from "lucide-react";
import { inboxEmails } from "../lib/mockData";

export function Inbox() {
  return (
    <div className="p-8 max-w-7xl mx-auto flex h-[calc(100vh-64px)] gap-6">
      <div className="w-1/3 flex flex-col glass-panel bg-white/80 rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border/50 bg-secondary/20">
          <h2 className="font-display text-xl font-bold text-foreground">Broker Inbox</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {inboxEmails.map((e, i) => (
            <div key={i} className={`p-4 border-b border-border/50 cursor-pointer hover:bg-secondary/50 transition-colors ${e.unread ? 'bg-brand-blue/5' : ''}`}>
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm ${e.unread ? 'font-bold text-foreground' : 'font-medium text-foreground'}`}>{e.sender}</span>
                <span className="text-xs text-muted-foreground">{e.time}</span>
              </div>
              <p className={`text-sm mb-1 line-clamp-1 ${e.unread ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>{e.subject}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{e.preview}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 glass-panel bg-white/80 rounded-2xl border border-border shadow-sm flex flex-col overflow-hidden">
        <div className="p-6 border-b border-border/50 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-foreground mb-2">RE: Additional Info - Riverside Unified</h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Michael Chang</span>
              <span>&lt;m.chang@ajg.com&gt;</span>
              <span>•</span>
              <span>Today, 10:42 AM</span>
            </div>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <button className="p-2 hover:bg-secondary rounded-md transition-colors"><CornerUpLeft size={18} /></button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors"><Star size={18} /></button>
            <button className="p-2 hover:bg-secondary rounded-md transition-colors"><MoreHorizontal size={18} /></button>
          </div>
        </div>
        <div className="p-6 flex-1 overflow-y-auto">
          <div className="prose prose-sm max-w-none text-foreground leading-relaxed font-sans">
            <p className="mb-4">Hi Sarah,</p>
            <p className="mb-4">Attached is the requested 5-year loss run update you asked for yesterday. I also included the updated schedule of vehicles for the auto policy.</p>
            <p className="mb-4">Let me know if you need anything else before quoting. We are hoping to present by end of week.</p>
            <p>Best,<br/>Michael</p>
          </div>
          
          <div className="mt-8 space-y-2">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Attachments (2)</p>
            <div className="flex gap-4">
              <div className="flex items-center gap-3 p-3 border border-border rounded-xl bg-secondary/30 w-64 hover:bg-secondary/50 cursor-pointer transition-colors">
                <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg"><Paperclip size={16} /></div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold truncate text-foreground">Riverside_Loss_Runs_2024.pdf</p>
                  <p className="text-xs text-muted-foreground">1.2 MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}