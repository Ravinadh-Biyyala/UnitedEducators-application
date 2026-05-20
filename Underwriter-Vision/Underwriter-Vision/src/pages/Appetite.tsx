import { ShieldCheck, ShieldAlert, Target, Info } from "lucide-react";

export function Appetite() {
  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Appetite Explorer</h1>
        <p className="text-muted-foreground mt-2">Current underwriting guidelines and capacity limits</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-panel bg-white/80 p-6 rounded-2xl border border-green-200 shadow-sm border-t-4 border-t-green-500">
          <div className="flex items-center gap-3 mb-4">
            <ShieldCheck className="text-green-600" size={24} />
            <h3 className="font-bold text-foreground text-lg">Target</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> Public K-12 Districts</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> Private Higher Ed</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" /> TIV &lt; $500M</li>
          </ul>
        </div>
        
        <div className="glass-panel bg-white/80 p-6 rounded-2xl border border-yellow-200 shadow-sm border-t-4 border-t-yellow-500">
          <div className="flex items-center gap-3 mb-4">
            <ShieldAlert className="text-yellow-600" size={24} />
            <h3 className="font-bold text-foreground text-lg">Referral</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" /> Charter Schools</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" /> TIV $500M - $1B</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-yellow-500 shrink-0" /> Coastal Wind Exposure</li>
          </ul>
        </div>

        <div className="glass-panel bg-white/80 p-6 rounded-2xl border border-red-200 shadow-sm border-t-4 border-t-red-500">
          <div className="flex items-center gap-3 mb-4">
            <Target className="text-red-600" size={24} />
            <h3 className="font-bold text-foreground text-lg">Declined</h3>
          </div>
          <ul className="space-y-3 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> For-profit Institutions</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> TIV &gt; $1B</li>
            <li className="flex items-start gap-2"><div className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" /> Open abuse claims</li>
          </ul>
        </div>
      </div>

      <div className="glass-panel bg-white/80 rounded-2xl border border-border shadow-sm p-8 flex items-start gap-6">
        <div className="p-3 bg-brand-blue/10 text-brand-blue rounded-xl shrink-0">
          <Info size={24} />
        </div>
        <div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Recent Guideline Changes</h3>
          <p className="text-muted-foreground mb-4">Effective Oct 1, 2024: Cyber liability sublimits for K-12 have been revised. Please consult the new rating manual.</p>
          <button className="text-sm font-bold text-brand-blue hover:underline">View Manual &rarr;</button>
        </div>
      </div>
    </div>
  );
}