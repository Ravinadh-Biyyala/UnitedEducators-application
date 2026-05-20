import { BarChart, TrendingUp, AlertCircle } from "lucide-react";
import { claims } from "../../lib/mockData";

export function LossSection() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">5-Year Incurred</h3>
          <p className="font-display text-3xl font-bold text-foreground mb-1">$254,800</p>
          <div className="flex items-center gap-1 text-sm text-yellow-600 font-medium">
            <TrendingUp size={14} /> +12% vs peer avg
          </div>
        </div>
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm">
          <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Loss Ratio (Est)</h3>
          <p className="font-display text-3xl font-bold text-foreground mb-1">42.5%</p>
          <div className="flex items-center gap-1 text-sm text-green-600 font-medium">
            In Appetite
          </div>
        </div>
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm bg-brand-blue text-white">
          <h3 className="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Open Claims</h3>
          <p className="font-display text-3xl font-bold mb-1">1</p>
          <div className="flex items-center gap-1 text-sm text-brand-gold font-medium">
            <AlertCircle size={14} /> Requires review
          </div>
        </div>
      </div>

      <div className="glass-panel bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="p-6 border-b border-border bg-secondary/10 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-foreground">Loss Run Detail</h3>
            <p className="text-sm text-muted-foreground mt-1">AI-extracted from 5-Year Certified Loss Runs</p>
          </div>
          <button className="text-sm font-semibold text-brand-blue hover:underline">View Original PDF</button>
        </div>
        
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/5">
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Year</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Type</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Description</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Incurred</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {claims.map((claim, i) => (
              <tr key={i} className={`hover:bg-secondary/10 transition-colors ${claim.status === 'Open' ? 'bg-yellow-50/20' : ''}`}>
                <td className="px-6 py-4 text-sm font-medium text-foreground">{claim.year}</td>
                <td className="px-6 py-4 text-sm">
                  <span className="px-2 py-1 bg-secondary text-secondary-foreground rounded text-xs font-semibold">
                    {claim.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{claim.desc}</td>
                <td className="px-6 py-4 text-sm font-medium text-foreground text-right">{claim.amount}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-xs font-bold uppercase tracking-wider ${
                    claim.status === 'Open' ? 'text-yellow-600' : 'text-green-600'
                  }`}>{claim.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}