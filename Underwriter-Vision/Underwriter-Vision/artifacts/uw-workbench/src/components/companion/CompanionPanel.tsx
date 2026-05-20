import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Send, ChevronRight, ChevronsRight, RotateCcw, ArrowRight,
  Compass, Activity, Shield, AlertTriangle, Layers, FileSearch, Wand2,
  CheckCircle2, BarChart3, FileText, Mail, ListChecks, ChartPie,
  Inbox as InboxIcon, Building2, X, Plus, Check, Mail as MailIcon,
  ClipboardList, Users, Send as SendIcon, Clock as ClockIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useCompanion, now, newId, type CompanionMsg, type Suggestion, type VizSpec } from "./CompanionContext";
import { TASKS } from "@/lib/mockData";

const ICONS: Record<string, any> = {
  Compass, Activity, Shield, AlertTriangle, Layers, FileSearch, Wand2,
  BarChart3, FileText, Mail, ListChecks, ChartPie, InboxIcon, Building2, Sparkles,
  Send: SendIcon, Clock: ClockIcon, ArrowRight, ClipboardList,
};

// Strict UE brand palette: primary blue #0123D4, accent gold #C9A227, deep navy #0B1A6E.
// Neutral slate (#5A6B8C) used where a third subdued tone is needed.
const TONE: Record<string, string> = {
  blue:   "from-primary/10  to-primary/0   border-primary/25      text-primary",
  gold:   "from-accent/16   to-accent/0    border-accent/35       text-[#7B6217]",
  navy:   "from-[#0B1A6E]/12 to-[#0B1A6E]/0 border-[#0B1A6E]/25   text-[#0B1A6E]",
  slate:  "from-[#5A6B8C]/12 to-[#5A6B8C]/0 border-[#5A6B8C]/25   text-[#3F4E70]",
  // Backwards-compatible aliases — map non-brand tones onto brand tones so any
  // page that still passes "green" / "red" / "violet" stays on-palette.
  green:  "from-accent/16   to-accent/0    border-accent/35       text-[#7B6217]",
  red:    "from-[#0B1A6E]/12 to-[#0B1A6E]/0 border-[#0B1A6E]/25   text-[#0B1A6E]",
  violet: "from-[#0B1A6E]/12 to-[#0B1A6E]/0 border-[#0B1A6E]/25   text-[#0B1A6E]",
};

export function CompanionPanel() {
  const {
    collapsed, setCollapsed, pageCtx, history, pushMsg, resetThread, go,
  } = useCompanion();
  const [input, setInput] = useState("");
  const [thinking, setThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const routeKey = pageCtx?.routeKey ?? "_idle";
  const msgs: CompanionMsg[] = history[routeKey] || [];
  const endRef = useRef<HTMLDivElement>(null);

  // Bulletproof auto-scroll: pin to bottom whenever messages change OR the
  // panel re-renders mid-stream. Uses both a sentinel scrollIntoView and an
  // explicit scrollTop assignment so a slow smooth-scroll never gets stuck.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pin = () => {
      el.scrollTop = el.scrollHeight;
      endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    };
    pin();
    const t = setTimeout(pin, 60);   // catch late layout (viz cards, fonts)
    return () => clearTimeout(t);
  }, [msgs.length, routeKey, thinking]);

  function pickSuggestion(s: Suggestion) {
    if (!pageCtx) return;
    if (s.navigateTo) {
      pushMsg(routeKey,
        { id: newId(), role: "user", kind: "text", text: s.label, ts: now() },
        { id: newId(), role: "agent", kind: "navigate", text: `Taking you to ${s.label.toLowerCase()}…`, href: s.navigateTo, label: s.label, ts: now() },
      );
      setTimeout(() => go(s.navigateTo!), 400);
      return;
    }
    pushMsg(routeKey, { id: newId(), role: "user", kind: "text", text: s.label, ts: now() });
    setThinking(true);
    setTimeout(() => {
      const generated = pageCtx.respond?.(s.id, s);
      setThinking(false);
      if (generated && generated.length) pushMsg(routeKey, ...generated);
      else pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: "Done. Anything else I can run on this page?",
        suggestions: pageCtx.suggestions.filter(x => x.id !== s.id).slice(0, 2),
      });
    }, 720);
  }

  async function send() {
    if (!input.trim() || !pageCtx) return;
    const text = input.trim();
    pushMsg(routeKey, { id: newId(), role: "user", kind: "text", text, ts: now() });
    setInput("");
    setThinking(true);

    // 1) Try the page's local intent handler first — these return structured viz/navigate cards.
    const local = pageCtx.freeText?.(text);
    if (local && local.length) {
      // Small delay so the typing dots actually feel natural for instant matches.
      await new Promise(r => setTimeout(r, 380));
      setThinking(false);
      pushMsg(routeKey, ...local);
      return;
    }

    // 2) Navigation intent — fires only when the user explicitly asks to be
    //    taken somewhere ("take me there", "open tasks", "go to portfolio").
    //    If matched we push an agent reply AND actually route the user.
    const nav = tryNavIntent(text, history[routeKey] || []);
    if (nav) {
      await new Promise(r => setTimeout(r, 320));
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "navigate", ts: now(),
        text: nav.confirmation, href: nav.href, label: nav.label,
      });
      // Route after the message animates in.
      setTimeout(() => go(nav.href), 520);
      return;
    }

    // 3) Task-help intent — dispatches a specialist agent (Broker Outreach,
    //    Compliance, Risk Review, Pricing, Loss-Control) and renders a polished
    //    playbook card with steps, an optional drafted email, and a primary CTA.
    const playbook = tryTaskHelpIntent(text, history[routeKey] || []);
    if (playbook) {
      await new Promise(r => setTimeout(r, 520));
      setThinking(false);
      pushMsg(routeKey, playbook);
      return;
    }

    // 4) Generic chart-intent detector — fires ONLY when the user explicitly asks
    //    for a chart/plot/trend. Returns a beautiful inline linecard with a CTA
    //    to the Portfolio dashboard. Intentionally conservative so the agent does
    //    not auto-pollute every reply with charts.
    const chart = tryChartIntent(text);
    if (chart) {
      await new Promise(r => setTimeout(r, 420));
      setThinking(false);
      pushMsg(routeKey, chart);
      return;
    }

    // 4) Fall back to the GPT-backed chat endpoint with page facts as grounding.
    try {
      const recent = (history[routeKey] || [])
        .slice(-6)
        .map(m => {
          if (m.role === "user") return { role: "user" as const, content: m.text };
          if (m.kind === "text") return { role: "assistant" as const, content: m.text };
          if (m.kind === "navigate") return { role: "assistant" as const, content: m.text };
          if (m.kind === "viz") return { role: "assistant" as const, content: `[showed: ${m.viz.title}]` };
          return null;
        })
        .filter(Boolean) as { role: "user" | "assistant"; content: string }[];

      const res = await fetch(`${import.meta.env.BASE_URL}api/companion/chat`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          page: { title: pageCtx.title, subtitle: pageCtx.subtitle, routeKey: pageCtx.routeKey },
          facts: pageCtx.facts?.() ?? "",
          messages: [...recent, { role: "user", content: text }],
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { text?: string; error?: string };
      setThinking(false);
      if (res.ok && data.text) {
        pushMsg(routeKey, { id: newId(), role: "agent", kind: "text", ts: now(), text: data.text, suggestions: pageCtx.suggestions.slice(0, 2) });
      } else {
        pushMsg(routeKey, {
          id: newId(), role: "agent", kind: "text", ts: now(),
          text: "I couldn't reach the model just now. Try one of these — they map directly to actions on this page.",
          suggestions: pageCtx.suggestions.slice(0, 2),
        });
      }
    } catch {
      setThinking(false);
      pushMsg(routeKey, {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: "I couldn't reach the model just now. Try one of these — they map directly to actions on this page.",
        suggestions: pageCtx.suggestions.slice(0, 2),
      });
    }
  }

  if (collapsed) {
    return (
      <button
        onClick={() => setCollapsed(false)}
        className="fixed right-4 top-24 z-40 size-12 rounded-full bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center shadow-2xl shadow-primary/40 hover:scale-105 transition-transform"
        aria-label="Open companion"
      >
        <Sparkles className="size-5 text-accent" />
        <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full bg-emerald-400 ring-2 ring-background" />
      </button>
    );
  }

  return (
    <aside className="relative shrink-0 w-[380px] xl:w-[420px] sticky top-0 h-screen border-l border-white/50 dark:border-white/10 flex flex-col bg-gradient-to-b from-white/70 via-white/55 to-white/70 dark:from-[#0B1230]/70 dark:via-[#0B1230]/55 dark:to-[#0B1230]/70 backdrop-blur-2xl overflow-hidden shadow-[inset_1px_0_0_rgba(255,255,255,0.6)] dark:shadow-[inset_1px_0_0_rgba(255,255,255,0.05)]">
      {/* Aurora glass background — strict UE palette: navy + brand-blue + gold */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-32 -right-24 size-[420px] rounded-full bg-primary/22 blur-[90px]"
          animate={{ x: [0, 24, -12, 0], y: [0, -18, 16, 0], opacity: [0.45, 0.65, 0.4, 0.45] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/3 -left-20 size-[360px] rounded-full bg-accent/18 blur-[100px]"
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -16, 0], opacity: [0.32, 0.5, 0.35, 0.32] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
        <motion.div
          className="absolute -bottom-24 right-10 size-[300px] rounded-full bg-[#0B1A6E]/22 blur-[100px]"
          animate={{ x: [0, -16, 18, 0], y: [0, -12, 14, 0], opacity: [0.30, 0.5, 0.34, 0.30] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        />
        {/* fine top sheen + subtle vertical brand wash */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.55),transparent_60%)] dark:bg-[radial-gradient(circle_at_50%_-10%,rgba(255,255,255,0.06),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0)_0%,rgba(11,26,110,0.025)_55%,rgba(11,26,110,0.05)_100%)] dark:bg-[linear-gradient(180deg,rgba(0,0,0,0)_0%,rgba(0,0,0,0.15)_100%)]" />
        {/* hairline gold edge for the 'classy' touch */}
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/40 to-transparent" />
      </div>

      {/* Top spacer matches global header height — gives the panel a clean glass extension above its own header */}
      <div className="relative h-16 border-b border-white/30 dark:border-white/10 flex items-center px-4">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-foreground/60">
          <span className="size-1.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.7)]" />
          Live · agentic
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button onClick={() => resetThread(routeKey)} className="size-8 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 grid place-items-center text-foreground/60" title="Reset thread">
            <RotateCcw className="size-3.5" />
          </button>
          <button onClick={() => setCollapsed(true)} className="size-8 rounded-lg hover:bg-white/40 dark:hover:bg-white/10 grid place-items-center text-foreground/60" title="Collapse">
            <ChevronsRight className="size-4" />
          </button>
        </div>
      </div>

      {/* Companion identity card — glass */}
      <div className="relative px-4 pt-3 pb-3 border-b border-white/30 dark:border-white/10">
        <div className="flex items-center gap-3">
          <AgentAvatar size={11} thinking={thinking} />
          <div className="flex-1 min-w-0">
            <div className="font-display font-bold text-[15px] leading-none text-foreground">Companion</div>
            <div className="text-[11px] text-foreground/60 mt-1 truncate">
              {pageCtx?.title ?? "On standby"}{pageCtx?.subtitle ? ` · ${pageCtx.subtitle}` : ""}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="relative flex-1 overflow-y-auto scroll-thin px-4 py-4 space-y-4">
        {msgs.map(m => <MessageBubble key={m.id} msg={m} onGo={go} />)}
        <AnimatePresence>{thinking && <ThinkingBubble key="thinking" />}</AnimatePresence>
        <div ref={endRef} aria-hidden className="h-1" />
      </div>

      {/* Composer */}
      <div className="relative border-t border-white/30 dark:border-white/10 bg-white/40 dark:bg-card/40 backdrop-blur-xl">
        {/* Adaptive suggestion pills — at most 2, tailored to the last agent turn. */}
        {(() => {
          const sugs = adaptiveSuggestions(msgs, pageCtx?.suggestions ?? []);
          if (!sugs.length) return null;
          return <SuggestionStrip suggestions={sugs} onPick={pickSuggestion} />;
        })()}
        <div className="p-3">
          <div className="flex items-end gap-2 rounded-2xl border border-white/50 dark:border-white/10 bg-white/70 dark:bg-card/60 backdrop-blur p-2 focus-within:ring-4 focus-within:ring-primary/15 focus-within:border-primary/40 transition-all shadow-sm">
            <button className="size-8 rounded-xl grid place-items-center text-muted-foreground hover:bg-white/60 dark:hover:bg-white/10 shrink-0">
              <Plus className="size-4" />
            </button>
            <textarea
              rows={1}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder={pageCtx ? `Ask about ${pageCtx.title.toLowerCase()}…` : "Ask the companion anything…"}
              className="flex-1 bg-transparent resize-none text-sm py-1.5 outline-none placeholder:text-muted-foreground/70 max-h-32"
            />
            <button onClick={send} disabled={!input.trim() || !pageCtx}
              className="size-8 rounded-xl bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center disabled:opacity-30 hover:shadow-lg hover:shadow-primary/30 transition-all shrink-0">
              <Send className="size-4" />
            </button>
          </div>
          <div className="text-[10px] text-muted-foreground mt-2 px-1 leading-relaxed flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
            Watching this page — every action is deterministic and traceable.
          </div>
        </div>
      </div>
    </aside>
  );
}

function AgentAvatar({ size = 10, thinking = false }: { size?: number; thinking?: boolean }) {
  const px = size * 4;
  return (
    <div className="relative shrink-0" style={{ width: `${px}px`, height: `${px}px` }}>
      {/* Soft halo — opacity-only pulse so it can't push pixels around */}
      <motion.div
        aria-hidden
        className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-primary/50 to-accent/50 blur-md pointer-events-none"
        animate={{ opacity: thinking ? [0.45, 0.85, 0.45] : [0.25, 0.45, 0.25] }}
        transition={{ duration: thinking ? 1.2 : 2.8, repeat: Infinity, ease: "easeInOut" }}
      />
      {/* Glass disc — fixed footprint, no scale */}
      <div className="relative size-full rounded-2xl bg-gradient-to-br from-[#1E40AF] via-primary to-[#0B1230] grid place-items-center ring-1 ring-white/30 shadow-lg shadow-primary/20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.45),transparent_55%)]" />
        <motion.div
          animate={thinking ? { rotate: 360 } : { rotate: 0 }}
          transition={thinking ? { duration: 3, repeat: Infinity, ease: "linear" } : { duration: 0.4 }}
          className="relative grid place-items-center"
        >
          <Sparkles
            className="text-accent drop-shadow-[0_0_6px_rgba(201,162,39,0.55)]"
            style={{ width: `${px * 0.5}px`, height: `${px * 0.5}px` }}
          />
        </motion.div>
      </div>
      {/* Status dot */}
      <span className="absolute bottom-0 right-0 translate-x-1/4 translate-y-1/4 size-3 rounded-full bg-emerald-400 ring-2 ring-white dark:ring-[#0B1230]">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-emerald-400"
          animate={{ opacity: [0.6, 0, 0.6], scale: [1, 1.8, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        />
      </span>
    </div>
  );
}

function ThinkingBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
      className="flex gap-2.5 items-end"
    >
      <AgentAvatar size={8} thinking />
      <div className="rounded-2xl rounded-tl-md border border-white/50 dark:border-white/10 bg-white/70 dark:bg-card/60 backdrop-blur-xl px-3.5 py-2.5 shadow-sm">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map(i => (
            <motion.span
              key={i}
              className="size-1.5 rounded-full bg-primary"
              animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15, ease: "easeInOut" }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({ msg, onGo }: { msg: CompanionMsg; onGo: (h: string) => void }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-br-md bg-primary text-primary-foreground px-3.5 py-2 text-[13px] shadow-md shadow-primary/20">
          {msg.text}
        </div>
      </div>
    );
  }
  if (msg.kind === "navigate") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
        <AgentBubble text={msg.text} />
        <button onClick={() => onGo(msg.href)}
          className="ml-10 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 bg-gradient-to-r from-primary to-[#1E40AF] text-white text-xs font-semibold shadow-lg shadow-primary/30">
          {msg.label} <ArrowRight className="size-3.5" />
        </button>
      </motion.div>
    );
  }
  if (msg.kind === "viz") {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <VizCard viz={msg.viz} />
      </motion.div>
    );
  }
  return (
    <div className="space-y-2.5">
      <AgentBubble text={msg.text} />
    </div>
  );
}

function AgentBubble({ text }: { text: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex gap-2.5 items-end">
      <AgentAvatar size={8} />
      <div className="rounded-2xl rounded-tl-md border border-white/50 dark:border-white/10 bg-white/75 dark:bg-card/60 backdrop-blur-xl px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground/90 max-w-[85%] shadow-sm">
        {text}
      </div>
    </motion.div>
  );
}

function SuggestionStrip({ suggestions, onPick }: { suggestions: Suggestion[]; onPick: (s: Suggestion) => void }) {
  // Hard cap at 2 so the strip stays a single tight row.
  const sugs = suggestions.slice(0, 2);
  return (
    <div className="px-3 pt-1.5 pb-1">
      <div className="flex flex-nowrap gap-1.5 overflow-hidden">
        {sugs.map((s, i) => {
          const Icon = (s.icon && ICONS[s.icon]) || Sparkles;
          const tone = TONE[s.tone || "blue"];
          return (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
              onClick={() => onPick(s)}
              title={s.hint || s.label}
              className={cn(
                "group inline-flex items-center gap-1 rounded-full border bg-gradient-to-r px-2 py-[3px] text-[10.5px] font-medium min-w-0 backdrop-blur transition-all hover:shadow-sm hover:-translate-y-0.5",
                tone
              )}
            >
              <Icon className="size-2.5 shrink-0" />
              <span className="text-foreground/90 truncate">{s.label}</span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}

function VizCard({ viz }: { viz: VizSpec }) {
  // Linecard and playbook render edge-to-edge (no header chrome) so they match
  // the polished reference aesthetic.
  if (viz.kind === "linecard") {
    return (
      <div className="ml-10 max-w-[92%]">
        <LinecardViz viz={viz} />
      </div>
    );
  }
  if (viz.kind === "playbook") {
    return (
      <div className="ml-10 max-w-[94%]">
        <PlaybookViz viz={viz} />
      </div>
    );
  }
  return (
    <div className="ml-10 max-w-[88%] rounded-2xl border bg-card shadow-md overflow-hidden">
      <div className="px-3.5 py-2 border-b bg-gradient-to-r from-primary/10 via-accent/8 to-transparent flex items-center gap-2">
        <div className="size-6 rounded-md bg-primary/10 grid place-items-center text-primary"><BarChart3 className="size-3" /></div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/70 truncate">{viz.title}</div>
        <Wand2 className="ml-auto size-3 text-accent" />
      </div>
      <div className="p-3.5">
        {viz.kind === "ring" && <RingViz viz={viz} />}
        {viz.kind === "bars" && <BarsViz viz={viz} />}
        {viz.kind === "spark" && <SparkViz viz={viz} />}
        {viz.kind === "donut" && <DonutViz viz={viz} />}
        {viz.kind === "checklist" && <ChecklistViz viz={viz} />}
      </div>
    </div>
  );
}

function LinecardViz({ viz }: { viz: Extract<VizSpec, { kind: "linecard" }> }) {
  const { go, pinViz, isPinned, pageCtx } = useCompanion();
  const signature = `linecard::${viz.title}`;
  const alreadyPinned = isPinned(signature);
  const [justPinned, setJustPinned] = useState(false);
  const pinned = alreadyPinned || justPinned;
  const ctaMode = viz.cta ?? "add-to-dashboard";
  const fmt = (n: number) => {
    if (viz.yFormat === "currency") {
      if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
      if (n >= 1_000) return `$${Math.round(n / 1_000)}K`;
      return `$${n}`;
    }
    if (viz.yFormat === "percent") return `${n}%`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return `${n}`;
  };
  const max = Math.max(...viz.data.map(d => d.value));
  const min = Math.min(...viz.data.map(d => d.value));
  // Round nice ticks (4 levels) anchored above max so the line breathes.
  const tickMax = niceCeil(max * 1.1);
  const ticks = [tickMax, tickMax * 0.75, tickMax * 0.5, tickMax * 0.25, 0];
  const W = 320, H = 150, padL = 46, padR = 12, padT = 10, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xs = (i: number) => padL + (viz.data.length === 1 ? innerW / 2 : (i / (viz.data.length - 1)) * innerW);
  const ys = (v: number) => padT + innerH - (v / tickMax) * innerH;
  const points = viz.data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(" ");
  void min;

  return (
    <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
      <div className="px-4 pt-3 pb-1 flex items-center gap-2">
        <div className="size-5 rounded-md bg-primary/10 grid place-items-center text-primary"><BarChart3 className="size-3" /></div>
        <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/60">Companion chart</div>
      </div>
      {viz.intro && (
        <p className="px-4 pb-2 text-[12.5px] leading-relaxed text-foreground/85">{viz.intro}</p>
      )}
      <div className="mx-3 mb-3 rounded-xl border bg-gradient-to-b from-white to-[#FAFBFD] dark:from-card dark:to-card p-3">
        <div className="text-[12.5px] font-semibold text-foreground/90 mb-1">{viz.title}</div>
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[150px]" preserveAspectRatio="none" role="img" aria-label={viz.title}>
          {/* dotted gridlines + Y-axis labels */}
          {ticks.map((t, i) => (
            <g key={i}>
              <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E2E6EE" strokeWidth="1" strokeDasharray="2 4" />
              <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize="9" fill="#7A879E" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{fmt(t)}</text>
            </g>
          ))}
          {/* X-axis labels */}
          {viz.data.map((d, i) => (
            <text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#5A6B8C">{d.label}</text>
          ))}
          {/* line + dots */}
          <motion.polyline
            initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.9, ease: "easeOut" }}
            fill="none" stroke="#0123D4" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
            points={points} vectorEffect="non-scaling-stroke"
          />
          {viz.data.map((d, i) => (
            <g key={`pt-${i}`}>
              <circle cx={xs(i)} cy={ys(d.value)} r="3.5" fill="#0123D4" />
              <circle cx={xs(i)} cy={ys(d.value)} r="1.5" fill="#fff" />
            </g>
          ))}
        </svg>
      </div>
      {ctaMode === "navigate" && viz.ctaHref && (
        <button
          onClick={() => go(viz.ctaHref!)}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 border-t bg-primary/[0.04] hover:bg-primary/[0.08] transition-colors text-[12.5px] font-semibold text-primary"
        >
          {viz.ctaLabel ?? "View Dashboard"}
          <ChevronRight className="size-4" />
        </button>
      )}
      {ctaMode === "add-to-dashboard" && (
        <div className="border-t flex">
          <button
            onClick={() => {
              if (pinned) return;
              pinViz(viz, { page: pageCtx?.title ?? "Companion", href: viz.ctaHref });
              setJustPinned(true);
            }}
            disabled={pinned}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-[12.5px] font-semibold ${
              pinned
                ? "bg-primary/[0.06] text-primary cursor-default"
                : "bg-primary/[0.04] hover:bg-primary/[0.08] text-primary"
            }`}
            aria-live="polite"
          >
            {pinned ? (
              <><Check className="size-4" /> Pinned to Dashboard</>
            ) : (
              <><Plus className="size-4" /> {viz.ctaLabel ?? "Add to Dashboard"}</>
            )}
          </button>
          <button
            onClick={() => go(viz.dashboardHref ?? "/")}
            className="px-4 py-3 border-l text-[12px] font-medium text-foreground/60 hover:text-primary hover:bg-primary/[0.04] transition-colors"
            aria-label="Open dashboard"
            title="Open dashboard"
          >
            View
          </button>
        </div>
      )}
    </div>
  );
}

// ── Adaptive suggestions ────────────────────────────────────────────────────
// Returns at most 2 suggestion chips, tailored to the most recent agent turn.
// We scan back to find the last meaningful agent message and infer 1–2 next
// best actions from its kind/content. Falls back to the page defaults.
function adaptiveSuggestions(msgs: CompanionMsg[], pageDefaults: Suggestion[]): Suggestion[] {
  const lastAgent = [...msgs].reverse().find((m): m is Extract<CompanionMsg, { role: "agent" }> => m.role === "agent");
  const lastUser  = [...msgs].reverse().find((m): m is Extract<CompanionMsg, { role: "user" }> => m.role === "user");
  if (!lastAgent) return pageDefaults.slice(0, 2);

  // 1) Playbook → suggest committing the action or snoozing it
  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "playbook") {
    const pb = lastAgent.viz;
    const out: Suggestion[] = [];
    if (pb.draft) out.push({ id: "send-draft", label: pb.draft.kind === "email" ? "Send the draft" : "Trigger request", tone: "blue", icon: "Send" });
    if (pb.contextRef?.href) out.push({ id: "open-context", label: `Open ${pb.contextRef.label}`, tone: "violet", icon: "Building2", navigateTo: pb.contextRef.href });
    if (out.length < 2) out.push({ id: "snooze", label: "Snooze 3 days", tone: "gold", icon: "Clock" });
    return out.slice(0, 2);
  }

  // 2) Linecard → "add to dashboard" already in card, so nudge for related cuts
  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "linecard") {
    return [
      { id: "by-segment", label: "Break down by segment", tone: "blue", icon: "ChartPie" },
      { id: "open-portfolio", label: "Open Portfolio", tone: "violet", icon: "BarChart3", navigateTo: "/portfolio" },
    ];
  }

  // 3) Checklist → drill in or escalate
  if (lastAgent.kind === "viz" && lastAgent.viz.kind === "checklist") {
    return [
      { id: "next", label: "What's next?", tone: "blue", icon: "ArrowRight" },
      { id: "critical", label: "Show critical only", tone: "red", icon: "AlertTriangle" },
    ];
  }

  // 4) Donut/bars → suggest a different framing
  if (lastAgent.kind === "viz" && (lastAgent.viz.kind === "donut" || lastAgent.viz.kind === "bars")) {
    return [
      { id: "by-cat", label: "Try a different cut", tone: "blue", icon: "ChartPie" },
      { id: "summary", label: "Just summarize", tone: "violet", icon: "Sparkles" },
    ];
  }

  // 5) Navigate → no chips needed; the user is moving pages
  if (lastAgent.kind === "navigate") return [];

  // 6) Text replies — if it carries explicit suggestions, respect them (capped 2)
  if (lastAgent.kind === "text" && lastAgent.suggestions?.length) {
    return lastAgent.suggestions.slice(0, 2);
  }

  // 7) Heuristic on the last user ask: if they asked "how to / help / deal with",
  //    nudge toward a follow-through action; otherwise use page defaults.
  const ut = (lastUser?.text || "").toLowerCase();
  if (/(how (do|to)|help|deal|next|what should)/.test(ut)) {
    return [
      { id: "draft", label: "Draft the next email", tone: "blue", icon: "Mail" },
      { id: "summary", label: "Summarize for me", tone: "violet", icon: "Sparkles" },
    ];
  }
  return pageDefaults.slice(0, 2);
}

// ── Playbook (specialist agent) viz ─────────────────────────────────────────
function PlaybookViz({ viz }: { viz: Extract<VizSpec, { kind: "playbook" }> }) {
  const { go } = useCompanion();
  const [openDraft, setOpenDraft] = useState(false);
  const [sent, setSent] = useState(false);
  const [stepDone, setStepDone] = useState<Set<number>>(
    () => new Set(viz.steps.map((s, i) => s.done ? i : -1).filter(i => i >= 0))
  );
  const tone = viz.specialist.tone ?? "blue";
  const toneCls: Record<string, string> = {
    blue: "bg-primary text-primary-foreground",
    gold: "bg-[#C9A227] text-white",
    violet: "bg-violet-600 text-white",
    emerald: "bg-emerald-600 text-white",
  };
  return (
    <div className="rounded-2xl border bg-card shadow-md overflow-hidden">
      {/* Specialist header */}
      <div className="px-4 pt-3 pb-2.5 flex items-center gap-2.5 border-b bg-gradient-to-r from-primary/[0.04] via-transparent to-transparent">
        <div className={`size-7 rounded-lg grid place-items-center shadow-sm ${toneCls[tone]}`}>
          <Users className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[11px] uppercase tracking-wider font-bold text-foreground/55 leading-none">Specialist · {viz.specialist.role}</div>
          <div className="text-[12.5px] font-semibold text-foreground/90 truncate leading-tight mt-0.5">{viz.specialist.name}</div>
        </div>
        <div className="size-6 rounded-md bg-primary/10 grid place-items-center text-primary"><ClipboardList className="size-3.5" /></div>
      </div>

      <div className="px-4 py-3">
        <div className="text-[13px] font-semibold text-foreground mb-1">{viz.title}</div>
        {viz.intro && <p className="text-[12.5px] leading-relaxed text-foreground/80 mb-2.5">{viz.intro}</p>}

        {/* Ordered steps */}
        <ol className="space-y-1.5">
          {viz.steps.map((s, i) => {
            const ok = stepDone.has(i);
            return (
              <li key={i} className="flex items-start gap-2.5">
                <button
                  onClick={() => setStepDone(prev => {
                    const n = new Set(prev);
                    n.has(i) ? n.delete(i) : n.add(i);
                    return n;
                  })}
                  className={`mt-[3px] size-[16px] rounded-md border-2 grid place-items-center shrink-0 transition-all ${
                    ok ? "bg-primary border-primary" : "border-foreground/25 hover:border-primary"
                  }`}
                  aria-label={ok ? "Mark incomplete" : "Mark done"}
                >
                  {ok && <Check className="size-2.5 text-white" strokeWidth={3} />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className={`text-[12.5px] leading-snug ${ok ? "line-through text-foreground/45" : "text-foreground/90"}`}>
                    <span className="font-mono text-[10.5px] text-foreground/45 mr-1.5">{String(i + 1).padStart(2, "0")}</span>
                    {s.label}
                  </div>
                  {s.detail && <div className="text-[11.5px] text-foreground/55 mt-0.5 leading-snug">{s.detail}</div>}
                </div>
              </li>
            );
          })}
        </ol>

        {/* Optional draft (collapsible) */}
        {viz.draft && (
          <div className="mt-3 rounded-xl border bg-muted/30 overflow-hidden">
            <button
              onClick={() => setOpenDraft(o => !o)}
              className="w-full px-3 py-2 flex items-center gap-2 text-[11.5px] font-semibold text-foreground/70 hover:bg-muted/60 transition-colors"
            >
              <MailIcon className="size-3.5" />
              <span>{viz.draft.kind === "email" ? "Drafted email" : "Drafted note"}</span>
              {viz.draft.subject && <span className="text-foreground/50 truncate">— {viz.draft.subject}</span>}
              <ChevronRight className={`ml-auto size-3.5 transition-transform ${openDraft ? "rotate-90" : ""}`} />
            </button>
            <AnimatePresence initial={false}>
              {openDraft && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                  className="overflow-hidden border-t bg-white dark:bg-card"
                >
                  <div className="p-3 text-[12px] text-foreground/85 space-y-1.5">
                    {viz.draft.to && <div><span className="text-foreground/50">To: </span>{viz.draft.to}</div>}
                    {viz.draft.subject && <div><span className="text-foreground/50">Subject: </span>{viz.draft.subject}</div>}
                    <pre className="whitespace-pre-wrap font-sans leading-relaxed pt-1.5 border-t mt-1.5">{viz.draft.body}</pre>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* CTA strip */}
      {viz.primaryCta && (
        <div className="border-t flex">
          <button
            onClick={() => {
              if (viz.primaryCta!.action === "navigate" && viz.primaryCta!.href) go(viz.primaryCta!.href);
              else setSent(true);
            }}
            disabled={sent && viz.primaryCta.action !== "navigate"}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 transition-colors text-[12.5px] font-semibold ${
              sent && viz.primaryCta.action !== "navigate"
                ? "bg-emerald-50 text-emerald-700 cursor-default"
                : "bg-primary/[0.04] hover:bg-primary/[0.08] text-primary"
            }`}
            aria-live="polite"
          >
            {sent && viz.primaryCta.action !== "navigate" ? (
              <><Check className="size-4" /> {viz.primaryCta.action === "send-draft" ? "Sent" : "Done"}</>
            ) : (
              <>
                {viz.primaryCta.action === "send-draft" ? <SendIcon className="size-3.5" /> : <ChevronRight className="size-3.5" />}
                {viz.primaryCta.label}
              </>
            )}
          </button>
          {viz.contextRef?.href && (
            <button
              onClick={() => go(viz.contextRef!.href!)}
              className="px-4 py-3 border-l text-[12px] font-medium text-foreground/60 hover:text-primary hover:bg-primary/[0.04] transition-colors"
            >
              {viz.contextRef.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ── Specialist agent registry + task-help intent detector ──────────────────
type Specialist = {
  name: string;
  role: string;
  tone: "blue" | "gold" | "violet" | "emerald";
  build: (taskTitle: string, ctx: { submission: string; broker?: string }) => {
    intro: string;
    steps: { label: string; detail?: string }[];
    draft?: { kind: "email" | "note"; to?: string; subject?: string; body: string };
    primaryCta?: { label: string; action: "send-draft" | "open-task" | "navigate"; href?: string };
  };
};

const SPECIALISTS: Record<string, Specialist> = {
  broker: {
    name: "Devon Carter", role: "Broker Outreach Specialist", tone: "blue",
    build: (title, ctx) => ({
      intro: `Here's a clean broker-outreach play for "${title}". I've prepped the email and a 48-hr follow-up so nothing slips.`,
      steps: [
        { label: "Pull broker contact + UE submission ref", detail: `${ctx.submission} · ${ctx.broker ?? "broker on file"}` },
        { label: "Draft outreach email (loss runs + open claim detail)", detail: "Pre-filled below — review before sending." },
        { label: "Set 48-hr follow-up reminder", detail: "Auto-files a Task if no reply." },
        { label: "Log broker promise + escalate on slip", detail: "Slipped promises route to UW lead automatically." },
      ],
      draft: {
        kind: "email",
        to: ctx.broker ?? "broker@partner.com",
        subject: `${ctx.submission} — open claims detail request`,
        body: `Hi,\n\nFor ${ctx.submission} I'm preparing the indication and need open-claims detail (incurred + reserves) on any open files referenced in the prior carrier loss runs.\n\nIf available today, I can hold the quote timeline; otherwise I'll need to flag this for senior referral.\n\nThanks,\nMaya Khanna · United Educators`,
      },
      primaryCta: { label: "Send draft", action: "send-draft" },
    }),
  },
  compliance: {
    name: "Priya Shah", role: "Compliance & Forms Specialist", tone: "gold",
    build: (title, ctx) => ({
      intro: `Walking the compliance checklist for "${title}". I'll flag any UE-required addendum that's missing for ${ctx.submission}.`,
      steps: [
        { label: "Pull UE-required forms for this risk tier", detail: "Sexual Misconduct addendum, COPE survey, SIR funding statement (where applicable)." },
        { label: "Cross-check submitted vs required", detail: "Diff highlights any gaps." },
        { label: "Trigger missing-document request to broker", detail: "Auto-fills standard UE language + 5-day SLA." },
        { label: "Mark compliance verified once received", detail: "Updates submission status & unblocks pricing." },
      ],
      primaryCta: { label: "Trigger document request", action: "send-draft" },
    }),
  },
  review: {
    name: "John Michaels", role: "Risk Review Specialist", tone: "violet",
    build: (title, ctx) => ({
      intro: `Standard review play for "${title}". I'll surface anything that crosses a referral trigger on ${ctx.submission}.`,
      steps: [
        { label: "Open the report and extract the headline metric", detail: "GASB 68 → funded ratio; loss report → 5-yr LR; financials → liquidity." },
        { label: "Compare against UE thresholds", detail: ">75% LR, <80% pension funded, factor >1.20× → referral." },
        { label: "Document conclusion in the submission notes", detail: "One-line rationale + any required approvals." },
        { label: "Route to senior UW if a trigger fires", detail: "Auto-pings Robert Chen with the trigger reason." },
      ],
      primaryCta: { label: "Open submission", action: "navigate", href: `/submission/${ctx.submission}` },
    }),
  },
  pricing: {
    name: "Maya Khanna", role: "Pricing & Quote Specialist", tone: "blue",
    build: (title, ctx) => ({
      intro: `Indicative-quote play for "${title}". I've laid out the rate path and the broker letter is ready.`,
      steps: [
        { label: "Confirm target premium against rate factor band", detail: "0.85×–1.30× standard; >1.20× needs RM sign-off." },
        { label: "Generate indicative quote letter", detail: "Pulled from UE template; pre-filled limits/SIR." },
        { label: "Route to broker (CC: UW lead)", detail: ctx.broker ? `Broker on file: ${ctx.broker}` : "Tier-1 broker preferred." },
        { label: "Log the indication + 7-day expiration", detail: "Auto-reminders fire on day 5 and day 7." },
      ],
      draft: {
        kind: "email",
        to: ctx.broker ?? "broker@partner.com",
        subject: `${ctx.submission} — indicative terms`,
        body: `Hi,\n\nIndicative terms for ${ctx.submission} below — subject to receipt of remaining UE-required documentation and final senior UW review.\n\n• Limits: $5M / $10M\n• SIR: $50K\n• Factor: 1.10× (standard band)\n\nLetter attached. Indication holds for 7 days.\n\n— Maya Khanna · United Educators`,
      },
      primaryCta: { label: "Send indication", action: "send-draft" },
    }),
  },
  inspection: {
    name: "James Owens", role: "Loss-Control Coordinator", tone: "emerald",
    build: (title, ctx) => ({
      intro: `Setting up the loss-control inspection for "${title}". Standard COPE survey + sprinkler verification on ${ctx.submission}.`,
      steps: [
        { label: "Confirm inspector availability for the territory" },
        { label: "Send scheduling email to risk manager", detail: "Auto-routes to vendor on accept." },
        { label: "File COPE template + sprinkler addendum requirements" },
        { label: "Add follow-up task at T+10 days for the report" },
      ],
      primaryCta: { label: "Send scheduling email", action: "send-draft" },
    }),
  },
};

function pickSpecialist(taskTitle: string, category: string): Specialist {
  const t = taskTitle.toLowerCase();
  if (/quote|indicat|pric|premium|rate/.test(t)) return SPECIALISTS.pricing!;
  if (/inspect|survey|loss[\s-]?control|cope|earthquake|surveyor/.test(t)) return SPECIALISTS.inspection!;
  if (/review|report|gasb|naic|cross[\s-]?check|tiv/.test(t)) return SPECIALISTS.review!;
  if (/verif|background|compliance|missing|addendum|questionnaire|cope survey receipt/.test(t)) return SPECIALISTS.compliance!;
  if (/broker|outreach|claim|obtain|request/.test(t)) return SPECIALISTS.broker!;
  // Fallback by category
  if (category === "outreach" || category === "documentation") return SPECIALISTS.broker!;
  if (category === "verification") return SPECIALISTS.compliance!;
  if (category === "review") return SPECIALISTS.review!;
  return SPECIALISTS.broker!;
}

function tryTaskHelpIntent(raw: string, history: CompanionMsg[]): CompanionMsg | null {
  const text = raw.toLowerCase();
  const askVerb = /(how (do|to|should) i|how (do|to) (we|you)|help me (with|on|deal)|deal with|walk me through|what (do|should) i do|next steps?|can you help)/i.test(text);
  if (!askVerb) return null;

  // Try to match a task by title fuzzy/contains, fall back to "the first/this task" referencing the most recent agent message that listed tasks.
  const lower = text.toLowerCase();
  let match = TASKS.find(t => lower.includes(t.title.toLowerCase().slice(0, 14)));
  if (!match) {
    // Match a salient phrase from any task title (e.g. "open claims", "background check", "GASB", "indicative quote").
    const keywords = TASKS.map(t => ({ t, kw: t.title.toLowerCase().split(/\s+/).filter(w => w.length > 4) }));
    for (const { t, kw } of keywords) {
      const hits = kw.filter(w => lower.includes(w)).length;
      if (hits >= 2) { match = t; break; }
    }
  }
  if (!match) {
    // Look back at the most recent agent message that referenced a task title.
    for (let i = history.length - 1; i >= 0; i--) {
      const m = history[i]!;
      if (m.role !== "agent") continue;
      const body = m.kind === "text" ? m.text : m.kind === "viz" ? JSON.stringify(m.viz) : m.kind === "navigate" ? m.text : "";
      const hit = TASKS.find(t => body.includes(t.title));
      if (hit) { match = hit; break; }
    }
  }
  if (!match) return null;

  const spec = pickSpecialist(match.title, match.category);
  const built = spec.build(match.title, { submission: match.submissionShort, broker: undefined });
  return {
    id: newId(), role: "agent", kind: "viz", ts: now(),
    viz: {
      kind: "playbook",
      title: match.title,
      specialist: { name: spec.name, role: spec.role, tone: spec.tone },
      intro: built.intro,
      steps: built.steps,
      draft: built.draft,
      primaryCta: built.primaryCta,
      contextRef: { label: match.submissionShort, href: `/submission/${match.submission}` },
    },
  };
}

// ── Navigation intent detector ──────────────────────────────────────────────
// Routes named pages and "take me there" follow-ups. Conservative: requires an
// explicit nav verb so casual mentions don't trigger an unwanted page change.
const ROUTES: { match: RegExp; href: string; label: string }[] = [
  { match: /\bnew (submission|account|risk)\b|\bsubmit (a |new )?(submission|account)\b/i, href: "/new-submission", label: "New submission" },
  { match: /\bsubmissions?\b(?! (id|number|#))/i,           href: "/submissions", label: "Submissions" },
  { match: /\binbox\b|\bemails?\b|\bmessages?\b/i,           href: "/inbox",       label: "Inbox" },
  { match: /\btasks?\b|\bto[\s-]?dos?\b/i,                   href: "/tasks",       label: "Tasks" },
  { match: /\bportfolio\b|\banalytics\b|\bbook (health|performance)\b|\bdashboard\b/i, href: "/portfolio", label: "Portfolio" },
  { match: /\bappetite\b|\bappetite explorer\b/i,            href: "/appetite",    label: "Appetite" },
  { match: /\b(workbench|home|today|main)\b/i,               href: "/",            label: "Workbench" },
];

function tryNavIntent(raw: string, history: CompanionMsg[]): { href: string; label: string; confirmation: string } | null {
  const text = raw.toLowerCase().trim();
  const hasNavVerb = /\b(take me|go to|open|navigate|show me|jump to|head to|bring me|let'?s go|move to|switch to)\b/.test(text)
                  || /\b(can you|please|could you)\s+(take|open|navigate|show|jump|move|switch|bring)/.test(text)
                  || /^(take|open|navigate|show|jump|move|switch|bring)/.test(text);
  if (!hasNavVerb) return null;

  // Submission ID like "SUB-7829"
  const subMatch = raw.match(/\b(SUB-?\d{3,5})\b/i);
  if (subMatch) {
    const id = subMatch[1]!.toUpperCase().replace(/^SUB(?!-)/, "SUB-");
    return { href: `/submission/${id}`, label: id, confirmation: `On it — opening ${id}.` };
  }

  // Direct page name in the request
  const direct = ROUTES.find(r => r.match.test(text));
  if (direct) return { href: direct.href, label: direct.label, confirmation: `On it — taking you to ${direct.label}.` };

  // Generic ("take me there") → fall back to the most-recent agent message that
  // mentioned a known destination.
  for (let i = history.length - 1; i >= 0; i--) {
    const m = history[i]!;
    if (m.role !== "agent") continue;
    const body = m.kind === "text" ? m.text : m.kind === "navigate" ? m.text : m.kind === "viz" ? m.viz.title : "";
    if (!body) continue;
    const found = ROUTES.find(r => r.match.test(body));
    if (found) return { href: found.href, label: found.label, confirmation: `Got it — opening ${found.label}.` };
  }
  return null;
}

// ── Generic chart-intent detector ────────────────────────────────────────────
// Only emits a chart when the user explicitly asks (show / plot / chart / trend
// / graph / monthly). Returns null otherwise so the LLM handles the reply.
const MONTHS = ["jan","feb","mar","apr","may","jun","jul","aug","sep","oct","nov","dec"];
const MONTH_LONG = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SEGMENTS: { match: RegExp; label: string; base: number; trend: number }[] = [
  { match: /\bk[\s-]?12 public\b|public school/i,  label: "K-12 Public",  base: 920_000, trend: 1.06 },
  { match: /\bk[\s-]?12 private\b|private school/i, label: "K-12 Private", base: 410_000, trend: 1.04 },
  { match: /\bhigher\s?ed|university|college\b/i,   label: "Higher Ed",    base: 780_000, trend: 1.05 },
  { match: /\bcharter\b/i,                          label: "Charter",      base: 180_000, trend: 1.03 },
  { match: /\bcyber\b/i,                            label: "Cyber Liability", base: 240_000, trend: 1.08 },
  { match: /\beducators?\s?legal|epl\b/i,           label: "Educators Legal Liability", base: 540_000, trend: 1.04 },
];

function tryChartIntent(raw: string): CompanionMsg | null {
  const text = raw.toLowerCase();
  const askedForChart = /\b(show|plot|chart|graph|trend|monthly|over time|by month|by quarter|view dashboard)\b/.test(text);
  if (!askedForChart) return null;

  // Detect month range like "jan to apr" or "from january to march"
  const range = text.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\s*(?:to|through|-|–)\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*/i);
  let months: string[] = [];
  if (range) {
    const norm = (s: string) => s.slice(0, 3).toLowerCase().replace("sep", "sep");
    const a = MONTHS.indexOf(norm(range[1]));
    const b = MONTHS.indexOf(norm(range[2]));
    if (a >= 0 && b >= 0) {
      const lo = Math.min(a, b), hi = Math.max(a, b);
      months = MONTH_LONG.slice(lo, hi + 1).map(m => `${m.slice(0, 3)}`);
    }
  }
  if (!months.length) {
    // Default to last 6 months ending at current
    const now = new Date(); const cur = now.getMonth();
    months = Array.from({ length: 6 }, (_, i) => MONTH_LONG[(cur - 5 + i + 12) % 12].slice(0, 3));
  }

  // Detect segment / line of business
  const seg = SEGMENTS.find(s => s.match.test(text)) ?? SEGMENTS[0]!;

  // Build realistic-looking monthly placed premium series with light noise.
  const data = months.map((m, i) => {
    const drift = Math.pow(seg.trend, i);
    const noise = 0.92 + (((i * 9301 + 49297) % 233) / 233) * 0.16;
    return { label: m, value: Math.round((seg.base * drift * noise) / 1_000) * 1_000 };
  });

  const isLossRatio = /\bloss ratio|lr\b/.test(text);
  const isBindRate = /\bbind rate|hit ratio\b/.test(text);

  let title = `${seg.label} monthly placed premium`;
  let yFormat: "currency" | "percent" | "number" = "currency";
  let intro = `${seg.label} placed premium across the requested period — steady momentum with no anomalies versus the rolling 12-month baseline.`;

  if (isLossRatio) {
    title = `${seg.label} loss ratio`;
    yFormat = "percent";
    const lrSeries = months.map((m, i) => ({ label: m, value: Math.max(28, Math.min(72, 46 + Math.round(Math.sin(i) * 6))) }));
    intro = `${seg.label} loss-ratio trend — within target band (45–60%). Open the dashboard for segment, geography and carrier breakouts.`;
    return {
      id: newId(), role: "agent", kind: "viz", ts: now(),
      viz: { kind: "linecard", title, intro, data: lrSeries, yFormat, cta: "add-to-dashboard", dashboardHref: "/" },
    };
  }
  if (isBindRate) {
    title = `${seg.label} bind rate`;
    yFormat = "percent";
    const brSeries = months.map((m, i) => ({ label: m, value: Math.max(20, Math.min(48, 32 + Math.round(Math.cos(i) * 5))) }));
    intro = `${seg.label} bind rate by month — tracking just above the 30% book average.`;
    return {
      id: newId(), role: "agent", kind: "viz", ts: now(),
      viz: { kind: "linecard", title, intro, data: brSeries, yFormat, cta: "add-to-dashboard", dashboardHref: "/" },
    };
  }

  const total = data.reduce((a, d) => a + d.value, 0);
  const totalFmt = total >= 1_000_000 ? `$${(total / 1_000_000).toFixed(1)}M` : `$${Math.round(total / 1_000)}K`;
  intro = `${seg.label} placed premium for the requested period totals ${totalFmt} — steady month-over-month growth versus the rolling 12-month baseline.`;

  return {
    id: newId(), role: "agent", kind: "viz", ts: now(),
    viz: { kind: "linecard", title, intro, data, yFormat, cta: "add-to-dashboard", dashboardHref: "/" },
  };
}

function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const m = n / pow;
  const nice = m <= 1 ? 1 : m <= 2 ? 2 : m <= 2.5 ? 2.5 : m <= 5 ? 5 : 10;
  return nice * pow;
}

function RingViz({ viz }: { viz: Extract<VizSpec, { kind: "ring" }> }) {
  const circ = 2 * Math.PI * 32;
  const off = circ - (viz.value / 100) * circ;
  return (
    <div className="flex items-center gap-4">
      <div className="relative size-20 shrink-0">
        <svg viewBox="0 0 100 100" className="-rotate-90">
          <circle cx="50" cy="50" r="32" stroke="currentColor" className="text-muted" strokeWidth="9" fill="none" />
          <motion.circle cx="50" cy="50" r="32" stroke="url(#ring-grad-c)" strokeWidth="9" fill="none" strokeLinecap="round"
            strokeDasharray={circ} initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ duration: 1, ease: "easeOut" }} />
          <defs>
            <linearGradient id="ring-grad-c" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#0123D4" /><stop offset="100%" stopColor="#C9A227" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center">
            <div className="font-display text-xl font-bold leading-none">{viz.value}</div>
            <div className="text-[8px] uppercase tracking-wider text-muted-foreground mt-0.5">/ 100</div>
          </div>
        </div>
      </div>
      <div className="flex-1 space-y-1.5">
        {viz.bars?.map(b => (
          <div key={b.label}>
            <div className="flex justify-between text-[10px] mb-0.5"><span className="text-muted-foreground">{b.label}</span><span className="font-mono-tabular font-bold">{b.value}</span></div>
            <div className="h-1 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${b.value}%` }} transition={{ duration: 0.8 }}
                className={cn("h-full rounded-full", b.tone === "gold" ? "bg-accent" : "bg-primary")} />
            </div>
          </div>
        ))}
      </div>
      {viz.note && <div className="sr-only">{viz.note}</div>}
    </div>
  );
}

function BarsViz({ viz }: { viz: Extract<VizSpec, { kind: "bars" }> }) {
  const max = Math.max(...viz.series.map(s => s.value), 1);
  return (
    <div className="space-y-2">
      {viz.series.map(s => {
        const tone = s.tone === "gold" ? "bg-accent" : s.tone === "green" ? "bg-emerald-500" : s.tone === "red" ? "bg-rose-500" : "bg-primary";
        return (
          <div key={s.label}>
            <div className="flex justify-between text-[11px] mb-1"><span className="font-medium text-foreground/80">{s.label}</span><span className="font-mono-tabular font-bold">{s.value}{viz.unit ?? ""}</span></div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(s.value / max) * 100}%` }} transition={{ duration: 0.7, ease: "easeOut" }} className={cn("h-full rounded-full", tone)} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SparkViz({ viz }: { viz: Extract<VizSpec, { kind: "spark" }> }) {
  const max = Math.max(...viz.data); const min = Math.min(...viz.data); const span = max - min || 1;
  const points = viz.data.map((v, i) => `${(i / (viz.data.length - 1)) * 100},${100 - ((v - min) / span) * 90 - 5}`).join(" ");
  const stroke = viz.tone === "gold" ? "#C9A227" : viz.tone === "green" ? "#10B981" : viz.tone === "red" ? "#E11D48" : "#0123D4";
  return (
    <div>
      <div className="flex items-end justify-between mb-1.5">
        <div>
          <div className="font-display text-2xl font-bold">{viz.current}</div>
          {viz.delta && <div className="text-[10px] text-emerald-700 font-semibold">{viz.delta}</div>}
        </div>
        {viz.subtitle && <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{viz.subtitle}</div>}
      </div>
      <svg viewBox="0 0 100 100" className="w-full h-20" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`sg-${viz.title}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.32" /><stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        <motion.polyline initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.1 }}
          fill="none" stroke={stroke} strokeWidth="2" strokeLinecap="round" points={points} vectorEffect="non-scaling-stroke" />
        <polyline points={`0,100 ${points} 100,100`} fill={`url(#sg-${viz.title})`} stroke="none" />
      </svg>
    </div>
  );
}

function DonutViz({ viz }: { viz: Extract<VizSpec, { kind: "donut" }> }) {
  const total = viz.segments.reduce((a, s) => a + s.value, 0) || 1;
  let off = 0;
  const C = 2 * Math.PI * 30;
  return (
    <div className="flex items-center gap-3">
      <svg viewBox="0 0 80 80" className="size-24 -rotate-90">
        <circle cx="40" cy="40" r="30" fill="none" stroke="hsl(var(--muted))" strokeWidth="11" />
        {viz.segments.map(s => {
          const len = (s.value / total) * C;
          const el = <circle key={s.label} cx="40" cy="40" r="30" fill="none" stroke={s.color} strokeWidth="11" strokeDasharray={`${len} ${C - len}`} strokeDashoffset={-off} />;
          off += len;
          return el;
        })}
      </svg>
      <ul className="flex-1 space-y-1.5 text-[11px]">
        {viz.segments.map(s => (
          <li key={s.label} className="flex items-center gap-2">
            <span className="size-2.5 rounded-sm" style={{ background: s.color }} />
            <span className="flex-1 truncate">{s.label}</span>
            <span className="font-mono-tabular font-bold">{Math.round((s.value / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ChecklistViz({ viz }: { viz: Extract<VizSpec, { kind: "checklist" }> }) {
  return (
    <ul className="space-y-1.5 text-[12px]">
      {viz.items.map((it, i) => (
        <li key={i} className="flex items-start gap-2 rounded-lg p-1.5 hover:bg-muted/40">
          <span className={cn("size-5 rounded-full grid place-items-center shrink-0 mt-0.5",
            it.ok ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700")}>
            {it.ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
          </span>
          <div className="flex-1 min-w-0">
            <div className="font-medium leading-tight">{it.label}</div>
            {it.sub && <div className="text-[10px] text-muted-foreground mt-0.5">{it.sub}</div>}
          </div>
        </li>
      ))}
    </ul>
  );
}

// Background-job glass tray (top-right). Rendered next to companion panel.
export function CompanionBackgroundTray() {
  const { jobs, dismissJob, go, collapsed } = useCompanion();
  if (!jobs.length) return null;
  return (
    <div className={cn("fixed top-4 z-40 flex flex-col gap-2 max-w-[360px] pointer-events-none", collapsed ? "right-20" : "right-[400px] xl:right-[440px]")}>
      <AnimatePresence>
        {jobs.map(job => (
          <motion.div
            key={job.id}
            initial={{ opacity: 0, y: -16, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: 30 }}
            transition={{ type: "spring", damping: 22, stiffness: 300 }}
            className="pointer-events-auto rounded-2xl border border-white/40 bg-white/85 dark:bg-card/85 backdrop-blur-xl shadow-2xl overflow-hidden"
          >
            <div className="px-3.5 pt-3 pb-2 flex items-start gap-2.5">
              <div className="relative size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center shrink-0">
                <Sparkles className="size-4 text-white" />
                {!job.done && <span className="absolute -top-1 -right-1 size-2.5 rounded-full bg-emerald-400 animate-pulse ring-2 ring-white" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] font-bold text-foreground leading-tight">{job.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{job.subtitle}</div>
              </div>
              <button onClick={() => dismissJob(job.id)} className="size-6 rounded-md hover:bg-muted grid place-items-center text-muted-foreground">
                <X className="size-3" />
              </button>
            </div>
            <div className="h-1 bg-muted">
              <motion.div className={cn("h-full", job.done ? "bg-emerald-500" : "bg-gradient-to-r from-primary to-accent")} animate={{ width: `${job.progress}%` }} transition={{ duration: 0.4 }} />
            </div>
            <div className="px-3.5 py-2 border-t bg-gradient-to-b from-transparent to-muted/20">
              <div className="text-[11px] text-foreground/85 leading-snug min-h-[16px]">
                {job.done ? "Done — comprehension complete." : (job.steps[Math.min(job.stepIdx, job.steps.length - 1)] ?? "Working…")}
              </div>
              {job.done && job.href && (
                <button onClick={() => { go(job.href!); dismissJob(job.id); }}
                  className="mt-2 inline-flex items-center gap-1.5 text-[11px] font-semibold text-primary hover:underline">
                  Open submission <ArrowRight className="size-3" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
