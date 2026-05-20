import { Calculator, Play, Download } from "lucide-react";
import { lineItems } from "../../lib/mockData";

export function RatingSection() {
  return (
    <div className="flex gap-6 h-[800px]">
      <div className="w-1/2 flex flex-col space-y-6">
        <div className="glass-panel bg-white rounded-2xl p-6 border border-border shadow-sm flex-1 overflow-y-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-blue/10 text-brand-blue rounded-lg">
              <Calculator size={20} />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Rating Worksheet</h3>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Base Factors</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Exposure Base (ADA)</label>
                  <input type="text" defaultValue="42,500" className="w-full bg-secondary/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-foreground" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Experience Mod</label>
                  <input type="text" defaultValue="1.12" className="w-full bg-yellow-50/50 border border-yellow-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 text-yellow-800" />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Limit Selection</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">General Liability</span>
                  <select className="bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                    <option>$1M / $3M</option>
                    <option selected>$5M / $10M</option>
                    <option>$10M / $20M</option>
                  </select>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">ELL</span>
                  <select className="bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground">
                    <option>$1M / $1M</option>
                    <option>$2M / $2M</option>
                    <option selected>$5M / $5M</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-sm font-bold text-foreground border-b border-border pb-2">Discounts & Surcharges</h4>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Multi-line Discount</span>
                  <input type="text" defaultValue="-5%" className="w-24 text-right bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Risk Mgmt Credit</span>
                  <input type="text" defaultValue="-2%" className="w-24 text-right bg-secondary/30 border border-border rounded-lg px-3 py-1.5 text-sm text-foreground" />
                </div>
              </div>
            </div>
          </div>
          
          <button className="w-full mt-8 py-3 bg-secondary text-secondary-foreground rounded-xl font-bold text-sm hover:bg-secondary/80 transition-all flex items-center justify-center gap-2">
            <Play size={16} /> Recalculate
          </button>
        </div>
      </div>

      <div className="w-1/2 flex flex-col">
        <div className="glass-panel bg-[#011B9E] rounded-2xl border border-brand-blue text-white shadow-xl flex-1 flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <Calculator size={120} />
          </div>
          
          <div className="p-8 relative z-10 flex-1 flex flex-col">
            <div className="flex justify-between items-start mb-12">
              <div>
                <h3 className="font-display text-2xl font-bold mb-1">Quote Draft</h3>
                <p className="text-white/70">Riverside Unified School District</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-white/50 uppercase tracking-wider mb-1">Total Premium</p>
                <p className="font-display text-4xl font-bold text-brand-gold">$577,700</p>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {lineItems.map((item, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                  <div>
                    <p className="font-bold text-sm">{item.cover}</p>
                    <p className="text-xs text-white/60">{item.limit}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{item.premium}</p>
                    <p className={`text-xs ${item.change.startsWith('+') ? 'text-yellow-400' : 'text-green-400'}`}>{item.change} YoY</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-3 pt-6 border-t border-white/10">
              <button className="flex-1 py-3 bg-brand-gold text-brand-blue-dark rounded-xl font-bold text-sm hover:bg-brand-gold-light transition-all shadow-md">
                Finalize Quote
              </button>
              <button className="px-4 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all">
                <Download size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}