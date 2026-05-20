import { CheckCircle2, AlertTriangle } from "lucide-react";

export function OverviewSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-6">
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Member Profile</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Entity Name</p>
              <p className="font-medium text-foreground">Riverside Unified School District</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Segment</p>
              <p className="font-medium text-foreground">K-12 Public</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Total Insured Value</p>
              <p className="font-medium text-foreground">$412,500,000</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Enrollment</p>
              <p className="font-medium text-foreground">42,500 Students</p>
            </div>
          </div>
        </div>
        
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm hover:shadow-md transition-shadow">
          <h3 className="font-display text-lg font-bold text-foreground mb-4">Broker Details</h3>
          <div className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Firm</p>
              <p className="font-medium text-foreground">Gallagher Education Practice</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contact</p>
              <p className="font-medium text-foreground">Michael Chang</p>
              <p className="text-sm text-brand-blue hover:underline cursor-pointer">m.chang@ajg.com</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Broker Tier</p>
              <span className="px-2 py-1 bg-brand-gold/20 text-brand-gold-dark rounded text-xs font-bold">Platinum</span>
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display text-lg font-bold text-foreground">AI Review Hub</h3>
          <span className="text-sm text-muted-foreground">3 of 5 completed</span>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {[
            { name: "NBI Check", status: "pass", desc: "No known issues" },
            { name: "FDM Match", status: "pass", desc: "Matched ACC-1029" },
            { name: "Loss Run Analysis", status: "flag", desc: "Severity spike in 2022" },
            { name: "External Data", status: "pending", desc: "Pending news scrape" },
            { name: "Appetite Match", status: "pass", desc: "87% Alignment" },
          ].map(r => (
            <div key={r.name} className={`p-4 rounded-xl border ${
              r.status === 'pass' ? 'bg-green-50/50 border-green-200 hover:bg-green-50' :
              r.status === 'flag' ? 'bg-yellow-50/50 border-yellow-200 hover:bg-yellow-50' :
              'bg-secondary/30 border-border text-muted-foreground hover:bg-secondary/50'
            } flex flex-col items-center justify-center text-center gap-3 transition-all cursor-pointer group`}>
              {r.status === 'pass' ? <CheckCircle2 className="text-green-600 group-hover:scale-110 transition-transform" size={28} /> :
               r.status === 'flag' ? <AlertTriangle className="text-yellow-600 group-hover:scale-110 transition-transform" size={28} /> :
               <div className="w-7 h-7 rounded-full border-2 border-dashed border-muted-foreground group-hover:border-solid transition-all" />}
              <div>
                <span className={`text-xs font-bold uppercase tracking-wider block mb-1 ${
                  r.status === 'pass' ? 'text-green-800' :
                  r.status === 'flag' ? 'text-yellow-800' : 'text-foreground'
                }`}>{r.name}</span>
                <span className={`text-[10px] ${
                  r.status === 'pass' ? 'text-green-600' :
                  r.status === 'flag' ? 'text-yellow-600' : 'text-muted-foreground'
                }`}>{r.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm">
        <h3 className="font-display text-lg font-bold text-foreground mb-4">Underwriter Notes</h3>
        <textarea 
          placeholder="Add your initial thoughts here..." 
          className="w-full min-h-[120px] bg-secondary/30 border border-border rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all resize-none text-foreground placeholder:text-muted-foreground"
          defaultValue="Initial review complete. Account looks favorable — strong loss history and safety program. Main concern is policy complexity score (61/100)."
        />
      </div>
    </div>
  );
}