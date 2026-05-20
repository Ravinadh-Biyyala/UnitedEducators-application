import { motion } from "framer-motion";
import { PieChart, Activity, DollarSign, Users } from "lucide-react";
import { portfolioMetrics } from "../lib/mockData";

export function Portfolio() {
  const getIcon = (label: string) => {
    if (label.includes("Premium")) return DollarSign;
    if (label.includes("Loss")) return Activity;
    if (label.includes("Policies")) return Users;
    return PieChart;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">Portfolio Analytics</h1>
        <p className="text-muted-foreground mt-2">Book composition and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {portfolioMetrics.map((metric, i) => {
          const Icon = getIcon(metric.label);
          return (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              key={i} 
              className="glass-panel bg-white/80 p-6 rounded-2xl border border-border shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-brand-gold/10 text-brand-gold-dark rounded-lg">
                  <Icon size={20} />
                </div>
              </div>
              <h3 className="font-display text-3xl font-bold text-foreground mb-1">{metric.value}</h3>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">{metric.label}</p>
              <p className="text-xs text-muted-foreground mt-2">{metric.sub}</p>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-panel bg-white/80 p-6 rounded-2xl border border-border shadow-sm h-80 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <PieChart className="text-muted-foreground" size={24} />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Segment Mix</h3>
          <p className="text-muted-foreground max-w-sm">Chart visualization would render here showing K-12 vs Higher Ed split.</p>
        </div>
        <div className="glass-panel bg-white/80 p-6 rounded-2xl border border-border shadow-sm h-80 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
            <Activity className="text-muted-foreground" size={24} />
          </div>
          <h3 className="font-display text-xl font-bold text-foreground mb-2">Loss Trends</h3>
          <p className="text-muted-foreground max-w-sm">Chart visualization would render here showing historical loss ratios.</p>
        </div>
      </div>
    </div>
  );
}