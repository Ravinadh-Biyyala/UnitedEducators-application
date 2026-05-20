import { motion } from "framer-motion";
import { ArrowRight, Clock, AlertTriangle, TrendingUp, ShieldCheck } from "lucide-react";
import { Link } from "wouter";
import { activeSubmissions } from "../lib/mockData";

export function Home() {
  const images = [
    "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&q=80&w=600",
    "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&q=80&w=600"
  ];

  return (
    <div className="min-h-full pb-20">
      <div className="relative h-[40vh] min-h-[350px] overflow-hidden hero-gradient">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=2000')] opacity-10 mix-blend-overlay bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10" />
        
        <div className="relative z-20 p-12 h-full flex flex-col justify-end max-w-7xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          >
            <h1 className="font-display text-5xl md:text-6xl text-white font-bold leading-tight mb-4 tracking-tight drop-shadow-lg">
              Good morning, Sarah.
            </h1>
            <p className="text-xl text-white/80 font-light max-w-2xl leading-relaxed">
              You have <strong className="text-brand-gold">3 submissions</strong> ready for quote and <strong className="text-brand-gold">1 referral</strong> requiring your attention today.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-12 -mt-10 relative z-30 space-y-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          {[
            { label: "Active Submissions", value: "14", change: "+2 this week", icon: Clock },
            { label: "Pending Approvals", value: "3", change: "1 overdue", icon: AlertTriangle, alert: true },
            { label: "Bound Premium", value: "$4.2M", change: "105% to target", icon: TrendingUp },
            { label: "Appetite Match", value: "88%", change: "Avg score", icon: ShieldCheck },
          ].map((kpi, i) => (
            <div key={i} className="glass-panel bg-white/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-white/50 backdrop-blur-xl">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${kpi.alert ? 'bg-red-50 text-red-500' : 'bg-brand-blue/5 text-brand-blue'}`}>
                  <kpi.icon size={20} />
                </div>
              </div>
              <h3 className="text-3xl font-display font-bold text-foreground mb-1">{kpi.value}</h3>
              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">{kpi.label}</p>
              <p className={`text-xs ${kpi.alert ? 'text-red-500 font-medium' : 'text-muted-foreground/70'}`}>{kpi.change}</p>
            </div>
          ))}
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-foreground tracking-tight">Requires Attention</h2>
              <p className="text-muted-foreground mt-1">High priority items in your queue</p>
            </div>
            <Link href="/submissions" className="text-brand-blue font-semibold text-sm hover:underline flex items-center gap-1">
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {activeSubmissions.map((sub, i) => (
              <Link key={sub.id} href={`/submission/${sub.id}`}>
                <motion.div 
                  whileHover={{ y: -5, scale: 1.01 }}
                  transition={{ duration: 0.2 }}
                  className="group relative rounded-2xl overflow-hidden shadow-sm hover:shadow-xl bg-card border border-border cursor-pointer aspect-[4/3] flex flex-col justify-end"
                >
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${images[i % images.length]})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#011B9E]/90 via-[#011B9E]/40 to-transparent" />
                  
                  <div className="relative z-10 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-white text-xs font-semibold tracking-wide border border-white/10">
                        {sub.id}
                      </span>
                      <span className="px-3 py-1 bg-brand-gold text-white rounded-full text-xs font-bold tracking-wide shadow-sm">
                        {sub.status}
                      </span>
                    </div>
                    
                    <h3 className="font-display text-2xl font-bold text-white leading-tight mb-2 group-hover:text-brand-gold transition-colors line-clamp-2">
                      {sub.name}
                    </h3>
                    
                    <div className="flex items-center gap-4 text-white/80 text-sm">
                      <span className="font-semibold">{sub.premium}</span>
                      <span className="w-1 h-1 rounded-full bg-white/50" />
                      <span>{sub.segment}</span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.section>
      </div>
    </div>
  );
}