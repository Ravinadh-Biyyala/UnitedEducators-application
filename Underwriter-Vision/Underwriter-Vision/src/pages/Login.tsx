import { motion } from "framer-motion";
import { Link } from "wouter";

export function Login() {
  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex w-1/2 relative bg-brand-blue overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=1200')] bg-cover bg-center mix-blend-overlay opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-dark/90 to-transparent" />
        <div className="relative z-10 mt-auto p-16 text-white">
          <div className="w-12 h-12 rounded bg-brand-gold flex items-center justify-center mb-8 shadow-lg">
            <span className="font-display font-bold text-brand-blue-dark text-2xl leading-none">UE</span>
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight mb-4">Underwriting,<br/>Elevated.</h1>
          <p className="text-lg text-white/80 max-w-md">The unified command center for education liability underwriting.</p>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center p-8 bg-background relative">
        <div className="w-full max-w-sm">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="glass-panel bg-white/90 p-8 rounded-2xl shadow-xl border border-border/50 backdrop-blur-xl"
          >
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-2">Welcome back</h2>
              <p className="text-muted-foreground text-sm">Sign in to your workbench</p>
            </div>

            <form className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Role Select (Demo)</label>
                <select className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-foreground">
                  <option>Underwriter (Sarah)</option>
                  <option>UW Manager (Patricia)</option>
                  <option>Admin (Robert)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Email</label>
                <input 
                  type="email" 
                  value="sarah.mitchell@ue.org"
                  readOnly
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-foreground"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Password</label>
                <input 
                  type="password" 
                  value="••••••••"
                  readOnly
                  className="w-full bg-secondary/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-blue/30 transition-all text-foreground"
                />
              </div>

              <Link href="/">
                <button type="button" className="w-full mt-6 py-3 bg-brand-blue text-white rounded-xl font-bold text-sm hover:bg-brand-blue-dark transition-all shadow-md hover:shadow-lg">
                  Sign In to Workbench
                </button>
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
}