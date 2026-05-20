import { motion } from "framer-motion";
import { Search, Filter, ArrowDownToLine, ArrowRight } from "lucide-react";
import { Link } from "wouter";
import { allSubmissions } from "../lib/mockData";

export function Submissions() {
  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Submissions</h1>
          <p className="text-muted-foreground mt-2">Manage and track your active pipeline</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
            <Filter size={16} />
            Filters
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue-dark transition-colors text-sm font-medium">
            <ArrowDownToLine size={16} />
            Export
          </button>
        </div>
      </div>

      <div className="glass-panel bg-white/80 rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border/50 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input 
              type="text" 
              placeholder="Search by name, ID, or broker..." 
              className="w-full pl-10 pr-4 py-2 bg-secondary/30 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-all"
            />
          </div>
          <select className="bg-secondary/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
            <option>All Segments</option>
            <option>K-12</option>
            <option>Higher Ed</option>
          </select>
          <select className="bg-secondary/30 border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/20">
            <option>All Statuses</option>
            <option>Ready to Quote</option>
            <option>Underwriting</option>
            <option>Pending Info</option>
          </select>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary/20">
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Submission</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Premium</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Segment</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Broker</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {allSubmissions.map((sub, i) => (
              <motion.tr 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                key={sub.id}
                className="border-b border-border/50 hover:bg-secondary/10 transition-colors group"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground group-hover:text-brand-blue transition-colors">{sub.name}</span>
                    <span className="text-xs text-muted-foreground">{sub.id} • {sub.date}</span>
                  </div>
                </td>
                <td className="px-6 py-4 font-medium text-foreground">{sub.premium}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{sub.segment}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{sub.broker}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${
                    sub.status === 'Ready to Quote' ? 'bg-green-100 text-green-700 border border-green-200' :
                    sub.status === 'Underwriting' ? 'bg-brand-blue/10 text-brand-blue border border-brand-blue/20' :
                    sub.status === 'Triage' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                    sub.status === 'Bound' ? 'bg-brand-gold/20 text-brand-gold-dark border border-brand-gold/30' :
                    'bg-secondary text-secondary-foreground border border-border'
                  }`}>
                    {sub.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/submission/${sub.id}`}>
                    <button className="p-2 text-muted-foreground hover:bg-brand-blue/10 hover:text-brand-blue rounded-full transition-colors inline-flex items-center justify-center">
                      <ArrowRight size={16} />
                    </button>
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}