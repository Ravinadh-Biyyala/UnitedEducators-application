import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Check, Shield, Briefcase, Crown, User } from "lucide-react";
import { ROLES, type RoleId } from "@/lib/mockData";
import { useRole } from "@/hooks/useRole";
import { cn } from "@/lib/utils";
import ueLogo from "@/assets/ue-logo.png";

const ROLE_ICONS: Record<RoleId, React.ComponentType<{ className?: string }>> = {
  uw: User,
  "sr-uw": Briefcase,
  lead: Shield,
  director: Crown,
};

const ROLE_BLURB: Record<RoleId, string> = {
  uw: "Quote, bind, and own a book of accounts.",
  "sr-uw": "Mentor the team and handle complex risks.",
  lead: "Approve referrals and steer the queue.",
  director: "Portfolio, appetite, and team performance.",
};

export function Login() {
  const [, setLocation] = useLocation();
  const { roleId, setRoleId } = useRole();
  const [email, setEmail] = useState("maya.khanna@ue.org");
  const [password, setPassword] = useState("•••••••••");
  const [selected, setSelected] = useState<RoleId>(roleId);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setRoleId(selected);
    setLocation("/");
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 hero-gradient-soft">
      {/* Left brand panel */}
      <div className="relative overflow-hidden hero-mesh hidden lg:flex flex-col justify-between p-12 text-white">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="size-11 rounded-xl ring-1 ring-white/30 overflow-hidden grid place-items-center bg-primary">
              <img src={ueLogo} alt="United Educators" className="size-full object-cover" />
            </div>
            <div>
              <div className="font-display font-bold text-lg">United Educators</div>
              <div className="text-xs text-white/70 tracking-wider uppercase">Underwriter Workbench</div>
            </div>
          </div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-3 py-1.5 text-xs font-semibold mb-5 border border-white/20">
            <Sparkles className="size-3.5 text-accent" /> Now with Companion guidance
          </div>
          <h1 className="font-display text-5xl font-bold leading-tight">
            Underwriting,<br />finally <span className="text-accent">lucid.</span>
          </h1>
          <p className="mt-5 text-white/80 max-w-md">
            One guided journey from intake to bind. The Companion does the reading, the cross-referencing,
            and the math — you make the call.
          </p>
        </motion.div>
        <div className="relative text-xs text-white/60">
          © 2026 United Educators · Built for the way underwriters actually work.
        </div>
      </div>

      {/* Right form */}
      <div className="grid place-items-center p-8 overflow-y-auto">
        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md py-8"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="size-10 rounded-xl bg-primary overflow-hidden grid place-items-center"><img src={ueLogo} alt="United Educators" className="size-full object-cover" /></div>
            <div className="font-display font-bold">United Educators</div>
          </div>
          <h2 className="font-display text-3xl font-bold tracking-tight">Sign in</h2>
          <p className="text-sm text-muted-foreground mt-2">Welcome back. Your queue is ready.</p>

          <div className="mt-7 space-y-4">
            <Field label="Work email">
              <input value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-transparent outline-none text-sm" />
            </Field>
            <Field label="Password">
              <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="w-full bg-transparent outline-none text-sm" />
            </Field>
          </div>

          {/* Role selection */}
          <div className="mt-7">
            <div className="flex items-baseline justify-between mb-2.5">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">Sign in as</div>
              <div className="text-[11px] text-muted-foreground">Tailors your view</div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {(Object.keys(ROLES) as RoleId[]).map(rid => {
                const r = ROLES[rid];
                const Icon = ROLE_ICONS[rid];
                const active = selected === rid;
                return (
                  <button
                    key={rid}
                    type="button"
                    onClick={() => setSelected(rid)}
                    className={cn(
                      "relative text-left rounded-xl border p-3 transition-all",
                      active
                        ? "border-primary/60 bg-primary/5 ring-4 ring-primary/15 shadow-md shadow-primary/10"
                        : "border-border bg-card hover:border-primary/30 hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={cn(
                        "size-8 rounded-lg grid place-items-center shrink-0",
                        active ? "bg-gradient-to-br from-primary to-[#1E40AF] text-white" : "bg-muted text-foreground/70"
                      )}>
                        <Icon className="size-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[12px] font-bold leading-tight truncate">{r.label}</div>
                        <div className="text-[10px] text-muted-foreground truncate">{r.name}</div>
                      </div>
                      {active && (
                        <div className="size-4 rounded-full bg-primary text-primary-foreground grid place-items-center shrink-0">
                          <Check className="size-2.5" />
                        </div>
                      )}
                    </div>
                    <div className="mt-2 text-[10.5px] leading-snug text-muted-foreground line-clamp-2">{ROLE_BLURB[rid]}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="mt-6 w-full h-12 rounded-full bg-gradient-to-r from-primary to-[#1E40AF] text-white font-semibold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow flex items-center justify-center gap-2">
            Continue as {ROLES[selected].label} <ArrowRight className="size-4" />
          </button>
          <button type="button" className="mt-3 w-full h-11 rounded-full border bg-card text-sm font-semibold hover:bg-muted">
            Sign in with SSO
          </button>

          <p className="text-xs text-muted-foreground text-center mt-6">
            Trouble signing in? Contact <a href="mailto:uw-ops@ue.org" className="text-primary font-semibold hover:underline">UW Operations</a>.
          </p>
        </motion.form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border bg-card px-4 py-2.5 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</div>
      {children}
    </div>
  );
}
