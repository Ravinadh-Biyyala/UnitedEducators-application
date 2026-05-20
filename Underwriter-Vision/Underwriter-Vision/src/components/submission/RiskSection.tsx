import { Shield, AlertTriangle, CheckCircle2 } from "lucide-react";
import { copeData, surveyFlags } from "../../lib/mockData";

export function RiskSection() {
  return (
    <div className="space-y-6">
      <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
            <Shield size={20} />
          </div>
          <h3 className="font-display text-lg font-bold text-foreground">COPE Summary</h3>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {copeData.map((item, i) => (
            <div key={i} className={`p-4 rounded-xl border ${item.status === 'warn' ? 'bg-yellow-50/50 border-yellow-200' : 'bg-secondary/20 border-border'}`}>
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">{item.label}</p>
              <div className="flex items-start gap-2">
                {item.status === 'warn' ? <AlertTriangle size={16} className="text-yellow-600 mt-0.5 shrink-0" /> : <CheckCircle2 size={16} className="text-green-600 mt-0.5 shrink-0" />}
                <p className="text-sm font-medium text-foreground">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/10">
          <h3 className="font-display text-lg font-bold text-foreground">Application Survey Review</h3>
          <p className="text-sm text-muted-foreground mt-1">AI-extracted from 2024 Renewal Application. 2 flags detected.</p>
        </div>
        
        <div className="divide-y divide-border">
          {surveyFlags.map((item, i) => (
            <div key={i} className={`p-6 flex items-start gap-4 ${item.flag ? 'bg-yellow-50/30' : ''}`}>
              <div className="mt-1">
                {item.flag ? <AlertTriangle size={18} className="text-yellow-600" /> : <CheckCircle2 size={18} className="text-green-600" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground mb-1">{item.question}</p>
                <p className="text-sm text-muted-foreground">{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}