import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
  type ReactNode,
} from "react";
import { useNavigate } from "react-router-dom";

export type SuggestionTone = "blue" | "gold" | "green" | "red" | "violet";
export type Suggestion = {
  id: string;
  label: string;
  hint?: string;
  tone?: SuggestionTone;
  icon?: string;
  navigateTo?: string;
  payload?: unknown;
};

export type VizSpec =
  | { kind: "ring"; title: string; value: number; bars?: { label: string; value: number; tone?: "blue" | "gold" }[]; note?: string; cta?: "add-to-dashboard" | "none"; ctaLabel?: string; dashboardHref?: string }
  | { kind: "bars"; title: string; series: { label: string; value: number; tone?: "blue" | "gold" | "green" | "red" }[]; unit?: string; cta?: "add-to-dashboard" | "none"; ctaLabel?: string; dashboardHref?: string }
  | { kind: "spark"; title: string; subtitle?: string; data: number[]; current: string; delta?: string; tone?: "blue" | "gold" | "green" | "red"; cta?: "add-to-dashboard" | "none"; ctaLabel?: string; dashboardHref?: string }
  | { kind: "donut"; title: string; segments: { label: string; value: number; color: string }[]; subtitle?: string; cta?: "add-to-dashboard" | "none"; ctaLabel?: string; dashboardHref?: string }
  | { kind: "checklist"; title: string; items: { ok: boolean; label: string; sub?: string; href?: string }[] }
  | {
      kind: "playbook";
      title: string;
      specialist: { name: string; role: string; tone?: "blue" | "gold" | "violet" | "emerald" };
      intro?: string;
      steps: { label: string; detail?: string; done?: boolean }[];
      draft?: { kind: "email" | "note"; to?: string; subject?: string; body: string };
      primaryCta?: { label: string; action: "send-draft" | "open-task" | "navigate"; href?: string };
      contextRef?: { label: string; href?: string };
    }
  | {
      kind: "linecard";
      title: string;
      intro?: string;
      data: { label: string; value: number }[];
      yFormat?: "currency" | "percent" | "number";
      cta?: "add-to-dashboard" | "navigate" | "none";
      ctaLabel?: string;
      ctaHref?: string;
      dashboardHref?: string;
    };

export type CompanionMsg =
  | { id: string; role: "agent"; kind: "text"; text: string; ts: string; suggestions?: Suggestion[] }
  | { id: string; role: "agent"; kind: "viz"; viz: VizSpec; ts: string; suggestions?: Suggestion[] }
  | { id: string; role: "agent"; kind: "navigate"; text: string; href: string; label: string; ts: string }
  | { id: string; role: "user"; kind: "text"; text: string; ts: string };

export type BackgroundJob = {
  id: string;
  title: string;
  subtitle: string;
  progress: number;
  done?: boolean;
  href?: string;
  steps: string[];
  stepIdx: number;
};

export type PageContext = {
  routeKey: string;
  title: string;
  subtitle?: string;
  greeting: string;
  suggestions: Suggestion[];
  respond?: (sid: string, suggestion: Suggestion) => CompanionMsg[] | void;
  freeText?: (text: string) => CompanionMsg[] | void;
  facts?: () => string;
};

export type PinnedViz = {
  id: string;
  signature: string;
  pinnedAt: number;
  source?: { page: string; href?: string };
  viz: VizSpec;
};

interface Ctx {
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
  pageCtx: PageContext | null;
  setPageContext: (ctx: PageContext) => void;
  clearPageContext: (routeKey: string) => void;
  history: Record<string, CompanionMsg[]>;
  pushMsg: (routeKey: string, ...m: CompanionMsg[]) => void;
  resetThread: (routeKey: string) => void;
  jobs: BackgroundJob[];
  startJob: (job: Omit<BackgroundJob, "progress" | "stepIdx" | "done">) => string;
  dismissJob: (id: string) => void;
  sidebarCollapsed: boolean;
  setSidebarCollapsed: (b: boolean) => void;
  go: (href: string) => void;
  pinned: PinnedViz[];
  pinViz: (viz: VizSpec, source?: { page: string; href?: string }) => string | null;
  unpinViz: (id: string) => void;
  isPinned: (signature: string) => boolean;
  // Legacy API consumed by ChatBot + NewSubmissionPage — preserved for compatibility.
  selectedProducts: string[];
  setSelectedProducts: (products: string[]) => void;
}

function vizSignature(v: VizSpec): string { return `${v.kind}::${"title" in v ? v.title : ""}`; }
const PINS_KEY = "uw.pinnedVizzes.v1";

const CompanionCtx = createContext<Ctx | null>(null);

export function now() { return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }); }
export const newId = () => `m_${Math.random().toString(36).slice(2, 10)}`;

export function CompanionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false); // default open — matches Underwriter-Vision static-rail behavior.
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [pageCtx, setPageCtxState] = useState<PageContext | null>(null);
  const [history, setHistory] = useState<Record<string, CompanionMsg[]>>({});
  const [jobs, setJobs] = useState<BackgroundJob[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const jobTimers = useRef<Record<string, number>>({});

  const setPageContext = useCallback((ctx: PageContext) => {
    setPageCtxState(ctx);
    setHistory(h => {
      const existing = h[ctx.routeKey];
      if (existing?.length) {
        // Keep the existing thread but refresh the seed greeting's chips so
        // suggestion lists never go stale when the page updates its pack.
        const [first, ...rest] = existing;
        if (first.role === "agent" && first.kind === "text") {
          return { ...h, [ctx.routeKey]: [{ ...first, text: ctx.greeting, suggestions: ctx.suggestions }, ...rest] };
        }
        return h;
      }
      const greet: CompanionMsg = {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: ctx.greeting, suggestions: ctx.suggestions,
      };
      return { ...h, [ctx.routeKey]: [greet] };
    });
  }, []);

  const clearPageContext = useCallback((routeKey: string) => {
    setPageCtxState(p => (p && p.routeKey === routeKey ? null : p));
  }, []);

  const pushMsg = useCallback((routeKey: string, ...m: CompanionMsg[]) => {
    setHistory(h => ({ ...h, [routeKey]: [...(h[routeKey] || []), ...m] }));
  }, []);

  const resetThread = useCallback((routeKey: string) => {
    setHistory(h => {
      const copy = { ...h };
      delete copy[routeKey];
      return copy;
    });
    if (pageCtx && pageCtx.routeKey === routeKey) {
      const greet: CompanionMsg = { id: newId(), role: "agent", kind: "text", ts: now(), text: pageCtx.greeting, suggestions: pageCtx.suggestions };
      setHistory(h => ({ ...h, [routeKey]: [greet] }));
    }
  }, [pageCtx]);

  const startJob: Ctx["startJob"] = useCallback((j) => {
    const id = j.id || `job_${Math.random().toString(36).slice(2, 9)}`;
    const job: BackgroundJob = { ...j, id, progress: 0, stepIdx: 0, done: false };
    setJobs(prev => prev.some(p => p.id === id) ? prev : [...prev, job]);
    if (jobTimers.current[id]) return id;
    const total = j.steps.length;
    const tick = () => {
      setJobs(prev => prev.map(x => {
        if (x.id !== id || x.done) return x;
        const nextIdx = Math.min(x.stepIdx + 1, total);
        const prog = Math.min(100, Math.round((nextIdx / total) * 100));
        const done = nextIdx >= total;
        if (done && jobTimers.current[id]) {
          window.clearInterval(jobTimers.current[id]);
          delete jobTimers.current[id];
        }
        return { ...x, stepIdx: nextIdx, progress: prog, done };
      }));
    };
    jobTimers.current[id] = window.setInterval(tick, 700);
    return id;
  }, []);

  const dismissJob = useCallback((id: string) => {
    if (jobTimers.current[id]) { window.clearInterval(jobTimers.current[id]); delete jobTimers.current[id]; }
    setJobs(prev => prev.filter(j => j.id !== id));
  }, []);

  useEffect(() => () => { Object.values(jobTimers.current).forEach(id => window.clearInterval(id)); }, []);

  const go = useCallback((href: string) => navigate(href), [navigate]);

  const [pinned, setPinned] = useState<PinnedViz[]>(() => {
    if (typeof window === "undefined") return [];
    try { return JSON.parse(window.localStorage.getItem(PINS_KEY) || "[]") as PinnedViz[]; }
    catch { return []; }
  });
  useEffect(() => {
    try { window.localStorage.setItem(PINS_KEY, JSON.stringify(pinned)); } catch { /* ignore */ }
  }, [pinned]);

  const pinViz = useCallback<Ctx["pinViz"]>((viz, source) => {
    const signature = vizSignature(viz);
    let createdId: string | null = null;
    setPinned(prev => {
      if (prev.some(p => p.signature === signature)) return prev;
      const id = newId();
      createdId = id;
      return [{ id, signature, pinnedAt: Date.now(), source, viz }, ...prev];
    });
    return createdId;
  }, []);
  const unpinViz = useCallback<Ctx["unpinViz"]>((id) => {
    setPinned(prev => prev.filter(p => p.id !== id));
  }, []);
  const isPinned = useCallback<Ctx["isPinned"]>((signature) => pinned.some(p => p.signature === signature), [pinned]);

  const value = useMemo<Ctx>(() => ({
    collapsed, setCollapsed,
    pageCtx, setPageContext, clearPageContext,
    history, pushMsg, resetThread,
    jobs, startJob, dismissJob,
    sidebarCollapsed, setSidebarCollapsed,
    go,
    pinned, pinViz, unpinViz, isPinned,
    selectedProducts, setSelectedProducts,
  }), [collapsed, pageCtx, setPageContext, clearPageContext, history, pushMsg, resetThread, jobs, startJob, dismissJob, sidebarCollapsed, go, pinned, pinViz, unpinViz, isPinned, selectedProducts]);

  return <CompanionCtx.Provider value={value}>{children}</CompanionCtx.Provider>;
}

export function useCompanion() {
  const c = useContext(CompanionCtx);
  if (!c) throw new Error("useCompanion must be used within CompanionProvider");
  return c;
}

export function usePageCompanion(ctx: PageContext) {
  const { setPageContext, clearPageContext } = useCompanion();
  const ctxRef = useRef(ctx);
  ctxRef.current = ctx;

  useEffect(() => {
    setPageContext(ctxRef.current);
    const key = ctxRef.current.routeKey;
    return () => clearPageContext(key);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.routeKey]);

  useEffect(() => {
    setPageContext(ctxRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.title, ctx.subtitle, ctx.greeting, ctx.suggestions, ctx.respond, ctx.freeText, ctx.facts]);
}
