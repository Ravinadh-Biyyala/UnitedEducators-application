import { motion } from "framer-motion";
import { CheckCircle2, Clock } from "lucide-react";
import { tasks } from "../lib/mockData";

export function Tasks() {
  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-4xl font-bold text-foreground tracking-tight">My Tasks</h1>
        <p className="text-muted-foreground mt-2">Manage your underwriting action items</p>
      </div>

      <div className="glass-panel bg-white/80 rounded-2xl shadow-sm border border-border overflow-hidden">
        <div className="p-4 border-b border-border/50 flex gap-4 bg-secondary/20">
          <button className="px-4 py-1.5 bg-white border border-border rounded-full text-sm font-semibold shadow-sm text-foreground">Open Tasks</button>
          <button className="px-4 py-1.5 text-muted-foreground hover:text-foreground text-sm font-medium transition-colors">Completed</button>
        </div>
        
        <div className="divide-y divide-border/50">
          {tasks.map((task, i) => (
            <motion.div 
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
              key={task.id} 
              className="p-5 flex items-center gap-5 hover:bg-secondary/20 transition-colors group cursor-pointer"
            >
              <button className="w-6 h-6 rounded-full border-2 border-muted-foreground/30 flex items-center justify-center group-hover:border-brand-blue transition-colors">
                <CheckCircle2 size={16} className="text-brand-blue opacity-0 group-hover:opacity-100" />
              </button>
              
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground text-base group-hover:text-brand-blue transition-colors">{task.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground/80">{task.sub}</span>
                  <span>•</span>
                  <span>{task.type}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock size={14} />
                  <span className={task.due === 'Today' ? 'text-red-500 font-semibold' : ''}>{task.due}</span>
                </div>
                <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wider ${
                  task.priority === 'High' ? 'bg-red-50 text-red-700 border border-red-200' :
                  task.priority === 'Medium' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                  'bg-secondary text-muted-foreground border border-border'
                }`}>
                  {task.priority}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}