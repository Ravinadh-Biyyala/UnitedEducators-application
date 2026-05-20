import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Send, Sparkles, FileSearch, Activity, Shield, BarChart3, Layers,
  CheckCircle2, AlertTriangle, ChevronRight, Wand2, Plus, Compass,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PROFILE_BROOKFIELD } from "@/lib/mockData";

type OptionCard = { id: string; label: string; icon: any; tone: "blue" | "gold" | "green" | "red"; sub?: string };

type Msg =
  | { id: string; role: "agent"; kind: "text"; text: string; ts: string; options?: OptionCard[] }
  | { id: string; role: "agent"; kind: "result"; result: ResultKind; ts: string }
  | { id: string; role: "user"; kind: "text"; text: string; ts: string };

type ResultKind = "appetite" | "loss" | "external" | "flags" | "companion" | "comprehension";

function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }

const INITIAL_OPTIONS: OptionCard[] = [
  { id: "appetite", label: "Run Appetite Score", icon: Compass, tone: "blue", sub: "Match this submission to UE appetite" },
  { id: "loss", label: "Analyze Loss Run", icon: Activity, tone: "gold", sub: "5-year claims pattern analysis" },
  { id: "external", label: "Run External Check", icon: Shield, tone: "blue", sub: "Sanctions, litigation, news scan" },
  { id: "flags", label: "Show Review Flags", icon: AlertTriangle, tone: "red", sub: "Gaps · Actions · Owners" },
  { id: "companion", label: "Suggest Companion Products", icon: Layers, tone: "gold", sub: "BLX · XFF cross-sell" },
  { id: "comprehension", label: "Comprehend All Documents", icon: FileSearch, tone: "blue", sub: "Summarize uploaded packet" },
];

export function UnderwritingChat({ onClose }: { onClose: () => void }) {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: "m0", role: "agent", kind: "text", ts: now(),
      text: "Welcome back, Maya. I've reviewed Brookfield Day School's incoming packet and I'm ready when you are. What would you like to do first?",
      options: INITIAL_OPTIONS,
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [msgs.length]);

  function pickOption(opt: OptionCard) {
    setMsgs(m => [
      ...m,
      { id: crypto.randomUUID(), role: "user", kind: "text", text: opt.label, ts: now() },
    ]);
    // Simulate agent thinking
    setTimeout(() => {
      setMsgs(m => [
        ...m,
        { id: crypto.randomUUID(), role: "agent", kind: "result", result: opt.id as ResultKind, ts: now() },
        { id: crypto.randomUUID(), role: "agent", kind: "text", ts: now(),
          text: "Anything else you'd like me to run on this submission?",
          options: INITIAL_OPTIONS.filter(o => o.id !== opt.id).slice(0, 4),
        },
      ]);
    }, 420);
  }

  function send() {
    if (!input.trim()) return;
    setMsgs(m => [...m, { id: crypto.randomUUID(), role: "user", kind: "text", text: input, ts: now() }]);
    setInput("");
    setTimeout(() => {
      setMsgs(m => [...m,
        { id: crypto.randomUUID(), role: "agent", kind: "text", ts: now(),
          text: "Got it. Here are the deterministic actions I can take next — pick whichever fits.",
          options: INITIAL_OPTIONS,
        },
      ]);
    }, 360);
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-40 bg-[#0B1230]/40 backdrop-blur-sm"
      />
      <motion.aside
        initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 32, stiffness: 280 }}
        className="fixed top-0 right-0 z-50 h-screen w-full max-w-[480px] bg-card shadow-2xl flex flex-col border-l"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center gap-3 hero-mesh text-white">
          <div className="relative">
            <div className="size-10 rounded-xl bg-white/10 backdrop-blur grid place-items-center ring-1 ring-white/20">
              <Sparkles className="size-5 text-accent" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 size-3 rounded-full bg-emerald-400 ring-2 ring-[#0B1230]" />
          </div>
          <div className="flex-1">
            <div className="font-display font-bold text-white text-base leading-none">Underwriting Companion</div>
            <div className="text-[11px] text-white/70 mt-1">SUB-7829 · Brookfield Day School · live context</div>
          </div>
          <button onClick={onClose} className="size-8 rounded-lg hover:bg-white/10 grid place-items-center text-white/80">
            <X className="size-4" />
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto scroll-thin px-5 py-5 space-y-5 bg-gradient-to-b from-background to-muted/30">
          {msgs.map((m) => (
            <MessageBubble key={m.id} msg={m} onPick={pickOption} />
          ))}
        </div>

        {/* Composer */}
        <div className="border-t p-4 bg-card">
          <div className="flex items-end gap-2 rounded-2xl border bg-background p-2 focus-within:ring-4 focus-within:ring-primary/15 focus-within:border-primary/40 transition-all">
            <button className="size-9 rounded-xl grid place-items-center text-muted-foreground hover:bg-muted shrink-0">
              <Plus className="size-4" />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask the companion anything…"
              className="flex-1 bg-transparent resize-none text-sm py-2 outline-none placeholder:text-muted-foreground/70 max-h-32"
            />
            <button
              onClick={send}
              disabled={!input.trim()}
              className="size-9 rounded-xl bg-primary text-primary-foreground grid place-items-center disabled:opacity-30 hover:bg-primary/90 transition-colors shrink-0"
            >
              <Send className="size-4" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 px-1">
            Companion only takes deterministic actions — every recommendation is traceable to a citation.
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function MessageBubble({ msg, onPick }: { msg: Msg; onPick: (o: OptionCard) => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-4 py-2.5 text-sm shadow-md shadow-primary/20">
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.kind === "result") {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
        <ResultCard kind={msg.result} />
      </motion.div>
    );
  }
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="size-8 rounded-xl bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0 shadow-lg shadow-primary/20">
          <Sparkles className="size-4 text-white" />
        </div>
        <div className="rounded-2xl rounded-tl-md bg-card border px-4 py-3 text-sm leading-relaxed text-foreground/90 max-w-[88%] shadow-sm">
          {msg.text}
        </div>
      </div>
      {msg.options && (
        <div className="ml-11 grid grid-cols-1 gap-2">
          {msg.options.map((o, i) => {
            const Icon = o.icon;
            const tones = {
              blue: "from-primary/10 to-primary/5 hover:from-primary/15 hover:to-primary/10 border-primary/20 text-primary",
              gold: "from-accent/15 to-accent/5 hover:from-accent/20 hover:to-accent/10 border-accent/30 text-[#7B6217]",
              green: "from-emerald-500/10 to-emerald-500/5 hover:from-emerald-500/15 border-emerald-500/20 text-emerald-700",
              red: "from-rose-500/10 to-rose-500/5 hover:from-rose-500/15 border-rose-500/20 text-rose-700",
            };
            return (
              <motion.button
                key={o.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => onPick(o)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border bg-gradient-to-r px-3.5 py-2.5 text-left transition-all",
                  tones[o.tone]
                )}
              >
                <div className="size-8 rounded-lg bg-white grid place-items-center shrink-0 shadow-sm">
                  <Icon className="size-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-foreground">{o.label}</div>
                  {o.sub && <div className="text-[11px] text-muted-foreground mt-0.5">{o.sub}</div>}
                </div>
                <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultCard({ kind }: { kind: ResultKind }) {
  if (kind === "appetite") {
    return (
      <ResultFrame title="Appetite Score" subtitle="Brookfield Day School · Private K-12 · CT" icon={Compass}>
        <div className="flex items-center gap-5">
          <ScoreRing value={PROFILE_BROOKFIELD.appetiteScore} />
          <div className="flex-1 space-y-2">
            <Bar label="Segment fit" value={92} />
            <Bar label="Loss experience" value={66} tone="gold" />
            <Bar label="Geography & CAT" value={88} />
            <Bar label="Compliance posture" value={84} />
          </div>
        </div>
        <Inline tone="green" icon={CheckCircle2}>Strong fit — Northeast K-12 Private is core appetite.</Inline>
      </ResultFrame>
    );
  }
  if (kind === "loss") {
    return (
      <ResultFrame title="Loss Run Analysis" subtitle="6 years · Great American" icon={Activity}>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { l: "Total Claims", v: "8" },
            { l: "Total Incurred", v: "$96K" },
            { l: "Loss Ratio", v: "58%" },
          ].map(s => (
            <div key={s.l} className="rounded-xl border p-3 bg-muted/30">
              <div className="font-display text-xl font-bold">{s.v}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-1">{s.l}</div>
            </div>
          ))}
        </div>
        <Inline tone="red" icon={AlertTriangle}>2 occurrences pierced primary CGL ($1M) in 2022 and 2023.</Inline>
        <Inline tone="green" icon={CheckCircle2}>No severity outliers in last 24 months.</Inline>
      </ResultFrame>
    );
  }
  if (kind === "external") {
    return (
      <ResultFrame title="External Check" subtitle="OFAC · Litigation · News (5y)" icon={Shield}>
        <ul className="space-y-2 text-sm">
          {[
            { t: "OFAC sanctions", ok: true, n: "No matches" },
            { t: "Federal litigation", ok: true, n: "0 cases · last 5 yrs" },
            { t: "State court filings", ok: false, n: "1 case (employment, 2022) · settled" },
            { t: "News & media", ok: true, n: "Positive coverage · accreditation renewed 2024" },
            { t: "Accreditation status", ok: true, n: "NAIS member · in good standing" },
          ].map((r, i) => (
            <li key={i} className="flex items-start gap-3 rounded-lg p-2.5 hover:bg-muted/50">
              <span className={cn("size-7 rounded-full grid place-items-center shrink-0",
                r.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
                {r.ok ? <CheckCircle2 className="size-3.5" /> : <AlertTriangle className="size-3.5" />}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{r.t}</div>
                <div className="text-xs text-muted-foreground">{r.n}</div>
              </div>
            </li>
          ))}
        </ul>
      </ResultFrame>
    );
  }
  if (kind === "flags") {
    return (
      <ResultFrame title="Review Flags" subtitle="Gap · Action · Owner" icon={AlertTriangle}>
        <div className="space-y-2.5">
          {PROFILE_BROOKFIELD.redFlags.map((f, i) => (
            <div key={i} className="rounded-xl border border-rose-200/60 bg-rose-50/40 p-3">
              <div className="flex items-start gap-2.5">
                <span className="size-7 rounded-full bg-rose-100 text-rose-700 grid place-items-center shrink-0 mt-0.5">
                  <AlertTriangle className="size-3.5" />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-rose-900">{f.gap}</div>
                  <div className="text-xs text-rose-800 mt-0.5">→ {f.action}</div>
                  <div className="mt-2 inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold text-rose-900 bg-white/70 rounded-full px-2 py-0.5 border border-rose-200">
                    Owner · {f.owner}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </ResultFrame>
    );
  }
  if (kind === "companion") {
    return (
      <ResultFrame title="Companion Products" subtitle="Cross-sell suggestions" icon={Layers}>
        {PROFILE_BROOKFIELD.companions.map(c => (
          <div key={c.code} className="rounded-xl border bg-gradient-to-br from-accent/10 to-transparent p-3 mb-2 last:mb-0">
            <div className="flex items-center gap-2">
              <span className="font-mono-tabular text-[11px] font-bold text-accent bg-accent/15 rounded px-2 py-0.5">{c.code}</span>
              <span className="font-semibold text-sm">{c.name}</span>
            </div>
            <p className="text-xs text-foreground/80 mt-2">{c.teaser}</p>
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{c.reasoning}</p>
          </div>
        ))}
      </ResultFrame>
    );
  }
  // comprehension
  return (
    <ResultFrame title="Document Comprehension" subtitle="8 documents parsed in 4.2s" icon={FileSearch}>
      <div className="space-y-1.5 text-sm">
        {["Application form parsed (12 sections)",
          "Loss runs: 8 claims, $96K incurred",
          "COPE survey: 142 buildings, 2.14M sq ft",
          "Financials: $28.4M operating budget",
          "Title IX cert: current FY24",
          "Missing: SIR Actuarial Opinion",
          "Missing: Safety Questionnaire",
        ].map((t, i) => (
          <div key={i} className="flex items-center gap-2">
            {i < 5
              ? <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
              : <AlertTriangle className="size-3.5 text-amber-600 shrink-0" />}
            <span className={i < 5 ? "" : "text-amber-800"}>{t}</span>
          </div>
        ))}
      </div>
    </ResultFrame>
  );
}

function ResultFrame({ title, subtitle, icon: Icon, children }: { title: string; subtitle: string; icon: any; children: any }) {
  return (
    <div className="ml-11 max-w-[88%] rounded-2xl border bg-card shadow-md overflow-hidden">
      <div className="px-4 py-2.5 border-b bg-gradient-to-r from-primary/8 to-accent/8 flex items-center gap-2.5">
        <div className="size-7 rounded-lg bg-primary/10 grid place-items-center text-primary">
          <Icon className="size-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-bold">{title}</div>
          <div className="text-xs font-semibold text-foreground truncate">{subtitle}</div>
        </div>
        <Wand2 className="size-3.5 text-accent" />
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function ScoreRing({ value }: { value: number }) {
  const circ = 2 * Math.PI * 36;
  const off = circ - (value / 100) * circ;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 100 100" className="-rotate-90">
        <circle cx="50" cy="50" r="36" stroke="currentColor" className="text-muted" strokeWidth="8" fill="none" />
        <motion.circle
          cx="50" cy="50" r="36" stroke="url(#ring-grad)" strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: off }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ring-grad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0123D4" />
            <stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-2xl font-bold leading-none">{value}</div>
          <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">/ 100</div>
        </div>
      </div>
    </div>
  );
}

function Bar({ label, value, tone = "blue" }: { label: string; value: number; tone?: "blue" | "gold" }) {
  return (
    <div>
      <div className="flex justify-between text-[11px] mb-1">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-mono-tabular font-bold">{value}</span>
      </div>
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className={cn("h-full rounded-full", tone === "blue" ? "bg-primary" : "bg-accent")}
        />
      </div>
    </div>
  );
}

function Inline({ tone, icon: Icon, children }: { tone: "green" | "red" | "blue"; icon: any; children: any }) {
  const map = {
    green: "bg-emerald-50 text-emerald-800 border-emerald-200",
    red: "bg-rose-50 text-rose-800 border-rose-200",
    blue: "bg-primary/5 text-primary border-primary/20",
  };
  return (
    <div className={cn("flex items-start gap-2 rounded-lg border px-2.5 py-2 text-xs leading-relaxed", map[tone])}>
      <Icon className="size-3.5 mt-0.5 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
