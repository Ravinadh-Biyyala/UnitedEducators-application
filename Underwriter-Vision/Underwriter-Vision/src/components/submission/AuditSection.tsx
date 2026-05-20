import { Activity, RotateCcw, Clock, CheckCircle2, ShieldAlert } from "lucide-react";
import { auditEvents, auditHistory } from "../../lib/mockData";

export function AuditSection() {
  const getIcon = (action: string) => {
    if (action.includes("Upload")) return CheckCircle2;
    if (action.includes("Score")) return ShieldAlert;
    return Activity;
  }

  const getColor = (action: string) => {
    if (action.includes("Upload")) return { text: "text-green-600", bg: "bg-green-50" };
    if (action.includes("Score")) return { text: "text-purple-600", bg: "bg-purple-50" };
    if (action.includes("Status")) return { text: "text-brand-blue", bg: "bg-brand-blue/10" };
    return { text: "text-muted-foreground", bg: "bg-secondary" };
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm h-[500px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
              <Clock size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Audit Trail</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border -z-10" />
            <div className="space-y-6">
              {auditEvents.map((event, i) => {
                const Icon = getIcon(event.action);
                const colors = getColor(event.action);
                return (
                <div key={i} className="flex gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-white shadow-sm ${colors.bg} ${colors.text}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">{event.action}</p>
                    <p className="text-sm text-foreground mt-0.5">{event.detail}</p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      <span className="font-semibold">{event.user}</span>
                      <span>•</span>
                      <span>{event.role}</span>
                      <span>•</span>
                      <span>{event.time}</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        </div>

        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm h-[500px] flex flex-col">
          <div className="flex items-center gap-3 mb-6 shrink-0">
            <div className="p-2 bg-brand-gold/10 text-brand-gold-dark rounded-lg">
              <RotateCcw size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Underwriting History</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-4">
              {auditHistory.map((hist, i) => (
                <div key={i} className="p-4 border border-border rounded-xl bg-secondary/10">
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-display text-xl font-bold text-brand-blue">{hist.year}</span>
                    <span className="text-sm font-bold text-foreground">{hist.premium}</span>
                  </div>
                  <p className="font-bold text-sm text-foreground mb-1">{hist.action}</p>
                  <p className="text-sm text-muted-foreground">{hist.detail}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}