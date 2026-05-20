import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Sparkles, CheckCircle2, AlertTriangle, FileSearch } from "lucide-react";
import { cn } from "@/lib/utils";
import { COMPREHENSION_STEPS } from "@/lib/mockData";

const PHASES = ["Reading", "Comprehending", "Extracting", "Cross-referencing", "Summarizing"] as const;

const FINDING_CHIPS = [
  { tone: "good", text: "ACORD application: 12 sections", x: 10, y: 12 },
  { tone: "good", text: "Loss runs · 6 years", x: 70, y: 16 },
  { tone: "good", text: "COPE: 142 buildings", x: 45, y: 30 },
  { tone: "warn", text: "SIR Actuarial Opinion missing", x: 8, y: 50 },
  { tone: "good", text: "Title IX FY24 verified", x: 64, y: 48 },
  { tone: "warn", text: "Safety Questionnaire missing", x: 30, y: 66 },
  { tone: "good", text: "Appetite match · 87%", x: 70, y: 76 },
  { tone: "warn", text: "Primary CGL pierced 2× (22, 23)", x: 12, y: 82 },
] as const;

export function DocumentComprehensionModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [phase, setPhase] = useState(0);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const intRef = useRef<number | null>(null);

  useEffect(() => {
    if (!open) return;
    setPhase(0); setStep(0); setDone(false); setRevealed([]);
    let s = 0;
    intRef.current = window.setInterval(() => {
      s += 1;
      if (s >= COMPREHENSION_STEPS.length) {
        if (intRef.current) clearInterval(intRef.current);
        setDone(true);
        return;
      }
      setStep(s);
      setPhase(Math.min(PHASES.length - 1, Math.floor((s / COMPREHENSION_STEPS.length) * PHASES.length)));
    }, 600);
    // Stagger findings reveal
    FINDING_CHIPS.forEach((_, i) => {
      setTimeout(() => setRevealed(r => [...r, i]), 700 + i * 480);
    });
    return () => { if (intRef.current) clearInterval(intRef.current); };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-[#0B1230]/60 backdrop-blur-md"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 20 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 grid place-items-center px-4 pointer-events-none"
          >
            <div className="pointer-events-auto w-full max-w-3xl rounded-3xl bg-card shadow-2xl overflow-hidden border">
              {/* Top: animated visual stage */}
              <div className="relative h-[340px] hero-mesh overflow-hidden">
                {/* Document silhouettes */}
                <motion.div
                  initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.6 }}
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                >
                  <div className="relative">
                    {[0, 1, 2].map(i => (
                      <motion.div
                        key={i}
                        initial={{ rotate: 0, x: 0 }}
                        animate={{ rotate: i === 0 ? -6 : i === 1 ? 0 : 6, x: i === 0 ? -28 : i === 1 ? 0 : 28 }}
                        transition={{ delay: 0.2 + i * 0.1, type: "spring", stiffness: 120 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                      >
                        <div className="w-32 h-44 rounded-xl bg-white/95 shadow-2xl ring-1 ring-white/40 p-3">
                          <div className="space-y-1.5">
                            <div className="h-1.5 w-3/4 bg-primary/40 rounded" />
                            <div className="h-1 w-full bg-foreground/10 rounded" />
                            <div className="h-1 w-full bg-foreground/10 rounded" />
                            <div className="h-1 w-2/3 bg-foreground/10 rounded" />
                            <div className="h-3 w-full bg-accent/30 rounded mt-3" />
                            <div className="h-1 w-full bg-foreground/10 rounded" />
                            <div className="h-1 w-5/6 bg-foreground/10 rounded" />
                            <div className="h-1 w-3/4 bg-foreground/10 rounded" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                    {/* Glowing aura */}
                    <motion.div
                      animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.85, 0.5] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-accent/20 blur-3xl pointer-events-none"
                    />
                  </div>
                </motion.div>

                {/* Floating finding chips — Apple Intelligence style */}
                <div className="absolute inset-0">
                  {FINDING_CHIPS.map((chip, i) => (
                    <AnimatePresence key={i}>
                      {revealed.includes(i) && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.6, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ type: "spring", stiffness: 220, damping: 18 }}
                          className="absolute"
                          style={{ left: `${chip.x}%`, top: `${chip.y}%` }}
                        >
                          <FindingChip tone={chip.tone}>{chip.text}</FindingChip>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  ))}
                </div>

                {/* Header overlay */}
                <div className="absolute top-0 inset-x-0 px-6 pt-5 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/30">
                      <Sparkles className="size-5 text-accent" />
                    </div>
                    <div>
                      <div className="font-display font-bold text-white">Apple-Intelligence-style Comprehension</div>
                      <div className="text-xs text-white/70 mt-0.5">SUB-7829 · 8 documents · powered by UE Companion</div>
                    </div>
                  </div>
                  <button onClick={onClose} className="size-9 rounded-xl bg-white/10 hover:bg-white/20 grid place-items-center text-white">
                    <X className="size-4" />
                  </button>
                </div>

                {/* Phase pill */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2">
                  {PHASES.map((p, i) => (
                    <div key={p} className="flex items-center gap-2">
                      <div className={cn(
                        "px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold transition-all",
                        i === phase ? "bg-white text-primary shadow-lg" :
                        i < phase ? "bg-emerald-400/30 text-white" :
                        "bg-white/10 text-white/60"
                      )}>
                        {p}
                      </div>
                      {i < PHASES.length - 1 && <div className="w-3 h-px bg-white/30" />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step log */}
              <div className="p-6 max-h-72 overflow-y-auto scroll-thin">
                <div className="flex items-center gap-2 mb-3">
                  <FileSearch className="size-4 text-primary" />
                  <span className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Live trace</span>
                </div>
                <div className="space-y-1.5">
                  {COMPREHENSION_STEPS.slice(0, step + 1).map((s, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <span className="font-mono-tabular text-[10px] text-muted-foreground tabular-nums w-8 mt-1">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-foreground/85">{s}</span>
                    </motion.div>
                  ))}
                  {!done && (
                    <div className="flex items-center gap-2 pl-10 pt-2">
                      <span className="size-2 rounded-full bg-primary animate-pulse" />
                      <span className="size-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.15s" }} />
                      <span className="size-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: "0.3s" }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Footer actions */}
              <div className="px-6 py-4 border-t bg-muted/30 flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  {done
                    ? <span className="flex items-center gap-1.5 text-emerald-700 font-medium"><CheckCircle2 className="size-3.5" /> Comprehension complete · 8 documents · 4.2s</span>
                    : <span>Reading documents — please hold…</span>
                  }
                </div>
                <button
                  onClick={onClose}
                  disabled={!done}
                  className={cn(
                    "h-10 px-5 rounded-full font-semibold text-sm transition-all",
                    done
                      ? "bg-gradient-to-r from-primary to-[#1E40AF] text-white shadow-lg shadow-primary/30 hover:shadow-primary/40"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {done ? "Open Review →" : "Comprehending…"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function FindingChip({ tone, children }: { tone: "good" | "warn"; children: any }) {
  return (
    <div className={cn(
      "flex items-center gap-1.5 backdrop-blur-xl rounded-full pl-1.5 pr-3 py-1.5 shadow-2xl border text-xs font-medium",
      tone === "good"
        ? "bg-white/85 text-emerald-800 border-white/60"
        : "bg-amber-50/90 text-amber-900 border-amber-200/80"
    )}>
      <span className={cn("size-5 rounded-full grid place-items-center",
        tone === "good" ? "bg-emerald-500/20 text-emerald-700" : "bg-amber-500/20 text-amber-700")}>
        {tone === "good" ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
      </span>
      <span>{children}</span>
    </div>
  );
}

// Trigger button (Document upload chooser)
export function UploadTriggerButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-primary to-[#1E40AF] text-white text-sm font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-shadow">
      <FileText className="size-4" />
      Upload & Comprehend
    </button>
  );
}
