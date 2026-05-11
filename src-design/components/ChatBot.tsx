import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation, useNavigate } from "react-router";
import {
  Send, Sparkles, AlertCircle, ChevronRight, ChevronLeft,
  RotateCcw, CheckCircle2, AlertTriangle, Info,
  Shield, ArrowLeft, Database, Clock, Check,
  FileText, TrendingUp, TrendingDown, Zap, Activity,
  PieChart, BarChart2, Target, Layers,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCompanion } from "../context/CompanionContext";

// ── Tokens ─────────────────────────────────────────────────────────────────────
const NAVY   = "#0C1D3B";
const BLUE   = "#0123D4";
const GOLD   = "#C9A227";
const GREEN  = "#1A7A4A";
const ORANGE = "#C2651A";
const RED    = "#B91C1C";
const PURPLE = "#7B2FBE";
const BDL    = "#DCE3EC";
const TM     = "#4A5D6E";
const TT     = "#7A8FA3";
const font   = "'Source Sans 3', system-ui, sans-serif";
const SH_SM  = "0 1px 3px rgba(0,0,0,0.06),0 2px 8px rgba(0,0,0,0.04)";
const SH_MD  = "0 4px 16px rgba(0,0,0,0.09),0 1px 4px rgba(0,0,0,0.05)";
const R      = 10;

// ── Types ──────────────────────────────────────────────────────────────────────
type CompanionMode  = "proactive" | "drilldown" | "conversational";
type FlagSeverity   = "critical" | "warning" | "info" | "positive";
type DocStatus      = "pending" | "received" | "na";
type DocCategory    = "Universal" | "GL" | "GL-BLX" | "ML" | "PL" | "EL-AR";
type NewSubPhase    = "checklist" | "reviewing" | "reviewed";
type ActionOwner    = "Broker/User" | "System Automation" | "Underwriter";
type ActionPriority = "urgent" | "required" | "optional";

interface Flag { id: string; severity: FlagSeverity; title: string; summary: string; detail: string; historicalContext?: string; dataSource?: string; recommendedAction?: string; quickAsks?: string[]; }
interface DocItem { id: string; label: string; category: DocCategory; required: boolean; note?: string; }
interface ProactiveContent { contextLabel: string; headline: string; subline?: string; flags: Flag[]; nextDecision?: string; suggestedActions?: { label: string; primary?: boolean; prompt?: string }[]; }
interface Message { id: string; role: "user" | "assistant"; text: string; ts: Date; }
interface DimensionFinding { type: "positive" | "warning" | "critical" | "info"; text: string; }
interface DimensionResult  { score: number; scoreLabel: string; scoreColor: string; findings: DimensionFinding[]; }
interface ProductRecommendation { product: string; reason: string; priority: "high" | "medium" | "low"; }
interface ActionItem { gap: string; action: string; owner: ActionOwner; priority: ActionPriority; }
interface DocReviewResult { appetite: DimensionResult; claims: DimensionResult; benchmark: DimensionResult; recommendations: ProductRecommendation[]; actionItems: ActionItem[]; }

// ── Product sets ───────────────────────────────────────────────────────────────
const GL_PRODUCTS  = ["Primary General Liability (CGL)", "Buffer Excess Liability (BLX)", "General Liability Excess (GLX)", "Public School Liability (PSL)"];
const ML_PRODUCTS  = ["Educators Legal Liability (ELL)", "Excess Educators Legal Liability (ELX)", "Fiduciary Liability (FDL)", "Excess Fiduciary Liability (FDX)", "School Board Legal (SBL)"];
const EL_AR_PRODS  = ["Excess Following Form (XFF)", "Excess Liability Following Form - Shared Aggregate Limit of Liability (XPG)", "Assumed Public School (RPS)", "Assumed Higher Education (RPH)"];

const CATEGORY_META: Record<DocCategory, { label: string; color: string; abbr: string }> = {
  "Universal": { label: "Universal",            color: NAVY,    abbr: "ALL" },
  "GL":        { label: "General Liability",     color: BLUE,    abbr: "GL"  },
  "GL-BLX":   { label: "GL · BLX Specific",    color: "#0E7490", abbr: "BLX" },
  "ML":        { label: "Management Liability",  color: PURPLE,  abbr: "ML"  },
  "PL":        { label: "Professional Liability",color: GREEN,   abbr: "PL"  },
  "EL-AR":     { label: "Excess / Assumed",      color: "#B45309", abbr: "EL" },
};

// ── SVG chart utilities ────────────────────────────────────────────────────────
function toPoints(data: number[], w: number, h: number, pad = 4) {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  return data.map((v, i) => ({
    x: pad + (data.length > 1 ? (i / (data.length - 1)) : 0.5) * (w - pad * 2),
    y: h - pad - ((v - mn) / rng) * (h - pad * 2),
  }));
}

function smooth(pts: { x: number; y: number }[]) {
  if (!pts.length) return "";
  if (pts.length === 1) return `M${pts[0].x} ${pts[0].y}`;
  let d = `M${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1], b = pts[i], dx = (b.x - a.x) * 0.4;
    d += ` C${a.x + dx} ${a.y} ${b.x - dx} ${b.y} ${b.x} ${b.y}`;
  }
  return d;
}

// ── Animated value hook ────────────────────────────────────────────────────────
function useAnimated(target: number, delay = 80) {
  const [val, setVal] = useState(0);
  useEffect(() => { const t = setTimeout(() => setVal(target), delay); return () => clearTimeout(t); }, [target, delay]);
  return val;
}

// ── Sparkline ──────────────────────────────────────────────────────────────────
function Sparkline({ data, color, w = 90, h = 28 }: { data: number[]; color: string; w?: number; h?: number }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 120); return () => clearTimeout(t); }, []);
  const pts = toPoints(data, w, h, 3);
  const line = smooth(pts);
  const area = line + ` L${pts[pts.length-1].x} ${h} L${pts[0].x} ${h} Z`;
  const last = pts[pts.length - 1];
  const gid = `sp${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <svg width={w} height={h} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${gid})`} />
      <path d={line} fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round"
        strokeDasharray="2000" style={{ strokeDashoffset: drawn ? 0 : 2000, transition: "stroke-dashoffset 1.1s ease" }} />
      {last && <>
        <circle cx={last.x} cy={last.y} r="6" fill={color} opacity="0.15" style={{ animation: "livePulse 2s ease-in-out infinite" }} />
        <circle cx={last.x} cy={last.y} r="2.5" fill={color} />
      </>}
    </svg>
  );
}

// ── KPI Card ───────────────────────────────────────────────────────────────────
function KPICard({ label, value, trendLabel, trendPos, accentColor, sparkData, index = 0 }: { label: string; value: string; trendLabel: string; trendPos: boolean; accentColor: string; sparkData: number[]; index?: number }) {
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: hov ? `${accentColor}06` : "white", borderRadius: R, border: `1px solid ${hov ? accentColor + "50" : BDL}`, borderTop: `3px solid ${accentColor}`, padding: "11px 12px 9px", display: "flex", flexDirection: "column", gap: 2, boxShadow: hov ? `${SH_MD},0 0 0 1px ${accentColor}18` : SH_SM, transform: hov ? "translateY(-2px)" : "none", transition: "all 0.22s ease", animation: `slideUp 0.4s ease ${index * 0.09}s both`, cursor: "default" }}>
      <p style={{ fontSize: "0.56rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</p>
      <p style={{ fontSize: "1.4rem", fontWeight: 800, color: NAVY, lineHeight: 1, marginTop: 3 }}>{value}</p>
      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 1 }}>
        {trendPos ? <TrendingUp size={10} color={GREEN} /> : <TrendingDown size={10} color={RED} />}
        <span style={{ fontSize: "0.60rem", color: trendPos ? GREEN : RED, fontWeight: 600 }}>{trendLabel}</span>
      </div>
      <div style={{ marginTop: 7 }}>
        <Sparkline data={sparkData} color={accentColor} w={120} h={26} />
      </div>
    </div>
  );
}

// ── Pipeline area chart ────────────────────────────────────────────────────────
function PipelineChart() {
  const days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];
  const data = [38, 42, 40, 44, 43, 45, 47];
  const [drawn, setDrawn] = useState(false);
  const [hov, setHov] = useState<number | null>(null);
  useEffect(() => { const t = setTimeout(() => setDrawn(true), 150); return () => clearTimeout(t); }, []);
  const W = 280, H = 72, pL = 4, pR = 8, pT = 6, pB = 16;
  const pts = data.map((v, i) => {
    const mn = 36, mx = 49;
    return { x: pL + (i / (data.length - 1)) * (W - pL - pR), y: pT + (1 - (v - mn) / (mx - mn)) * (H - pT - pB) };
  });
  const line = smooth(pts);
  const area = line + ` L${pts[pts.length-1].x} ${H - pB} L${pts[0].x} ${H - pB} Z`;
  return (
    <svg width={W} height={H} style={{ overflow: "visible" }}>
      <defs>
        <linearGradient id="plGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={BLUE} stopOpacity="0.28" />
          <stop offset="100%" stopColor={BLUE} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[0, 0.5, 1].map((t, i) => <line key={i} x1={pL} y1={pT + t * (H - pT - pB)} x2={W - pR} y2={pT + t * (H - pT - pB)} stroke={BDL} strokeWidth="0.6" strokeDasharray="3 4" />)}
      <path d={area} fill="url(#plGrad)" />
      <path d={line} fill="none" stroke={BLUE} strokeWidth="2.2" strokeLinecap="round"
        strokeDasharray="2000" style={{ strokeDashoffset: drawn ? 0 : 2000, transition: "stroke-dashoffset 1.2s ease" }} />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r={12} fill="transparent" style={{ cursor: "crosshair" }}
            onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} />
          <circle cx={p.x} cy={p.y} r={hov === i ? 4.5 : 3} fill={hov === i ? "white" : BLUE} stroke={BLUE} strokeWidth={hov === i ? 1.8 : 0}
            style={{ transition: "all 0.18s ease", filter: hov === i ? `drop-shadow(0 0 5px ${BLUE}80)` : "none" }} />
        </g>
      ))}
      {hov !== null && (
        <g style={{ animation: "fadeIn 0.15s ease" }}>
          <rect x={pts[hov].x - 18} y={pts[hov].y - 28} width={36} height={18} rx={6} fill={NAVY} />
          <text x={pts[hov].x} y={pts[hov].y - 15} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily={font}>{data[hov]}</text>
        </g>
      )}
      {days.map((d, i) => <text key={i} x={pts[i].x} y={H} textAnchor="middle" fill={TT} fontSize="7.5" fontFamily={font}>{d}</text>)}
    </svg>
  );
}

// ── Workload donut ─────────────────────────────────────────────────────────────
function WorkloadDonut() {
  const segs = [{ label: "In Review", n: 14, color: GOLD }, { label: "Quoted", n: 23, color: BLUE }, { label: "Bound", n: 31, color: GREEN }, { label: "Declined", n: 9, color: "#94A3B8" }];
  const total = 77, r = 30, cx = 44, cy = 44, sw = 11, gap = 2.5, circ = 2 * Math.PI * r;
  const [hov, setHov] = useState<number | null>(null);
  const animVal = useAnimated(1, 100);
  let cum = 0;
  const arcs = segs.map(s => { const dash = (s.n / total) * circ * animVal - gap; const res = { ...s, dash, gap: circ - dash, off: -cum }; cum += dash + gap; return res; });
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
      <svg width={88} height={88} viewBox="0 0 88 88" style={{ flexShrink: 0 }}>
        <g transform="rotate(-90, 44, 44)">
          {arcs.map((a, i) => (
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={a.color} strokeWidth={hov === i ? sw + 3 : sw}
              strokeDasharray={`${Math.max(a.dash, 0)} ${a.gap}`} strokeDashoffset={a.off}
              onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
              style={{ cursor: "pointer", transition: "stroke-width 0.2s ease, stroke-dasharray 0.8s cubic-bezier(0.4,0,0.2,1)", filter: hov === i ? `drop-shadow(0 0 7px ${a.color}90)` : "none" }} />
          ))}
        </g>
        <text x={cx} y={cy - 5} textAnchor="middle" dominantBaseline="middle" fontSize={16} fontWeight={800} fill={NAVY} fontFamily={font}>{total}</text>
        <text x={cx} y={cx + 10} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={600} fill={TT} fontFamily={font}>TOTAL</text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {segs.map((s, i) => (
          <div key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)}
            style={{ display: "flex", alignItems: "center", gap: 7, cursor: "pointer", padding: "2px 6px", borderRadius: 6, background: hov === i ? `${s.color}10` : "transparent", transition: "background 0.2s" }}>
            <div style={{ width: 10, height: 10, borderRadius: 3, background: s.color, flexShrink: 0, boxShadow: hov === i ? `0 0 7px ${s.color}80` : "none", transition: "box-shadow 0.2s" }} />
            <span style={{ flex: 1, fontSize: "0.67rem", color: hov === i ? NAVY : TM, fontWeight: hov === i ? 700 : 400, transition: "all 0.2s" }}>{s.label}</span>
            <span style={{ fontSize: "0.70rem", fontWeight: 800, color: s.color }}>{s.n}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Mini radial score ──────────────────────────────────────────────────────────
function MiniRadial({ score, color, label, size = 70 }: { score: number; color: string; label: string; size?: number }) {
  const animScore = useAnimated(score, 200);
  const r = size * 0.36, cx = size / 2, sw = size * 0.09, circ = 2 * Math.PI * r;
  const arc = (animScore / 100) * circ;
  const gid = `mr${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={color} /><stop offset="100%" stopColor={color} stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={BDL} strokeWidth={sw} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={`url(#${gid})`} strokeWidth={sw}
          strokeDasharray={`${arc} ${circ - arc}`} strokeDashoffset={circ * 0.25} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.85s cubic-bezier(0.4,0,0.2,1)", filter: `drop-shadow(0 0 4px ${color}60)` }} />
        <text x={cx} y={cx + 1} textAnchor="middle" dominantBaseline="middle" fontSize={size * 0.22} fontWeight={800} fill={NAVY} fontFamily={font}>{score}</text>
      </svg>
      <span style={{ fontSize: "0.58rem", fontWeight: 700, color: TT, textAlign: "center", lineHeight: 1.3, maxWidth: size + 4 }}>{label}</span>
    </div>
  );
}

// ── Claims bar chart ───────────────────────────────────────────────────────────
function ClaimsChart() {
  const bars = [{ yr: "2020", v: 98, c: BLUE }, { yr: "2021", v: 145, c: BLUE }, { yr: "2022", v: 220, c: ORANGE }, { yr: "2023", v: 168, c: BLUE }, { yr: "2024", v: 305, c: RED, note: "Open" }];
  const [hov, setHov] = useState<number | null>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 120); return () => clearTimeout(t); }, []);
  const max = 320, W = 275, H = 80, bW = 38, gap = 11;
  return (
    <svg width={W} height={H + 20} viewBox={`0 0 ${W} ${H + 20}`}>
      {[0, 0.5, 1].map((t, i) => <line key={i} x1={0} y1={H * t} x2={W} y2={H * t} stroke={BDL} strokeWidth="0.5" strokeDasharray="3 4" />)}
      {bars.map((b, i) => {
        const bH = ready ? (b.v / max) * (H - 8) : 0;
        const x = i * (bW + gap), y = H - bH;
        const isHov = hov === i;
        return (
          <g key={i} onMouseEnter={() => setHov(i)} onMouseLeave={() => setHov(null)} style={{ cursor: "pointer" }}>
            <rect x={x} y={y} width={bW} height={bH} rx={5} fill={b.c} opacity={isHov ? 1 : 0.78}
              style={{ transition: "height 0.65s cubic-bezier(0.4,0,0.2,1), y 0.65s cubic-bezier(0.4,0,0.2,1), opacity 0.2s", transitionDelay: `${i * 0.1}s`, filter: isHov ? `drop-shadow(0 0 7px ${b.c}70)` : "none" }} />
            <text x={x + bW / 2} y={H + 13} textAnchor="middle" fill={TT} fontSize="8" fontFamily={font}>{b.yr}</text>
            {b.note && <text x={x + bW / 2} y={y - 5} textAnchor="middle" fill={b.c} fontSize="7" fontWeight="800" fontFamily={font}>{b.note}</text>}
            {isHov && (
              <g style={{ animation: "fadeIn 0.15s ease" }}>
                <rect x={x - 8} y={y - 26} width={bW + 16} height={19} rx={6} fill={NAVY} />
                <text x={x + bW / 2} y={y - 13} textAnchor="middle" fill="white" fontSize="9" fontWeight="700" fontFamily={font}>${b.v}K</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

// ── Benchmark horizontal bars ──────────────────────────────────────────────────
function BenchmarkBars({ value = 62 }: { value?: number }) {
  const rows = [
    { label: "Bottom Quartile", pct: 25, color: "#94A3B8" },
    { label: "Sector Average",  pct: 50, color: BLUE },
    { label: "This Institution",pct: value, color: ORANGE, highlight: true },
    { label: "Top Quartile",    pct: 75, color: GREEN },
  ];
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
      {rows.map((row, i) => (
        <div key={i} style={{ animation: `slideUp 0.3s ease ${i * 0.07}s both` }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ fontSize: "0.63rem", color: row.highlight ? NAVY : TM, fontWeight: row.highlight ? 700 : 400 }}>{row.label}</span>
            <span style={{ fontSize: "0.63rem", fontWeight: 800, color: row.color }}>{row.pct}th %ile</span>
          </div>
          <div style={{ height: row.highlight ? 8 : 5, background: "#EEF2F7", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: ready ? `${row.pct}%` : "0%", background: row.highlight ? `linear-gradient(to right,${row.color},${row.color}99)` : row.color, borderRadius: 4, transition: `width 0.75s cubic-bezier(0.4,0,0.2,1) ${i * 0.09}s`, boxShadow: row.highlight ? `2px 0 8px ${row.color}50` : "none" }} />
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Queue status bar chart ─────────────────────────────────────────────────────
function QueueStatusChart() {
  const items = [{ label: "In Review", n: 18, color: GOLD }, { label: "New", n: 12, color: BLUE }, { label: "Quoted", n: 9, color: PURPLE }, { label: "Referred", n: 5, color: ORANGE }, { label: "Overdue", n: 3, color: RED }];
  const max = 20;
  const [ready, setReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setReady(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {items.map((it, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, animation: `slideUp 0.3s ease ${i * 0.07}s both` }}>
          <span style={{ fontSize: "0.63rem", color: TM, width: 70, flexShrink: 0 }}>{it.label}</span>
          <div style={{ flex: 1, height: 8, background: "#EEF2F7", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ height: "100%", width: ready ? `${(it.n / max) * 100}%` : "0%", background: `linear-gradient(to right, ${it.color}, ${it.color}AA)`, borderRadius: 4, transition: `width 0.65s cubic-bezier(0.4,0,0.2,1) ${i * 0.09}s`, boxShadow: `2px 0 6px ${it.color}40` }} />
          </div>
          <span style={{ fontSize: "0.67rem", fontWeight: 800, color: it.color, width: 18, textAlign: "right" }}>{it.n}</span>
        </div>
      ))}
    </div>
  );
}

// ── Section widget wrapper ─────────────────────────────────────────────────────
function SectionWidget({ label, icon, color = NAVY, badge, children }: { label: string; icon: React.ReactNode; color?: string; badge?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "white", borderRadius: R, border: `1px solid ${BDL}`, boxShadow: SH_SM, overflow: "hidden" }}>
      <div style={{ padding: "8px 13px", background: `linear-gradient(to right,${color}09,transparent)`, borderBottom: `1px solid ${BDL}`, display: "flex", alignItems: "center", gap: 7 }}>
        <span style={{ color }}>{icon}</span>
        <span style={{ fontSize: "0.59rem", fontWeight: 800, color: NAVY, textTransform: "uppercase", letterSpacing: "0.09em" }}>{label}</span>
        {badge && <span style={{ marginLeft: "auto", fontSize: "0.57rem", fontWeight: 700, color, background: `${color}15`, padding: "2px 8px", borderRadius: 20 }}>{badge}</span>}
      </div>
      <div style={{ padding: "12px 13px" }}>{children}</div>
    </div>
  );
}

// ── Doc checklist builder ──────────────────────────────────────────────────────
function buildDocChecklist(products: string[]): DocItem[] {
  if (!products.length) return [];
  const hasGL = products.some(p => GL_PRODUCTS.includes(p)), hasBLX = products.includes("Buffer Excess Liability (BLX)"),
    hasML = products.some(p => ML_PRODUCTS.includes(p)), hasPL = products.includes("Internships and Professional Services Liability (IPL)"),
    hasELAR = products.some(p => EL_AR_PRODS.includes(p));
  const items: DocItem[] = [
    { id: "uni-app", label: "Completed & Signed Application",             category: "Universal", required: true },
    { id: "uni-fin", label: "Audited Financial Statements (most recent)", category: "Universal", required: true },
    { id: "uni-loss",label: "6–7 Year Loss Runs (all requested lines)",  category: "Universal", required: true },
  ];
  if (hasGL) items.push(
    { id: "gl-app",  label: "General Liability Application",        category: "GL", required: true },
    { id: "gl-loss", label: "6-Year GL Loss Runs",                  category: "GL", required: true },
    { id: "gl-tbi",  label: "TBI Warranty & Athletics Application", category: "GL", required: false, note: "Required if NCAA/NAIA/NJCAA intercollegiate football" },
    { id: "gl-res",  label: "Human Subjects Research Application",  category: "GL", required: false, note: "Required if clinical or academic research" },
    { id: "gl-misc", label: "Sexual Misconduct Application",         category: "GL", required: false },
  );
  if (hasBLX) items.push(
    { id: "blx-sir",    label: "SIR Funding Mechanism Statement",     category: "GL-BLX", required: true, note: "Reserve provisions and actuarial opinion required" },
    { id: "blx-claims", label: "Claims-Handling Process Description", category: "GL-BLX", required: true, note: "TPA scope, personnel, and experience details" },
  );
  if (hasML) items.push(
    { id: "ml-app",      label: "ELL / FDL / SBL Application",   category: "ML", required: true },
    { id: "ml-loss",     label: "Management Liability Loss Runs", category: "ML", required: true },
    { id: "ml-disclose", label: "Operational Disclosures",        category: "ML", required: true, note: "Layoffs, accreditation changes, regulatory actions" },
  );
  if (hasPL) items.push(
    { id: "pl-app",  label: "IPL Application",         category: "PL", required: true },
    { id: "pl-tele", label: "Telemedicine Application", category: "PL", required: false, note: "Required if telemedicine services provided" },
  );
  if (hasELAR) items.push(
    { id: "el-sched", label: "Schedule of Underlying Insurance",          category: "EL-AR", required: true, note: "Carrier names, policy periods, exact limits" },
    { id: "el-loss",  label: "Extended Loss Runs (excess bleed history)", category: "EL-AR", required: true },
  );
  return items;
}

// ── Auto-review builder ────────────────────────────────────────────────────────
function buildDocReview(products: string[]): DocReviewResult {
  const hasBLX = products.includes("Buffer Excess Liability (BLX)"), hasML = products.some(p => ML_PRODUCTS.includes(p)),
    hasELL = products.includes("Educators Legal Liability (ELL)"), hasFDL = products.includes("Fiduciary Liability (FDL)"),
    hasPL = products.includes("Internships and Professional Services Liability (IPL)"), hasELAR = products.some(p => EL_AR_PRODS.includes(p)), hasGL = products.some(p => GL_PRODUCTS.includes(p));
  return {
    appetite: {
      score: hasBLX ? 72 : 82, scoreLabel: hasBLX ? "GOOD FIT" : "STRONG FIT", scoreColor: hasBLX ? ORANGE : GREEN,
      findings: [
        { type: "positive", text: "Institution type aligns with UE's core education demographic" },
        { type: "positive", text: "No excluded operations identified in application" },
        ...(hasGL  ? [{ type: "positive" as const, text: "GL program structure consistent with UE appetite guidelines" }] : []),
        ...(hasBLX ? [{ type: "warning"  as const, text: "BLX: SIR financial capacity requires independent verification" }] : []),
        ...(hasML  ? [{ type: "warning"  as const, text: "ML: 2 employment disputes disclosed — elevated but within appetite" }] : []),
        { type: "positive", text: "Centralized COI tracking documented — UE green flag" },
      ],
    },
    claims: {
      score: hasML ? 58 : 66, scoreLabel: hasML ? "ELEVATED CONCERN" : "MODERATE CONCERN", scoreColor: hasML ? RED : ORANGE,
      findings: [
        { type: "positive", text: "6-year loss run received and verified — complete history" },
        { type: "warning",  text: "Claim frequency: 1.8/yr — above 1.2 sector median" },
        { type: "warning",  text: "2 open claims · combined reserves $305K" },
        ...(hasBLX  ? [{ type: "critical" as const, text: "2022: primary GL limits approached at 85% — excess bleed risk" }] : []),
        ...(hasML   ? [{ type: "critical" as const, text: "2 EPL claims in 5 years — top quartile for institution size" }] : []),
        ...(hasELAR ? [{ type: "warning"  as const, text: "Primary limits pierced in 1 year — excess bleed confirmed" }] : []),
        { type: "positive", text: "Loss ratio: 68% — below 70% referral threshold" },
      ],
    },
    benchmark: {
      score: 62, scoreLabel: "AT MARKET · 62nd %ile", scoreColor: BLUE,
      findings: [
        { type: "info",     text: "Institution at 62nd percentile vs. comparable UE members" },
        ...(hasML ? [{ type: "warning"  as const, text: "EPL frequency outlier — top quartile vs. peer cohort" }] : []),
        ...(hasGL ? [{ type: "positive" as const, text: "GL loss ratio aligns with peer median for education sector" }] : []),
        { type: "positive", text: "Safety score 91/100 — qualifies for safety credit modifier" },
      ],
    },
    recommendations: [
      ...(hasGL && !hasBLX && !products.includes("General Liability Excess (GLX)") ? [{ product: "Buffer Excess Liability (BLX) or GL Excess (GLX)", reason: "Claims history shows primary GL limits approached 85% in 2022. A buffer layer protects against catastrophic single-occurrence events.", priority: "high" as const }] : []),
      ...(hasELL && !hasFDL ? [{ product: "Fiduciary Liability (FDL)", reason: "Audited financials indicate a $42M defined benefit pension plan — significant fiduciary exposure not covered under ELL alone.", priority: "high" as const }] : []),
      ...(!products.some(p => p.toLowerCase().includes("cyber")) ? [{ product: "Cyber Liability", reason: "Application discloses 3 cloud platforms handling student PII. A data breach would not be covered under any currently selected product.", priority: "medium" as const }] : []),
      ...(hasML && !products.includes("School Board Legal (SBL)") ? [{ product: "School Board Legal (SBL)", reason: "Employment dispute history suggests active governance litigation risk — SBL provides targeted board defense coverage.", priority: "medium" as const }] : []),
    ],
    actionItems: [
      ...(hasBLX ? [
        { gap: "SIR Funding Mechanism not independently verified", action: "Upload actuarial opinion confirming SIR reserve adequacy", owner: "Broker/User" as ActionOwner, priority: "urgent" as ActionPriority },
        { gap: "Claims-handling TPA not identified", action: "Provide TPA name, credentials, and scope of authority document", owner: "Broker/User" as ActionOwner, priority: "urgent" as ActionPriority },
      ] : []),
      ...(hasML ? [
        { gap: "2 open employment disputes not fully detailed", action: "Submit ML disclosure form with litigation status and reserves", owner: "Broker/User" as ActionOwner, priority: "urgent" as ActionPriority },
        { gap: "EPL frequency warrants deductible review", action: "Evaluate EPL deductible increase $25K → $50K before quote issuance", owner: "Underwriter" as ActionOwner, priority: "required" as ActionPriority },
      ] : []),
      { gap: "2 open claims require status updates before binding", action: "Request updated reserve reports from carrier for both open claims", owner: "Broker/User" as ActionOwner, priority: "urgent" as ActionPriority },
      ...(hasGL ? [
        { gap: "Athletics program scope not confirmed", action: "Confirm NCAA/NAIA/NJCAA football participation — trigger TBI Warranty if yes", owner: "System Automation" as ActionOwner, priority: "required" as ActionPriority },
        { gap: "Sexual Misconduct supplemental not yet received", action: "Trigger Sexual Misconduct Application addendum to broker", owner: "System Automation" as ActionOwner, priority: "required" as ActionPriority },
      ] : []),
      ...(hasPL ? [{ gap: "Telemedicine participation not confirmed", action: "Confirm telemedicine involvement — trigger Application if yes", owner: "System Automation" as ActionOwner, priority: "required" as ActionPriority }] : []),
      ...(hasELAR ? [{ gap: "Underlying policy limits not independently verified", action: "Obtain certificates of insurance for all scheduled underlying policies", owner: "Broker/User" as ActionOwner, priority: "urgent" as ActionPriority }] : []),
      { gap: "Safety credit qualifier not attached", action: "Upload SafeSchools safety rating certificate to apply premium credit", owner: "Broker/User" as ActionOwner, priority: "optional" as ActionPriority },
    ] as ActionItem[],
  };
}

// ── Proactive content ──────────────────────────────────────────────────────────
function buildProactiveContent(ctxId: string, firstName: string): ProactiveContent {
  switch (ctxId) {
    case "dashboard": return {
      contextLabel: "DAILY BRIEFING", headline: `Good morning, ${firstName}. 3 items need your attention.`, subline: "Dashboard · Education Practice · Apr 19, 2026",
      flags: [
        { id: "d1", severity: "critical", title: "SUB-7835 — Safety Questionnaire missing", summary: "Quote issuance blocked. Seattle PS has not submitted required docs.", detail: "The Safety Questionnaire is mandatory for GL renewal in districts over 5,000 students.\n\n• Due: April 12, 2026 (7 days overdue)\n• Assigned UW: Robert Chen\n• Broker: Alliant Education", historicalContext: "In 2024, Seattle PS submitted this form 11 days late. The UW applied a 3% loading factor for the delay.", dataSource: "Submission intake record SUB-7835 · Document checklist v3", recommendedAction: "Contact broker Alliant Education immediately. Escalate if not received by EOD April 22.", quickAsks: ["What loading applies if this document is late?", "Show me Seattle PS claim history"] },
        { id: "d2", severity: "warning", title: "SUB-7831 — Austin ISD review overdue 16 days", summary: "Review should have been completed April 3. Escalation risk.", detail: "Austin ISD (enrollment 12,400) requires senior UW sign-off. 16-day overage exceeds 10-day SLA.\n\n• Status: In Review\n• SLA breach: 6 days beyond threshold", historicalContext: "Austin ISD renewed without incident 3 consecutive years. Prior loss ratio: 43%.", dataSource: "Submission log SUB-7831 · Workflow SLA tracker", recommendedAction: "Assign to senior UW immediately. Send broker communication within 24 hours.", quickAsks: ["What's Austin ISD's loss history?"] },
        { id: "d3", severity: "warning", title: "Pipeline conversion rate dropped 4% this week", summary: "Quoted → Bound conversion at 61%, down from 65% last week.", detail: "4 submissions moved to Declined — 3 were price-driven.\n\n• Price declines: 3\n• Avg quote cycle: 8.2 days (target: 7)", dataSource: "Portfolio analytics · Weekly pipeline report w/e April 19", recommendedAction: "Review pricing on the 3 price-driven declines.", quickAsks: ["Which lines are most often price-declined?"] },
        { id: "d4", severity: "positive", title: "Renewal rate 87.3% — above sector average", summary: "Your retention is outperforming the 82% education sector benchmark.", detail: "87.3% renewal rate is the highest on the team this quarter.\n\n• Q1 bound renewals: 34\n• Q1 new business: 12", dataSource: "Portfolio analytics · Q1 2026 renewal report", quickAsks: ["What drove the Private K-12 retention improvement?"] },
      ],
      suggestedActions: [{ label: "Open SUB-7835", primary: true, prompt: "Walk me through the next steps to resolve SUB-7835 and unblock quote issuance." }, { label: "View all overdue", prompt: "List all overdue submissions with SLA breach details." }],
    };
    case "submissions": return {
      contextLabel: "SUBMISSIONS QUEUE", headline: "47 submissions in queue — 3 require immediate action.",
      flags: [
        { id: "s1", severity: "critical", title: "3 submissions blocking quote issuance", summary: "Missing documents prevent SUB-7835, SUB-7829, SUB-7821 from progressing.", detail: "• SUB-7835 (Seattle PS) — Safety Questionnaire (7 days overdue)\n• SUB-7829 (Denver Academy) — Signed application\n• SUB-7821 (Phoenix Charter) — 5-year loss runs", recommendedAction: "Open each and trigger broker reminder from Documents tab.", quickAsks: ["Draft a broker follow-up for missing loss runs"] },
        { id: "s2", severity: "warning", title: "2 quotes expiring within 5 days", summary: "SUB-7830 expires April 22, SUB-7818 expires April 24.", detail: "• SUB-7830 (San Diego City Schools) — $210K premium\n• SUB-7818 (Fresno USD) — $178K premium\n\nIf not bound, quotes must be re-rated.", recommendedAction: "Call brokers directly.", quickAsks: ["What happens to the rate if SUB-7830 expires?"] },
        { id: "s3", severity: "info", title: "New submission: Westlake Academy (unassigned)", summary: "Private K-12, Houston TX. Arrived this morning. Initial fit: strong.", detail: "Coverage: GL, Property, EPL · Enrollment: 1,200\nInitial appetite estimate: 78/100", recommendedAction: "Assign to your queue and begin intake review.", quickAsks: ["What documents are required for a new Private K-12?"] },
        { id: "s4", severity: "positive", title: "7 submissions ready to quote", summary: "All documents received — cleared for quote generation.", detail: "SUB-7840, 7839, 7838, 7837, 7836, 7833, 7832\nHighest priority: SUB-7836 (renewal deadline April 30)", quickAsks: ["Which of the 7 should I quote first?"] },
      ],
      suggestedActions: [{ label: "Tackle blocked first", primary: true, prompt: "Guide me through resolving the 3 submissions blocked by missing documents." }, { label: "Start quoting", prompt: "Which of the 7 ready-to-quote submissions should I tackle first?" }],
    };
    case "detail": return {
      contextLabel: "REVIEWING", headline: "Review complete — 2 flags require resolution before binding.", subline: "Brookfield Day School · SUB-7836 · Private K-12 · Westport, CT",
      flags: [
        { id: "det1", severity: "positive", title: "Appetite & member-fit — Strong Fit 82/100", summary: "Institution profile aligns well with UE's education appetite.", detail: "Score 82/100 on member-fit index.\n\n• Type: Private K-12 (core appetite)\n• Enrollment: 680 · UE member 4 years\n• Safety rating: 91/100 (top quartile)", dataSource: "UE Appetite Engine v4.2", quickAsks: ["What factors most influence the member-fit score?"] },
        { id: "det2", severity: "warning", title: "Claims history — 9 claims, 2 currently open", summary: "Frequency above median for private K-12 schools of this enrollment.", detail: "5-year: 9 total · Combined incurred: $1.2M\n\n• Open 1: Slip-and-fall — $85K reserved\n• Open 2: Employment dispute — $220K reserved\n• Loss ratio: 68%", historicalContext: "2023 UW (Chen): 'EPL exposure elevated — 2 EPL claims in 3 years. Increased EPL deductible $15K → $25K.'", dataSource: "5-year loss runs · Great American Insurance", recommendedAction: "Request updated claim status before binding. Increase EPL deductible $25K → $50K.", quickAsks: ["Has this institution had claims flags before?", "How does a 68% loss ratio affect pricing?"] },
        { id: "det3", severity: "warning", title: "Document checklist — 13/14 received", summary: "Cyber Insurance Addendum missing. Required since January 2026.", detail: "• Missing: Cyber Insurance Addendum (new req. Jan 2026)\n• Broker: Institution reviewing internally\n• Impact: Cyber Liability cannot be quoted", historicalContext: "Brookfield submitted all docs within 5 days in 2024.", dataSource: "Document management system · Intake checklist v8", recommendedAction: "Issue conditional quote excluding Cyber. Note condition in quote letter.", quickAsks: ["Can I quote cyber conditionally?"] },
        { id: "det4", severity: "info", title: "Comparable risk benchmark — 62nd percentile", summary: "4 peer institutions used. Estimated pricing is at market.", detail: "Peer cohort: 4 private K-12 schools, Northeast, enrollment 500–900.\n\n• Brookfield estimated: $187K · Peer median: $182K", dataSource: "UE Pricing Engine v6", quickAsks: ["What would the premium be at the 50th percentile?"] },
      ],
      suggestedActions: [{ label: "Issue conditional quote", primary: true, prompt: "What should the conditional quote for Brookfield Day School include?" }, { label: "Request cyber addendum", prompt: "Draft a broker email requesting the Cyber Insurance Addendum for SUB-7836." }],
    };
    case "quote": return {
      contextLabel: "QUOTE BUILDER", headline: "Quote structure is solid — 1 gap identified.", subline: "Brookfield Day School · SUB-7836",
      flags: [
        { id: "q1", severity: "warning", title: "Cyber coverage not included", summary: "Cyber Liability recommended given district's cloud IT profile.", detail: "3 cloud-hosted platforms handling student PII:\n• SIS: Blackbaud · Email: Google Workspace\n\nRecommended: $1M/$2M aggregate · Est. +$8,200", dataSource: "Submission application · UE Cyber pricing model v3", recommendedAction: "Add Cyber as conditional pending addendum receipt.", quickAsks: ["What are standard Cyber limits for this school size?"] },
        { id: "q2", severity: "info", title: "GL limits unchanged from prior year", summary: "$1M/$3M General Liability — consistent with 2024 renewal.", detail: "Limits unchanged:\n• Per occurrence: $1,000,000\n• General aggregate: $3,000,000\n\nNo enrollment change. No change recommended.", dataSource: "Prior policy #UE-2024-7836", quickAsks: ["Should GL limits scale with enrollment?"] },
        { id: "q3", severity: "positive", title: "EPL deductible increase saves $4,100 in premium", summary: "Moving EPL deductible $25K → $50K improves competitiveness.", detail: "Based on elevated EPL frequency:\n• Premium savings: $4,100/yr\n• Broker pre-authorized up to $75K", dataSource: "EPL pricing model · Prior renewal notes (Chen, April 2023)", recommendedAction: "Apply $50K EPL deductible. Document rationale in quote letter.", quickAsks: ["Has the broker agreed to higher EPL deductibles before?"] },
      ],
      suggestedActions: [{ label: "Finalize & issue quote", primary: true, prompt: "What final checks should I do before issuing this quote?" }, { label: "Adjust coverage", prompt: "Walk me through adjusting the coverage structure for Brookfield." }],
    };
    default: return { contextLabel: "COMPANION", headline: "I'm ready to help with this view.", flags: [] };
  }
}

// ── Response library ───────────────────────────────────────────────────────────
const RESPONSE_LIBRARY: Record<string, string> = {
  "attention|priority|urgent|overdue": "**3 submissions are flagged as urgent:**\n\n• **SUB-7835** (Seattle PS) — Missing Safety Questionnaire, blocking quote issuance\n• **SUB-7831** (Austin ISD) — Review overdue by 16 days, escalation risk\n• **SUB-7830** (San Diego City) — Quote expiring in 5 days",
  "loss ratio|loss history|5-year": "When reviewing 5-year loss history:\n\n• **Loss Ratio < 50%** — Favorable, supports standard pricing\n• **Loss Ratio 50–70%** — Acceptable, monitor frequency trends\n• **Loss Ratio > 70%** — Referral trigger, investigate root causes",
  "red flag|flags|watch|check": "Common underwriting red flags:\n\n🚩 **Prior non-renewal** by another carrier\n🚩 **Loss ratio > 75%** in any of the last 3 years\n🚩 **Enrollment decline > 15%** — financial instability signal\n🚩 **No cybersecurity policy** for districts with student data systems",
  "coverage|required|standard|k-12": "Standard coverages for K-12:\n\n• **General Liability** — $1M/$3M minimum\n• **Educators Legal Liability (EPL)** — employment practices\n• **Property** — Building and contents\n• **Cyber Liability** — Student PII exposure",
  "epl|employment practices|deductible": "EPL deductible guidelines:\n\n• **Low frequency** (0–1 claims in 5 years): $10K–$25K\n• **Moderate** (2–3 claims): $25K–$50K\n• **High frequency** (4+ claims): $50K–$100K or refer",
  "cyber|addendum|telemedicine": "The Cyber Insurance Addendum collects:\n\n• Inventory of third-party cloud vendors handling PII\n• Incident response plan status · MFA status\n• Prior breach history (3 years)\n\nWithout this form, Cyber Liability cannot be quoted.",
  "conditional quote|condition": "A conditional quote is issued when:\n\n• A document is missing but expected imminently\n• An open claim needs status update before binding\n\nAll conditions must be satisfied within 30 days of issuance.",
  "sir|buffer excess|blx|self-insured": "For Buffer Excess Liability (BLX), two extra documents are required:\n\n• **SIR Funding Mechanism Statement** — reserve provisions and actuarial opinion\n• **Claims-Handling Process Description** — TPA scope, personnel, and experience",
  "management liability|ell|fdl|sbl": "Management Liability submissions require disclosures about:\n\n• Recent or planned **reductions in force** (layoffs)\n• Changes in **accreditation status**\n• Pending **regulatory actions** or investigations",
  "excess|xff|xpg|underlying": "For Excess products (XFF, XPG) and Assumed Reinsurance:\n\n• **Schedule of Underlying Insurance** — carrier names, policy periods, exact limits\n• **Extended loss runs** — prove no history of primary limit penetration",
};
const DEFAULT_RESPONSES = ["I can help with underwriting questions, submission analysis, and document requirements. What would be most helpful right now?", "As the UW Companion, I can interpret risk data, coverage requirements, and guide you through decisions. What are you working on?"];

function detectNavigation(p: string) {
  const l = p.toLowerCase();
  if (l.includes("go to submissions") || l.includes("submissions page")) return "/submissions";
  if (l.includes("go to dashboard") || l.includes("take me to dashboard")) return "/";
  if (l.includes("go to inbox")) return "/inbox";
  if (l.includes("task queue") || l.includes("go to tasks")) return "/tasks";
  return undefined;
}
function simulateResponse(prompt: string) {
  const lower = prompt.toLowerCase();
  for (const [keys, resp] of Object.entries(RESPONSE_LIBRARY)) if (keys.split("|").some(k => lower.includes(k))) return resp;
  return DEFAULT_RESPONSES[Math.floor(Math.random() * DEFAULT_RESPONSES.length)];
}

// ── Anthropic API ──────────────────────────────────────────────────────────────
const ANTHROPIC_MODEL = "claude-sonnet-4-20250514", ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
function getApiKey() { return ((import.meta as any).env?.VITE_ANTHROPIC_API_KEY as string | undefined)?.trim() || undefined; }
async function callAnthropic(prompt: string, history: { role: "user" | "assistant"; text: string }[], ctxId: string, userName: string, userRole: string, products: string[], activeFlag?: Flag): Promise<string> {
  const k = getApiKey(); if (!k) throw new Error("NO_KEY");
  const sys = [`You are the UW Companion — AI assistant in the United Educators Underwriting Workbench.`, `User: ${userName} (${userRole}). View: ${ctxId}.`, ...(products.length ? [`Selected products: ${products.join(", ")}.`] : []), ...(activeFlag ? [`Drilling into: "${activeFlag.title}"\n${activeFlag.detail}`] : []), `Format: bullets with '• ', **bold**. Under 200 words.`].join("\n");
  const msgs = [...history, { role: "user" as const, text: prompt }].map(m => ({ role: m.role, content: m.text }));
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  const res = await fetch(ANTHROPIC_URL, { method: "POST", headers: { "content-type": "application/json", "x-api-key": k, "anthropic-version": "2023-06-01", "anthropic-dangerous-direct-browser-access": "true" }, body: JSON.stringify({ model: ANTHROPIC_MODEL, max_tokens: 600, system: sys, messages: msgs }) });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  const text = Array.isArray(data?.content) ? data.content.filter((b: any) => b?.type === "text").map((b: any) => b.text).join("\n").trim() : "";
  if (!text) throw new Error("EMPTY"); return text;
}

// ── RenderText ─────────────────────────────────────────────────────────────────
function RenderText({ text, accentColor }: { text: string; accentColor: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const parts = (raw: string) => raw.split(/(\*\*[^*]+\*\*)/g).map((p, j) => p.startsWith("**") && p.endsWith("**") ? <strong key={j}>{p.slice(2,-2)}</strong> : <span key={j}>{p}</span>);
        const isEmpty = line === "", isBullet = line.startsWith("• ");
        return (
          <div key={i} style={{ marginTop: i===0?0:isEmpty?6:isBullet?4:2 }}>
            {isBullet ? <span style={{ display:"flex",gap:6,alignItems:"flex-start" }}><span style={{ color:accentColor,marginTop:1,flexShrink:0 }}>•</span><span>{parts(line.slice(2))}</span></span> : isEmpty ? null : parts(line)}
          </div>
        );
      })}
    </>
  );
}

// ── Severity config ────────────────────────────────────────────────────────────
const SEV: Record<FlagSeverity, { icon: React.ReactNode; color: string; bg: string; label: string }> = {
  critical: { icon: <AlertTriangle size={14}/>, color: RED,    bg: "#FEF2F2", label: "CRITICAL" },
  warning:  { icon: <AlertTriangle size={14}/>, color: ORANGE, bg: "#FEF3E2", label: "WARNING"  },
  info:     { icon: <Info size={14}/>,           color: BLUE,   bg: "#EBF0FB", label: "INFO"     },
  positive: { icon: <CheckCircle2 size={14}/>,   color: GREEN,  bg: "#E8F5EC", label: "POSITIVE" },
};

// ── Flag card ──────────────────────────────────────────────────────────────────
function FlagCard({ flag, onClick, index = 0 }: { flag: Flag; onClick: () => void; index?: number }) {
  const [hov, setHov] = useState(false);
  const cfg = SEV[flag.severity];
  return (
    <button onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ width:"100%", textAlign:"left", fontFamily:font, cursor:"pointer", background: hov ? cfg.bg : "white", border:`1px solid ${hov?cfg.color+"60":BDL}`, borderLeft:`4px solid ${cfg.color}`, borderRadius:R, padding:"11px 13px", display:"flex", alignItems:"flex-start", gap:10, boxShadow: hov ? `${SH_MD},0 0 0 1px ${cfg.color}18` : SH_SM, transform: hov ? "translateY(-2px)" : "none", transition:"all 0.2s ease", animation:`slideUp 0.35s ease ${index*0.08}s both` }}>
      <div style={{ width:28,height:28,borderRadius:7,background:`${cfg.color}18`,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,border:`1px solid ${cfg.color}25` }}>
        <span style={{ color:cfg.color }}>{cfg.icon}</span>
      </div>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:"0.72rem",fontWeight:700,color:NAVY,lineHeight:1.35,marginBottom:4 }}>{flag.title}</p>
        <p style={{ fontSize:"0.66rem",color:TM,lineHeight:1.5 }}>{flag.summary}</p>
      </div>
      <div style={{ display:"flex",flexDirection:"column",alignItems:"flex-end",gap:5,flexShrink:0 }}>
        <span style={{ fontSize:"0.52rem",fontWeight:800,color:cfg.color,background:`${cfg.color}15`,padding:"2px 7px",borderRadius:20,letterSpacing:"0.06em" }}>{cfg.label}</span>
        <ChevronRight size={13} color={cfg.color} style={{ transform:hov?"translateX(2px)":"none",transition:"transform 0.2s ease" }}/>
      </div>
    </button>
  );
}

// ── Scanner ring ───────────────────────────────────────────────────────────────
function ScannerRing() {
  return (
    <div style={{ position:"relative",width:80,height:80 }}>
      <svg width={80} height={80} viewBox="0 0 80 80" style={{ position:"absolute",inset:0 }}>
        <defs>
          <linearGradient id="scanRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={BLUE}/><stop offset="100%" stopColor={GOLD}/>
          </linearGradient>
        </defs>
        <circle cx={40} cy={40} r={34} fill="none" stroke={BDL} strokeWidth={5}/>
        <circle cx={40} cy={40} r={34} fill="none" stroke="url(#scanRingGrad)" strokeWidth={5}
          strokeDasharray="70 144" strokeLinecap="round"
          style={{ transformOrigin:"40px 40px",animation:"spinRing 1.4s linear infinite" }}/>
      </svg>
      <div style={{ position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center" }}>
        <div style={{ width:52,height:52,borderRadius:"50%",background:`linear-gradient(135deg,${NAVY}F0,#162A4A)`,display:"flex",alignItems:"center",justifyContent:"center",animation:"companionPulse 2s ease-in-out infinite" }}>
          <Sparkles size={22} color={GOLD}/>
        </div>
      </div>
    </div>
  );
}

// ── Scanning view ──────────────────────────────────────────────────────────────
function ScanningView({ ctxId }: { ctxId: string }) {
  const stepsMap: Record<string,string[]> = {
    dashboard:               ["Scanning your queue","Checking SLA breaches","Reviewing pipeline metrics","Surfacing priority items"],
    submissions:             ["Reading queue state","Checking document blockers","Identifying expiring quotes","Prioritizing flags"],
    detail:                  ["Analyzing submission","Running appetite check","Reviewing claims history","Benchmarking against peers"],
    quote:                   ["Reviewing quote structure","Checking coverage gaps","Running pricing analysis"],
    "new-submission":        ["Detecting product selection","Loading UE intake rules","Building document checklist"],
    "new-submission-review": ["Analyzing uploaded documents","Reviewing 6-year loss history","Running appetite assessment","Benchmarking against UE portfolio","Generating recommendations"],
  };
  const steps = stepsMap[ctxId] ?? ["Analyzing current view"];
  const [cur, setCur] = useState(0);
  useEffect(() => { const t = setInterval(() => setCur(s => Math.min(s+1, steps.length-1)), 800); return () => clearInterval(t); }, [steps.length]);
  return (
    <div style={{ padding:"36px 20px",display:"flex",flexDirection:"column",alignItems:"center",gap:22 }}>
      <ScannerRing/>
      <div style={{ width:"100%",display:"flex",flexDirection:"column",gap:9 }}>
        {steps.map((s,i) => (
          <div key={i} style={{ display:"flex",alignItems:"center",gap:10,opacity:i<=cur?1:0.22,transition:"opacity 0.5s ease" }}>
            <div style={{ width:20,height:20,borderRadius:"50%",flexShrink:0,background:i<cur?GREEN:i===cur?BLUE:BDL,display:"flex",alignItems:"center",justifyContent:"center",boxShadow:i===cur?`0 0 0 4px ${BLUE}25`:"none",transition:"all 0.35s ease" }}>
              {i<cur?<Check size={11} color="white"/>:i===cur?<div style={{ width:6,height:6,borderRadius:"50%",background:"white",animation:"pulseDot 1s ease-in-out infinite" }}/>:null}
            </div>
            <span style={{ fontSize:"0.70rem",fontWeight:i<=cur?600:400,color:i<cur?GREEN:i===cur?BLUE:TT,transition:"color 0.35s ease" }}>{s}…</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Dashboard briefing view ────────────────────────────────────────────────────
function DashboardBriefingView({ content, onFlagClick, onActionClick }: { content: ProactiveContent; onFlagClick: (f: Flag) => void; onActionClick: (p: string) => void }) {
  return (
    <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ animation:"slideUp 0.3s ease" }}>
        <span style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.11em" }}>{content.contextLabel}</span>
        <p style={{ fontSize:"0.90rem", fontWeight:800, color:NAVY, lineHeight:1.3, marginTop:4 }}>{content.headline}</p>
        {content.subline && <p style={{ fontSize:"0.63rem", color:TT, marginTop:4 }}>{content.subline}</p>}
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <KPICard label="IN QUEUE" value="47" trendLabel="+3 vs yesterday" trendPos accentColor={BLUE} sparkData={[38,42,40,44,43,45,47]} index={0}/>
        <KPICard label="OVERDUE"  value="3"  trendLabel="+1 vs yesterday" trendPos={false} accentColor={RED} sparkData={[1,2,2,3,2,3,3]} index={1}/>
        <KPICard label="READY TO QUOTE" value="7" trendLabel="+2 vs yesterday" trendPos accentColor={GREEN} sparkData={[4,5,5,6,6,7,7]} index={2}/>
        <KPICard label="PIPELINE" value="$8.4M" trendLabel="+7% this week" trendPos accentColor={GOLD} sparkData={[7.6,7.8,7.9,8.0,8.1,8.2,8.4]} index={3}/>
      </div>
      <SectionWidget label="Pipeline Trend · 7 Days" icon={<Activity size={12}/>} color={BLUE} badge="Live">
        <PipelineChart/>
      </SectionWidget>
      <SectionWidget label="Workload Split" icon={<PieChart size={12}/>} color={GOLD} badge="77 total">
        <WorkloadDonut/>
      </SectionWidget>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9, paddingBottom:6, borderBottom:`1px solid ${BDL}` }}>
          <Sparkles size={11} color={GOLD}/>
          <span style={{ fontSize:"0.59rem", fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:"0.09em" }}>Smart Insights</span>
          <span style={{ marginLeft:"auto", fontSize:"0.57rem", fontWeight:700, color:TT, background:BDL, padding:"1px 8px", borderRadius:12 }}>{content.flags.length} found</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {content.flags.map((f,i) => <FlagCard key={f.id} flag={f} onClick={() => onFlagClick(f)} index={i}/>)}
        </div>
      </div>
      {content.suggestedActions && (
        <div style={{ background:"linear-gradient(135deg,#F0F4F8,#EBF0FB)", border:`1px solid ${BDL}`, borderRadius:R, padding:13 }}>
          <p style={{ fontSize:"0.65rem", color:TM, fontWeight:700, marginBottom:9 }}>What would you like to do next?</p>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {content.suggestedActions.map((a,i) => (
              <button key={i} onClick={() => a.prompt && onActionClick(a.prompt)} style={{ padding:"9px 13px", fontFamily:font, background:a.primary?`linear-gradient(135deg,${NAVY},${BLUE})`:"white", border:`1px solid ${a.primary?BLUE:BDL}`, borderRadius:7, color:a.primary?"white":NAVY, fontSize:"0.70rem", fontWeight:700, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:7, boxShadow:a.primary?`0 4px 12px ${BLUE}30`:SH_SM, transition:"all 0.2s ease" }}>
                {a.primary && <Zap size={12}/>}{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Submissions queue view ─────────────────────────────────────────────────────
function SubmissionsQueueView({ content, onFlagClick, onActionClick }: { content: ProactiveContent; onFlagClick: (f: Flag) => void; onActionClick: (p: string) => void }) {
  return (
    <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ animation:"slideUp 0.3s ease" }}>
        <span style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.11em" }}>{content.contextLabel}</span>
        <p style={{ fontSize:"0.88rem", fontWeight:800, color:NAVY, lineHeight:1.3, marginTop:4 }}>{content.headline}</p>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
        <KPICard label="TOTAL QUEUE" value="47" trendLabel="+4 this week" trendPos accentColor={BLUE} sparkData={[40,42,43,45,44,46,47]} index={0}/>
        <KPICard label="CRITICAL" value="3" trendLabel="require action" trendPos={false} accentColor={RED} sparkData={[1,1,2,2,3,3,3]} index={1}/>
      </div>
      <SectionWidget label="Queue Status Breakdown" icon={<BarChart2 size={12}/>} color={BLUE}>
        <QueueStatusChart/>
      </SectionWidget>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9, paddingBottom:6, borderBottom:`1px solid ${BDL}` }}>
          <AlertTriangle size={11} color={ORANGE}/>
          <span style={{ fontSize:"0.59rem", fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:"0.09em" }}>Priority Flags</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {content.flags.map((f,i) => <FlagCard key={f.id} flag={f} onClick={() => onFlagClick(f)} index={i}/>)}
        </div>
      </div>
      {content.suggestedActions && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {content.suggestedActions.map((a,i) => (
            <button key={i} onClick={() => a.prompt && onActionClick(a.prompt)} style={{ padding:"9px 13px", fontFamily:font, background:a.primary?`linear-gradient(135deg,${NAVY},${BLUE})`:"white", border:`1px solid ${a.primary?BLUE:BDL}`, borderRadius:7, color:a.primary?"white":NAVY, fontSize:"0.70rem", fontWeight:700, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:7, boxShadow:a.primary?`0 4px 12px ${BLUE}30`:SH_SM }}>
              {a.primary && <Zap size={12}/>}{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Submission detail view ─────────────────────────────────────────────────────
function SubmissionDetailView({ content, onFlagClick, onActionClick }: { content: ProactiveContent; onFlagClick: (f: Flag) => void; onActionClick: (p: string) => void }) {
  return (
    <div style={{ padding:"14px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ animation:"slideUp 0.3s ease" }}>
        <span style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.11em" }}>{content.contextLabel}</span>
        <p style={{ fontSize:"0.90rem", fontWeight:800, color:NAVY, lineHeight:1.3, marginTop:4 }}>{content.headline}</p>
        {content.subline && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:7 }}>
            {["SUB-7836","Private K-12","Westport, CT"].map((t,i) => (
              <span key={i} style={{ fontSize:"0.60rem", fontWeight:i===0?700:400, color:i===0?BLUE:TM, background:i===0?"#EBF0FB":"transparent", padding:i===0?"2px 7px":"0", borderRadius:i===0?12:0 }}>{t}</span>
            ))}
            <span style={{ fontSize:"0.60rem", fontWeight:700, color:ORANGE, background:"#FEF3E2", padding:"2px 7px", borderRadius:12 }}>In Review</span>
          </div>
        )}
      </div>
      <SectionWidget label="Dimensional Scores" icon={<Target size={12}/>} color={BLUE} badge="Auto-analyzed">
        <div style={{ display:"flex", justifyContent:"space-around", paddingTop:4 }}>
          <MiniRadial score={82} color={GREEN}  label="Appetite & Fit"/>
          <MiniRadial score={64} color={ORANGE} label="Claims History"/>
          <MiniRadial score={62} color={BLUE}   label="Risk Benchmark"/>
        </div>
      </SectionWidget>
      <SectionWidget label="5-Year Claims History" icon={<BarChart2 size={12}/>} color={ORANGE} badge="2020–2024">
        <ClaimsChart/>
      </SectionWidget>
      <div>
        <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:9, paddingBottom:6, borderBottom:`1px solid ${BDL}` }}>
          <AlertTriangle size={11} color={ORANGE}/>
          <span style={{ fontSize:"0.59rem", fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:"0.09em" }}>Review Flags</span>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
          {content.flags.map((f,i) => <FlagCard key={f.id} flag={f} onClick={() => onFlagClick(f)} index={i}/>)}
        </div>
      </div>
      {content.suggestedActions && (
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {content.suggestedActions.map((a,i) => (
            <button key={i} onClick={() => a.prompt && onActionClick(a.prompt)} style={{ padding:"9px 13px", fontFamily:font, background:a.primary?`linear-gradient(135deg,${GREEN},#1F9A5A)`:"white", border:`1px solid ${a.primary?GREEN:BDL}`, borderRadius:7, color:a.primary?"white":NAVY, fontSize:"0.70rem", fontWeight:700, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:7, boxShadow:a.primary?`0 4px 12px ${GREEN}30`:SH_SM }}>
              {a.primary && <CheckCircle2 size={12}/>}{a.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Generic proactive + dispatcher ────────────────────────────────────────────
function GenericProactiveView({ content, onFlagClick, onActionClick }: { content: ProactiveContent; onFlagClick: (f: Flag) => void; onActionClick: (p: string) => void }) {
  return (
    <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:12 }}>
      <div style={{ animation:"slideUp 0.3s ease" }}>
        <span style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.11em" }}>{content.contextLabel}</span>
        <p style={{ fontSize:"0.90rem", fontWeight:800, color:NAVY, lineHeight:1.3, marginTop:4 }}>{content.headline}</p>
        {content.subline && <p style={{ fontSize:"0.63rem", color:TT, marginTop:4 }}>{content.subline}</p>}
      </div>
      <div style={{ height:1, background:`linear-gradient(to right,${BDL},transparent)` }}/>
      <div style={{ display:"flex", flexDirection:"column", gap:7 }}>
        {content.flags.map((f,i) => <FlagCard key={f.id} flag={f} onClick={() => onFlagClick(f)} index={i}/>)}
      </div>
      {content.suggestedActions && (
        <div style={{ background:"linear-gradient(135deg,#F0F4F8,#EBF0FB)", border:`1px solid ${BDL}`, borderRadius:R, padding:13 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            {content.suggestedActions.map((a,i) => (
              <button key={i} onClick={() => a.prompt && onActionClick(a.prompt)} style={{ padding:"9px 13px", fontFamily:font, background:a.primary?`linear-gradient(135deg,${NAVY},${BLUE})`:"white", border:`1px solid ${a.primary?BLUE:BDL}`, borderRadius:7, color:a.primary?"white":NAVY, fontSize:"0.70rem", fontWeight:700, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:7, boxShadow:a.primary?`0 4px 12px ${BLUE}30`:SH_SM }}>
                {a.primary && <Zap size={12}/>}{a.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProactiveModeView({ content, ctxId, onFlagClick, onActionClick }: { content: ProactiveContent; ctxId: string; onFlagClick: (f: Flag) => void; onActionClick: (p: string) => void }) {
  if (ctxId === "dashboard")   return <DashboardBriefingView   content={content} onFlagClick={onFlagClick} onActionClick={onActionClick}/>;
  if (ctxId === "submissions") return <SubmissionsQueueView    content={content} onFlagClick={onFlagClick} onActionClick={onActionClick}/>;
  if (ctxId === "detail")      return <SubmissionDetailView    content={content} onFlagClick={onFlagClick} onActionClick={onActionClick}/>;
  return <GenericProactiveView content={content} onFlagClick={onFlagClick} onActionClick={onActionClick}/>;
}

// ── Drill section + drilldown ─────────────────────────────────────────────────
function DrillSection({ label, icon, accent = BLUE, children }: { label: string; icon: React.ReactNode; accent?: string; children: React.ReactNode }) {
  return (
    <div style={{ background:"white", borderRadius:R, border:`1px solid ${BDL}`, overflow:"hidden", boxShadow:SH_SM }}>
      <div style={{ padding:"8px 12px", background:`${accent}0A`, borderBottom:`1px solid ${accent}25`, display:"flex", alignItems:"center", gap:6 }}>
        <span style={{ color:accent }}>{icon}</span>
        <span style={{ fontSize:"0.58rem", fontWeight:800, color:accent, textTransform:"uppercase", letterSpacing:"0.09em" }}>{label}</span>
      </div>
      <div style={{ padding:"11px 13px" }}>{children}</div>
    </div>
  );
}

function DrilldownModeView({ flag, onBack, onQuickAsk }: { flag: Flag; onBack: () => void; onQuickAsk: (q: string) => void }) {
  const cfg = SEV[flag.severity];
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:7, padding:"10px 16px", background:"#F8FAFC", border:"none", borderBottom:`1px solid ${BDL}`, cursor:"pointer", fontFamily:font, width:"100%", color:TM, transition:"background 0.2s" }}
        onMouseEnter={e => (e.currentTarget.style.background="#F0F4F8")} onMouseLeave={e => (e.currentTarget.style.background="#F8FAFC")}>
        <ArrowLeft size={13}/><span style={{ fontSize:"0.68rem", fontWeight:600 }}>Back to overview</span>
      </button>
      <div style={{ padding:"15px 14px", display:"flex", flexDirection:"column", gap:11 }}>
        <div style={{ background:`linear-gradient(135deg,${cfg.bg},white)`, border:`1px solid ${cfg.color}40`, borderLeft:`4px solid ${cfg.color}`, borderRadius:R, padding:"12px 14px" }}>
          <span style={{ fontSize:"0.56rem", fontWeight:800, color:cfg.color, textTransform:"uppercase", letterSpacing:"0.09em", background:`${cfg.color}20`, padding:"2px 8px", borderRadius:20 }}>{cfg.label}</span>
          <p style={{ fontSize:"0.86rem", fontWeight:800, color:NAVY, lineHeight:1.3, marginTop:8 }}>{flag.title}</p>
        </div>
        <DrillSection label="ANALYSIS" icon={<Info size={11}/>}>
          <div style={{ fontSize:"0.71rem", color:TM, lineHeight:1.65 }}><RenderText text={flag.detail} accentColor={cfg.color}/></div>
        </DrillSection>
        {flag.historicalContext && (
          <DrillSection label="HISTORICAL CONTEXT" icon={<Clock size={11}/>} accent={GOLD}>
            <div style={{ background:"linear-gradient(135deg,#FDFAF0,white)", border:`1px solid ${GOLD}30`, borderLeft:`3px solid ${GOLD}`, borderRadius:6, padding:"10px 12px" }}>
              <p style={{ fontSize:"0.70rem", color:TM, lineHeight:1.6, fontStyle:"italic" }}>"{flag.historicalContext}"</p>
            </div>
          </DrillSection>
        )}
        {flag.dataSource && (
          <DrillSection label="DATA SOURCES" icon={<Database size={11}/>} accent={TT}>
            <p style={{ fontSize:"0.67rem", color:TT, lineHeight:1.6 }}>{flag.dataSource}</p>
          </DrillSection>
        )}
        {flag.recommendedAction && (
          <DrillSection label="RECOMMENDED ACTION" icon={<Shield size={11}/>} accent={cfg.color}>
            <p style={{ fontSize:"0.71rem", color:cfg.color, fontWeight:600, lineHeight:1.55 }}>{flag.recommendedAction}</p>
          </DrillSection>
        )}
        {flag.quickAsks && flag.quickAsks.length > 0 && (
          <div>
            <p style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:8 }}>ASK COMPANION</p>
            <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
              {flag.quickAsks.map((q,i) => (
                <button key={i} onClick={() => onQuickAsk(q)} style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 12px", background:"white", border:`1px solid ${BDL}`, borderRadius:8, fontSize:"0.69rem", color:BLUE, fontWeight:500, cursor:"pointer", textAlign:"left", fontFamily:font, boxShadow:SH_SM, transition:"all 0.2s ease" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#EBF0FB"; (e.currentTarget as HTMLElement).style.borderColor=`${BLUE}60`; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.borderColor=BDL; }}>
                  <Sparkles size={10} color={BLUE} style={{ flexShrink:0 }}/>{q}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chat bubbles + conversational ─────────────────────────────────────────────
function ChatBubble({ msg, userInitials, accentColor }: { msg: Message; userInitials: string; accentColor: string }) {
  const isUser = msg.role === "user";
  return (
    <div style={{ display:"flex", flexDirection:isUser?"row-reverse":"row", gap:8, alignItems:"flex-end", animation:"slideUp 0.25s ease" }}>
      <div style={{ width:28, height:28, borderRadius:"50%", background:isUser?TM:NAVY, flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:SH_SM }}>
        {isUser ? <span style={{ fontSize:"0.60rem", fontWeight:800, color:"white" }}>{userInitials}</span> : <Sparkles size={13} color={GOLD}/>}
      </div>
      <div style={{ maxWidth:"80%", padding:"10px 14px", borderRadius:isUser?"18px 4px 18px 18px":"4px 18px 18px 18px", background:isUser?`linear-gradient(135deg,${NAVY},${BLUE})`:"white", boxShadow:isUser?`0 4px 12px ${BLUE}30`:SH_MD, color:isUser?"white":NAVY, border:isUser?"none":`1px solid ${BDL}`, fontSize:"0.73rem", lineHeight:1.6 }}>
        <RenderText text={msg.text} accentColor={isUser?"rgba(255,255,255,0.85)":accentColor}/>
        <p style={{ fontSize:"0.55rem", color:isUser?"rgba(255,255,255,0.5)":TT, marginTop:5, textAlign:"right" }}>{msg.ts.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"})}</p>
      </div>
    </div>
  );
}

function ConversationalView({ messages, isTyping, scrollRef, userInitials, accentColor = BLUE }: { messages: Message[]; isTyping: boolean; scrollRef: React.RefObject<HTMLDivElement>; userInitials: string; accentColor?: string }) {
  return (
    <div style={{ padding:"14px 14px 0", display:"flex", flexDirection:"column", gap:11 }}>
      {messages.map(msg => <ChatBubble key={msg.id} msg={msg} userInitials={userInitials} accentColor={accentColor}/>)}
      {isTyping && (
        <div style={{ display:"flex", gap:8, alignItems:"flex-end", animation:"slideUp 0.25s ease" }}>
          <div style={{ width:28, height:28, borderRadius:"50%", background:NAVY, display:"flex", alignItems:"center", justifyContent:"center" }}><Sparkles size={13} color={GOLD}/></div>
          <div style={{ padding:"12px 16px", background:"white", borderRadius:"4px 18px 18px 18px", boxShadow:SH_MD, border:`1px solid ${BDL}`, display:"flex", gap:5, alignItems:"center" }}>
            {[0,0.2,0.4].map((d,i) => <span key={i} style={{ width:6, height:6, borderRadius:"50%", background:`linear-gradient(135deg,${BLUE},${GOLD})`, display:"inline-block", animation:`typingDot 1.2s infinite ${d}s` }}/>)}
          </div>
        </div>
      )}
      <div ref={scrollRef} style={{ height:14 }}/>
    </div>
  );
}

// ── Radial gauge ──────────────────────────────────────────────────────────────
function RadialGauge({ pct, color }: { pct: number; color: string }) {
  const animPct = useAnimated(pct, 200);
  const r = 36, cx = 48, sw = 8, circ = 2 * Math.PI * r, arc = (animPct / 100) * circ;
  return (
    <svg width={96} height={96} viewBox="0 0 96 96">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color}/><stop offset="100%" stopColor={pct>=80?GOLD:color} stopOpacity="0.7"/>
        </linearGradient>
      </defs>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke={BDL} strokeWidth={sw}/>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="url(#gaugeGrad)" strokeWidth={sw}
        strokeDasharray={`${arc} ${circ - arc}`} strokeDashoffset={circ*0.25} strokeLinecap="round"
        style={{ transition:"stroke-dasharray 0.85s cubic-bezier(0.4,0,0.2,1)", filter:`drop-shadow(0 0 5px ${color}60)` }}/>
      <text x={cx} y={cx-5} textAnchor="middle" dominantBaseline="middle" fontSize={18} fontWeight={800} fill={NAVY} fontFamily={font}>{pct}</text>
      <text x={cx} y={cx+11} textAnchor="middle" dominantBaseline="middle" fontSize={7} fontWeight={700} fill={TT} fontFamily={font}>% COMPLETE</text>
    </svg>
  );
}

// ── Doc metrics panel ─────────────────────────────────────────────────────────
function DocMetricsPanel({ items, statuses, onBeginReview }: { items: DocItem[]; statuses: Record<string, DocStatus>; onBeginReview: () => void }) {
  const req = items.filter(i => i.required), cond = items.filter(i => !i.required);
  const reqRecv = req.filter(i => statuses[i.id] === "received").length;
  const condRecv = cond.filter(i => statuses[i.id] === "received").length;
  const pct = req.length ? Math.round((reqRecv / req.length) * 100) : 0;
  const gaugeColor = pct < 50 ? RED : pct < 80 ? ORANGE : GREEN;
  const readiness = Math.min(100, Math.round(pct * 0.8 + (cond.length ? (condRecv / cond.length) * 20 : 20)));
  const allReq = reqRecv === req.length;
  const catGroups = (["Universal","GL","GL-BLX","ML","PL","EL-AR"] as DocCategory[]).map(cat => ({ cat, items: items.filter(i => i.category === cat) })).filter(g => g.items.length > 0);
  const [catReady, setCatReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setCatReady(true), 150); return () => clearTimeout(t); }, []);
  return (
    <div style={{ margin:"0 14px 14px", background:"white", borderRadius:R, border:`1px solid ${BDL}`, boxShadow:allReq?`${SH_MD},0 0 0 2px ${GREEN}40`:SH_SM, overflow:"hidden", animation:"slideUp 0.4s ease" }}>
      <div style={{ padding:"10px 14px", background:`linear-gradient(135deg,${allReq?"#E8F5EC":"#EBF0FB"},white)`, borderBottom:`1px solid ${BDL}`, display:"flex", alignItems:"center", gap:7 }}>
        <TrendingUp size={13} color={allReq?GREEN:BLUE}/>
        <span style={{ fontSize:"0.60rem", fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:"0.09em" }}>SUBMISSION READINESS</span>
        {allReq && <span style={{ marginLeft:"auto", fontSize:"0.57rem", fontWeight:800, color:GREEN, background:"#E8F5EC", padding:"2px 9px", borderRadius:20 }}>✓ READY</span>}
      </div>
      <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <RadialGauge pct={pct} color={gaugeColor}/>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:9 }}>
            <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px", border:`1px solid ${BDL}` }}>
              <p style={{ fontSize:"1.2rem", fontWeight:800, color:NAVY, lineHeight:1 }}>{reqRecv}<span style={{ fontSize:"0.72rem", fontWeight:500, color:TT }}>/{req.length}</span></p>
              <p style={{ fontSize:"0.61rem", color:TT, marginTop:2 }}>Required docs received</p>
            </div>
            {cond.length > 0 && (
              <div style={{ background:"#F8FAFC", borderRadius:8, padding:"10px 12px", border:`1px solid ${BDL}` }}>
                <p style={{ fontSize:"0.90rem", fontWeight:700, color:TM, lineHeight:1 }}>{condRecv}<span style={{ fontSize:"0.62rem", fontWeight:400, color:TT }}>/{cond.length}</span></p>
                <p style={{ fontSize:"0.61rem", color:TT, marginTop:2 }}>Conditional docs received</p>
              </div>
            )}
          </div>
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {catGroups.map(({ cat, items: ci }, idx) => {
            const meta = CATEGORY_META[cat];
            const recv = ci.filter(i => statuses[i.id] === "received").length;
            const catPct = ci.length ? Math.round((recv / ci.length) * 100) : 0;
            const done = recv === ci.length;
            return (
              <div key={cat} style={{ animation:`slideUp 0.3s ease ${idx*0.06}s both` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:"0.55rem", fontWeight:800, color:meta.color, background:`${meta.color}18`, padding:"1px 6px", borderRadius:4 }}>{meta.abbr}</span>
                    <span style={{ fontSize:"0.64rem", color:TM }}>{meta.label}</span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:5 }}>
                    <span style={{ fontSize:"0.64rem", fontWeight:700, color:done?GREEN:NAVY }}>{recv}/{ci.length}</span>
                    {done && <Check size={11} color={GREEN}/>}
                  </div>
                </div>
                <div style={{ height:6, background:"#EEF2F7", borderRadius:4, overflow:"hidden" }}>
                  <div style={{ height:"100%", width:catReady?`${catPct}%`:"0%", background:done?`linear-gradient(to right,${GREEN},${GREEN}CC)`:meta.color, borderRadius:4, transition:`width 0.65s cubic-bezier(0.4,0,0.2,1) ${idx*0.07}s` }}/>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ borderTop:`1px solid ${BDL}`, paddingTop:12 }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
            <span style={{ fontSize:"0.62rem", fontWeight:700, color:TT, textTransform:"uppercase", letterSpacing:"0.07em" }}>UW Readiness Score</span>
            <span style={{ fontSize:"0.84rem", fontWeight:800, color:gaugeColor }}>{readiness}</span>
          </div>
          <div style={{ height:8, background:"#EEF2F7", borderRadius:6, overflow:"hidden", position:"relative" }}>
            <div style={{ position:"absolute", inset:0, background:`linear-gradient(to right,${RED},${ORANGE},${GREEN})`, opacity:0.18 }}/>
            <div style={{ height:"100%", width:`${readiness}%`, background:`linear-gradient(to right,${gaugeColor},${gaugeColor}CC)`, borderRadius:6, transition:"width 0.7s ease", position:"relative", boxShadow:`2px 0 8px ${gaugeColor}40` }}/>
          </div>
          <p style={{ fontSize:"0.62rem", color:TM, marginTop:6 }}>
            {readiness>=80?"✓ Ready for underwriting review":`${req.length-reqRecv} required doc${req.length-reqRecv!==1?"s":""} still missing`}
          </p>
        </div>
        <button disabled={!allReq} onClick={allReq?onBeginReview:undefined} style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:8, width:"100%", padding:"11px 0", fontFamily:font, background:allReq?`linear-gradient(135deg,${GREEN},#1F9A5A)`:`linear-gradient(135deg,${BDL},#E0E7EF)`, border:"none", borderRadius:8, cursor:allReq?"pointer":"not-allowed", fontSize:"0.74rem", fontWeight:700, color:allReq?"white":TT, boxShadow:allReq?`0 4px 14px ${GREEN}40`:"none", transition:"all 0.3s ease" }}>
          <Sparkles size={14}/>{allReq?"Begin Auto-Review →":`${req.length-reqRecv} required doc${req.length-reqRecv!==1?"s":""} missing`}
        </button>
      </div>
    </div>
  );
}

// ── Review dimension card ─────────────────────────────────────────────────────
function DimCard({ icon, label, result, index = 0 }: { icon: React.ReactNode; label: string; result: DimensionResult; index?: number }) {
  const [barReady, setBarReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarReady(true), 200 + index * 120); return () => clearTimeout(t); }, [index]);
  const findIcon = (type: DimensionFinding["type"]) => ({ positive:<CheckCircle2 size={12} color={GREEN}/>, warning:<AlertTriangle size={12} color={ORANGE}/>, critical:<AlertTriangle size={12} color={RED}/>, info:<Info size={12} color={BLUE}/> }[type]);
  return (
    <div style={{ background:"white", borderRadius:R, border:`1px solid ${BDL}`, boxShadow:SH_SM, overflow:"hidden", animation:`slideUp 0.35s ease ${index*0.1}s both` }}>
      <div style={{ padding:"10px 14px", background:`linear-gradient(135deg,${result.scoreColor}10,${result.scoreColor}04)`, borderBottom:`1px solid ${result.scoreColor}25`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ color:result.scoreColor }}>{icon}</span>
          <span style={{ fontSize:"0.67rem", fontWeight:800, color:NAVY }}>{label}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:7 }}>
          <span style={{ fontSize:"0.56rem", fontWeight:800, color:result.scoreColor, background:`${result.scoreColor}18`, padding:"2px 8px", borderRadius:20 }}>{result.scoreLabel}</span>
          <span style={{ fontSize:"0.84rem", fontWeight:800, color:result.scoreColor }}>{result.score}</span>
        </div>
      </div>
      <div style={{ padding:"6px 0 8px" }}>
        <div style={{ height:4, background:"#EEF2F7", margin:"0 14px 10px", borderRadius:2 }}>
          <div style={{ height:"100%", width:barReady?`${result.score}%`:"0%", background:`linear-gradient(to right,${result.scoreColor},${result.scoreColor}80)`, transition:"width 0.85s cubic-bezier(0.4,0,0.2,1)", borderRadius:2 }}/>
        </div>
        <div style={{ padding:"0 14px", display:"flex", flexDirection:"column", gap:6 }}>
          {result.findings.map((f,i) => (
            <div key={i} style={{ display:"flex", alignItems:"flex-start", gap:7 }}>
              <span style={{ flexShrink:0, marginTop:2 }}>{findIcon(f.type)}</span>
              <p style={{ fontSize:"0.67rem", color:TM, lineHeight:1.5 }}>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Doc review panel ──────────────────────────────────────────────────────────
const PRI_CFG: Record<ActionPriority, { color: string; bg: string; label: string }> = {
  urgent:   { color:RED,    bg:"#FEF2F2", label:"URGENT"   },
  required: { color:ORANGE, bg:"#FEF3E2", label:"REQUIRED" },
  optional: { color:BLUE,   bg:"#EBF0FB", label:"OPTIONAL" },
};
const REC_CFG: Record<string, { color: string }> = { high:{color:RED}, medium:{color:ORANGE}, low:{color:BLUE} };
const OWNER_CFG: Record<ActionOwner, { color: string; bg: string }> = {
  "Broker/User":       { color:BLUE,   bg:"#EBF0FB" },
  "System Automation": { color:PURPLE, bg:"#F3EDFB" },
  "Underwriter":       { color:NAVY,   bg:"#EEF2F7" },
};

function ReviewSection({ label, badge, children }: { label: string; badge?: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:10, paddingBottom:7, borderBottom:`2px solid ${NAVY}10` }}>
        <span style={{ fontSize:"0.62rem", fontWeight:800, color:NAVY, textTransform:"uppercase", letterSpacing:"0.1em" }}>{label}</span>
        {badge && <span style={{ fontSize:"0.57rem", fontWeight:700, color:TT, background:BDL, padding:"2px 8px", borderRadius:12 }}>{badge}</span>}
      </div>
      {children}
    </div>
  );
}

function DocReviewPanel({ review, onAskAbout }: { review: DocReviewResult; onAskAbout: (q: string) => void }) {
  return (
    <div style={{ animation:"slideUp 0.3s ease" }}>
      <div style={{ padding:"13px 16px", background:`linear-gradient(135deg,${GREEN}15,${BLUE}08)`, borderBottom:`1px solid ${GREEN}30`, display:"flex", alignItems:"center", gap:10 }}>
        <div style={{ width:36, height:36, background:`linear-gradient(135deg,${GREEN},#1F9A5A)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:`0 4px 12px ${GREEN}40` }}>
          <Sparkles size={17} color="white"/>
        </div>
        <div>
          <p style={{ fontSize:"0.76rem", fontWeight:800, color:GREEN }}>Auto-Review Complete</p>
          <p style={{ fontSize:"0.62rem", color:TM, marginTop:1 }}>3 dimensions · {review.recommendations.length} recommendations · {review.actionItems.length} action items</p>
        </div>
      </div>
      <div style={{ padding:"16px 14px", display:"flex", flexDirection:"column", gap:18 }}>
        <ReviewSection label="Dimensional Review">
          <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
            <DimCard icon={<CheckCircle2 size={13}/>} label="Appetite & Member-Fit" result={review.appetite} index={0}/>
            <DimCard icon={<AlertTriangle size={13}/>} label="Claims History · 6-Year" result={review.claims} index={1}/>
            <DimCard icon={<Info size={13}/>} label="Comparable Risk Benchmark" result={review.benchmark} index={2}/>
          </div>
        </ReviewSection>
        <ReviewSection label="Benchmark Comparison">
          <BenchmarkBars value={review.benchmark.score}/>
        </ReviewSection>
        {review.recommendations.length > 0 && (
          <ReviewSection label="Companion Recommendations" badge={`${review.recommendations.length} found`}>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {review.recommendations.map((rec,i) => {
                const cfg = REC_CFG[rec.priority];
                return (
                  <div key={i} style={{ background:"white", borderRadius:R, border:`1px solid ${BDL}`, borderLeft:`4px solid ${cfg.color}`, padding:"12px 14px", boxShadow:SH_SM, animation:`slideUp 0.35s ease ${i*0.1+0.3}s both` }}>
                    <span style={{ fontSize:"0.54rem", fontWeight:800, color:cfg.color, background:`${cfg.color}15`, padding:"2px 8px", borderRadius:20, textTransform:"uppercase", letterSpacing:"0.07em" }}>{rec.priority} priority</span>
                    <p style={{ fontSize:"0.72rem", fontWeight:700, color:NAVY, marginTop:6, marginBottom:6 }}>{rec.product}</p>
                    <p style={{ fontSize:"0.67rem", color:TM, lineHeight:1.55, fontStyle:"italic", borderLeft:`2px solid ${cfg.color}40`, paddingLeft:8, marginBottom:8 }}>"{rec.reason}"</p>
                    <button onClick={() => onAskAbout(`Tell me more about adding ${rec.product} to this submission.`)} style={{ display:"flex", alignItems:"center", gap:5, fontSize:"0.62rem", color:BLUE, fontWeight:600, background:"none", border:"none", cursor:"pointer", fontFamily:font, padding:0 }}>
                      <Sparkles size={9} color={BLUE}/> Ask Companion about this
                    </button>
                  </div>
                );
              })}
            </div>
          </ReviewSection>
        )}
        <ReviewSection label="Required Action Items" badge={`${review.actionItems.length} items`}>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {(["urgent","required","optional"] as ActionPriority[]).map(priority => {
              const group = review.actionItems.filter(a => a.priority === priority);
              if (!group.length) return null;
              const cfg = PRI_CFG[priority];
              return (
                <div key={priority}>
                  <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:7 }}>
                    <div style={{ width:8, height:8, borderRadius:"50%", background:cfg.color, boxShadow:`0 0 0 3px ${cfg.color}25` }}/>
                    <span style={{ fontSize:"0.58rem", fontWeight:800, color:cfg.color, textTransform:"uppercase", letterSpacing:"0.09em" }}>{cfg.label}</span>
                    <span style={{ fontSize:"0.57rem", color:TT, marginLeft:"auto" }}>{group.length} item{group.length!==1?"s":""}</span>
                  </div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                    {group.map((item,i) => {
                      const oc = OWNER_CFG[item.owner];
                      return (
                        <div key={i} style={{ background:"white", borderRadius:8, border:`1px solid ${BDL}`, borderLeft:`3px solid ${cfg.color}`, padding:"10px 12px", boxShadow:SH_SM }}>
                          <p style={{ fontSize:"0.69rem", fontWeight:700, color:NAVY, lineHeight:1.35, marginBottom:5 }}>{item.gap}</p>
                          <div style={{ display:"flex", gap:6, alignItems:"flex-start", marginBottom:7 }}>
                            <span style={{ color:cfg.color, flexShrink:0, marginTop:1 }}>→</span>
                            <p style={{ fontSize:"0.67rem", color:TM, lineHeight:1.5 }}>{item.action}</p>
                          </div>
                          <span style={{ fontSize:"0.57rem", fontWeight:700, color:oc.color, background:oc.bg, padding:"2px 9px", borderRadius:20 }}>{item.owner}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </ReviewSection>
      </div>
    </div>
  );
}

// ── New submission checklist ───────────────────────────────────────────────────
function NewSubmissionView({ products, items, statuses, onToggle, onAskAbout }: { products: string[]; items: DocItem[]; statuses: Record<string, DocStatus>; onToggle: (id: string) => void; onAskAbout: (q: string) => void }) {
  if (!products.length) {
    return (
      <div style={{ padding:"36px 20px", display:"flex", flexDirection:"column", alignItems:"center", gap:14, textAlign:"center", animation:"fadeIn 0.4s ease" }}>
        <div style={{ width:56, height:56, borderRadius:16, background:`linear-gradient(135deg,#EBF0FB,#F0F4F8)`, display:"flex", alignItems:"center", justifyContent:"center", boxShadow:SH_SM }}>
          <FileText size={24} color={BLUE}/>
        </div>
        <div>
          <p style={{ fontSize:"0.82rem", fontWeight:700, color:NAVY, marginBottom:6 }}>Select products to generate checklist</p>
          <p style={{ fontSize:"0.68rem", color:TT, lineHeight:1.6, maxWidth:260 }}>Choose one or more coverage products above. Companion will generate the exact UE document checklist for underwriting review.</p>
        </div>
      </div>
    );
  }
  const catOrder: DocCategory[] = ["Universal","GL","GL-BLX","ML","PL","EL-AR"];
  const groups = catOrder.map(cat => ({ cat, items: items.filter(i => i.category === cat) })).filter(g => g.items.length > 0);
  const totalReq = items.filter(i => i.required).length;
  const reqRecv  = items.filter(i => i.required && statuses[i.id] === "received").length;
  const pct = totalReq ? Math.round((reqRecv / totalReq) * 100) : 0;
  const [barReady, setBarReady] = useState(false);
  useEffect(() => { const t = setTimeout(() => setBarReady(true), 100); return () => clearTimeout(t); }, []);
  return (
    <div style={{ display:"flex", flexDirection:"column", animation:"slideUp 0.3s ease" }}>
      <div style={{ padding:"14px 14px 12px" }}>
        <p style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.11em", marginBottom:5 }}>NEW SUBMISSION · INTAKE CHECKLIST</p>
        <p style={{ fontSize:"0.86rem", fontWeight:800, color:NAVY }}>{totalReq} required · {items.filter(i=>!i.required).length} conditional documents</p>
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginTop:9 }}>
          {products.map((p,i) => {
            const abbr = p.match(/\(([^)]+)\)/)?.[1] ?? p.slice(0,3);
            const color = GL_PRODUCTS.includes(p)?BLUE:ML_PRODUCTS.includes(p)?PURPLE:EL_AR_PRODS.includes(p)?"#B45309":GREEN;
            return <span key={i} style={{ fontSize:"0.58rem", fontWeight:800, color, background:`${color}15`, padding:"3px 9px", borderRadius:20 }}>{abbr}</span>;
          })}
        </div>
        <div style={{ marginTop:12 }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
            <span style={{ fontSize:"0.60rem", color:TT }}>Required docs received</span>
            <span style={{ fontSize:"0.62rem", fontWeight:800, color:reqRecv===totalReq?GREEN:NAVY }}>{reqRecv}/{totalReq} · {pct}%</span>
          </div>
          <div style={{ height:6, background:"#EEF2F7", borderRadius:4, overflow:"hidden" }}>
            <div style={{ height:"100%", width:barReady?`${pct}%`:"0%", background:reqRecv===totalReq?`linear-gradient(to right,${GREEN},#1F9A5A)`:`linear-gradient(to right,${BLUE},${BLUE}99)`, borderRadius:4, transition:"width 0.6s ease" }}/>
          </div>
        </div>
      </div>
      <div style={{ height:1, background:BDL, margin:"0 14px" }}/>
      <div style={{ padding:"12px 14px", display:"flex", flexDirection:"column", gap:16 }}>
        {groups.map(({ cat, items: ci }, gi) => {
          const meta = CATEGORY_META[cat];
          return (
            <div key={cat} style={{ animation:`slideUp 0.3s ease ${gi*0.07}s both` }}>
              <div style={{ display:"flex", alignItems:"center", gap:7, marginBottom:8 }}>
                <span style={{ fontSize:"0.56rem", fontWeight:800, color:meta.color, background:`${meta.color}18`, padding:"2px 7px", borderRadius:4 }}>{meta.abbr}</span>
                <span style={{ fontSize:"0.66rem", fontWeight:700, color:NAVY }}>{meta.label}</span>
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {ci.map((item, ii) => {
                  const status = statuses[item.id] ?? "pending";
                  const isRecv = status === "received", isNA = status === "na";
                  return (
                    <div key={item.id} style={{ display:"flex", alignItems:"flex-start", gap:10, padding:"10px 12px", background:"white", borderRadius:9, border:`1px solid ${isRecv?GREEN+"60":BDL}`, borderLeft:`3px solid ${isRecv?GREEN:item.required?BLUE:TT}`, boxShadow:isRecv?`0 2px 8px ${GREEN}20`:SH_SM, opacity:isNA?0.5:1, transition:"all 0.25s ease", animation:`slideUp 0.3s ease ${(gi*3+ii)*0.04}s both` }}>
                      <button onClick={() => onToggle(item.id)} style={{ width:20, height:20, flexShrink:0, marginTop:1, borderRadius:5, border:`2px solid ${isRecv?GREEN:BDL}`, background:isRecv?GREEN:"white", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", transition:"all 0.2s ease", boxShadow:isRecv?`0 0 0 3px ${GREEN}25`:"none" }}>
                        {isRecv && <Check size={11} color="white" style={{ animation:"popIn 0.2s ease" }}/>}
                      </button>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ display:"flex", alignItems:"flex-start", gap:6 }}>
                          <p style={{ fontSize:"0.70rem", fontWeight:600, color:isRecv?GREEN:isNA?TT:NAVY, textDecoration:isNA?"line-through":"none", lineHeight:1.4, flex:1, transition:"color 0.2s" }}>{item.label}</p>
                          {!item.required && <span style={{ fontSize:"0.53rem", color:TT, background:"#F0F4F8", padding:"2px 6px", borderRadius:10, flexShrink:0 }}>CONDITIONAL</span>}
                        </div>
                        {item.note && !isRecv && <p style={{ fontSize:"0.60rem", color:TT, marginTop:3, lineHeight:1.4 }}>{item.note}</p>}
                        {isRecv && <p style={{ fontSize:"0.60rem", color:GREEN, marginTop:3, fontWeight:700 }}>✓ Received</p>}
                      </div>
                      {!item.required && (
                        <button onClick={() => onToggle(item.id+"__na")} style={{ fontSize:"0.54rem", color:isNA?TM:TT, background:isNA?"#E8EDF3":"transparent", border:`1px solid ${isNA?BDL:"transparent"}`, padding:"2px 6px", borderRadius:6, cursor:"pointer", fontFamily:font, flexShrink:0, transition:"all 0.2s" }}>
                          {isNA?"Undo":"N/A"}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ padding:"10px 14px 0", borderTop:`1px solid ${BDL}` }}>
        <p style={{ fontSize:"0.57rem", fontWeight:800, color:TT, textTransform:"uppercase", letterSpacing:"0.09em", marginBottom:7 }}>ASK COMPANION</p>
        <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
          {["What is required for BLX submissions?","Explain the SIR funding mechanism requirement","What ML operational disclosures are needed?"].map((q,i) => (
            <button key={i} onClick={() => onAskAbout(q)} style={{ display:"flex", alignItems:"center", gap:7, padding:"8px 11px", background:"white", border:`1px solid ${BDL}`, borderRadius:8, fontSize:"0.67rem", color:BLUE, fontWeight:500, cursor:"pointer", textAlign:"left", fontFamily:font, boxShadow:SH_SM, transition:"all 0.2s ease" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background="#EBF0FB"; (e.currentTarget as HTMLElement).style.borderColor=`${BLUE}60`; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background="white"; (e.currentTarget as HTMLElement).style.borderColor=BDL; }}>
              <Sparkles size={9} color={BLUE} style={{ flexShrink:0 }}/>{q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mode tab ──────────────────────────────────────────────────────────────────
function ModeTab({ label, icon, active, color, onClick }: { label: string; icon: React.ReactNode; active: boolean; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, border:"none", fontFamily:font, cursor:"pointer", background:active?`${color}18`:"transparent", color:active?color:TT, fontSize:"0.57rem", fontWeight:active?800:600, textTransform:"uppercase", letterSpacing:"0.07em", transition:"all 0.2s ease", boxShadow:active?`0 0 0 1px ${color}40`:"none" }}>
      <span style={{ color:active?color:TT }}>{icon}</span>{label}
    </button>
  );
}

const MODE_BADGE: Record<CompanionMode, { label: string; color: string; icon: React.ReactNode }> = {
  proactive:      { label:"Proactive",      color:"#22C55E", icon:<Zap size={9}/> },
  drilldown:      { label:"Drill-down",     color:BLUE,      icon:<Info size={9}/> },
  conversational: { label:"Conversational", color:PURPLE,    icon:<Send size={9}/> },
};

// ── Main ChatBot ───────────────────────────────────────────────────────────────
export function ChatBot() {
  const location = useLocation(), navigate = useNavigate();
  const { user } = useAuth();
  const { selectedProducts } = useCompanion();

  const [isOpen,       setIsOpen]       = useState(true);
  const [mode,         setMode]         = useState<CompanionMode>("proactive");
  const [scanning,     setScanning]     = useState(true);
  const [activeFlag,   setActiveFlag]   = useState<Flag | null>(null);
  const [messages,     setMessages]     = useState<Message[]>([]);
  const [input,        setInput]        = useState("");
  const [isTyping,     setIsTyping]     = useState(false);
  const [prevCtxId,    setPrevCtxId]    = useState<string | null>(null);
  const [docStatuses,  setDocStatuses]  = useState<Record<string, DocStatus>>({});
  const [newSubPhase,  setNewSubPhase]  = useState<NewSubPhase>("checklist");
  const [reviewResult, setReviewResult] = useState<DocReviewResult | null>(null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef  = useRef<HTMLTextAreaElement>(null);
  const userName  = user?.name ?? "Underwriter";
  const userRole  = user?.roleLabel ?? "Underwriter";

  const getCtxId = (p: string) => p === "/submissions/new" ? "new-submission" : /\/submission\/[^/]+\/quote/.test(p) ? "quote" : /\/submission\/[^/]+/.test(p) ? "detail" : p === "/submissions" ? "submissions" : "dashboard";
  const ctxId    = getCtxId(location.pathname);
  const content  = buildProactiveContent(ctxId, userName.split(" ")[0]);
  const docItems = ctxId === "new-submission" ? buildDocChecklist(selectedProducts) : [];
  const isNewSub = ctxId === "new-submission";
  const badge    = MODE_BADGE[mode];
  const showMetrics = isNewSub && newSubPhase === "checklist" && docItems.length > 0 && Object.values(docStatuses).some(s => s === "received");

  useEffect(() => {
    if (prevCtxId !== null && prevCtxId !== ctxId) { setMode("proactive"); setActiveFlag(null); setMessages([]); setScanning(true); }
    setPrevCtxId(ctxId);
  }, [ctxId]);

  useEffect(() => {
    if (ctxId === "new-submission") { setScanning(true); setDocStatuses({}); setNewSubPhase("checklist"); setReviewResult(null); }
  }, [selectedProducts.join(",")]);

  useEffect(() => {
    if (!scanning) return;
    const delay = ctxId === "new-submission" && !selectedProducts.length ? 600 : 1800;
    const t = setTimeout(() => setScanning(false), delay);
    return () => clearTimeout(t);
  }, [scanning, ctxId, selectedProducts.length]);

  useEffect(() => { if (mode === "conversational") scrollRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages, mode]);

  const handleBeginReview = () => {
    setNewSubPhase("reviewing"); setScanning(true);
    setTimeout(() => { setReviewResult(buildDocReview(selectedProducts)); setScanning(false); setNewSubPhase("reviewed"); }, 4000);
  };

  const handleDocToggle = (rawId: string) => {
    const isNA = rawId.endsWith("__na"), id = isNA ? rawId.slice(0,-4) : rawId;
    setDocStatuses(prev => ({ ...prev, [id]: isNA ? (prev[id]==="na"?"pending":"na") : (prev[id]==="received"?"pending":"received") }));
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim(); if (!trimmed) return;
    const hist = messages.map(m => ({ role: m.role, text: m.text }));
    setMode("conversational");
    setMessages(prev => [...prev, { id:`u-${Date.now()}`, role:"user", text:trimmed, ts:new Date() }]);
    setInput(""); setIsTyping(true);
    const nav = detectNavigation(trimmed);
    let reply: string;
    try { reply = await callAnthropic(trimmed, hist, ctxId, userName, userRole, selectedProducts, activeFlag??undefined); }
    catch { await new Promise(r => setTimeout(r, 700 + Math.random()*400)); reply = simulateResponse(trimmed); }
    setMessages(prev => [...prev, { id:`a-${Date.now()}`, role:"assistant", text:reply, ts:new Date() }]);
    setIsTyping(false);
    if (nav) setTimeout(() => navigate(nav), 600);
  }, [messages, ctxId, userName, userRole, selectedProducts, activeFlag, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => { if (e.key==="Enter"&&!e.shiftKey) { e.preventDefault(); sendMessage(input); } };

  const dotColor = isNewSub && newSubPhase === "reviewed" ? GREEN : scanning ? "#94A3B8" : badge.color;
  const statusLabel = scanning && isNewSub && newSubPhase === "reviewing" ? "Reviewing documents…" : scanning ? "Scanning…" : isNewSub && newSubPhase === "reviewed" ? "Review complete" : isNewSub ? "Intake Assist" : badge.label;
  const placeholder = mode==="drilldown"&&activeFlag ? `Ask about "${activeFlag.title.slice(0,32)}…"` : isNewSub&&newSubPhase==="reviewed" ? "Ask about any finding or action item…" : isNewSub ? "Ask about any document requirement…" : mode==="conversational" ? "Ask a follow-up…" : "Click a flag to drill in, or ask anything…";

  if (!isOpen) return (
    <div style={{ width:44, minWidth:44, height:"100vh", background:"white", borderLeft:`1px solid ${BDL}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, fontFamily:font, position:"relative" }}>
      <div style={{ position:"absolute", top:0, right:0, width:44, height:3, background:`linear-gradient(to right,${BLUE},${GOLD})` }}/>
      <button onClick={() => setIsOpen(true)} title="Open UW Companion" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:8, padding:"14px 0", cursor:"pointer", background:"transparent", border:"none", width:"100%" }}>
        <div style={{ width:34, height:34, background:`linear-gradient(135deg,${NAVY},#162A4A)`, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", boxShadow:SH_MD }}>
          <Sparkles size={16} color={GOLD}/>
          <span style={{ position:"absolute", top:3, right:3, width:8, height:8, background:dotColor, borderRadius:"50%", border:"2px solid white", animation:"pulseDot 2s infinite" }}/>
        </div>
        <span style={{ writingMode:"vertical-rl", textOrientation:"mixed", transform:"rotate(180deg)", fontSize:"0.57rem", fontWeight:800, color:NAVY, letterSpacing:"0.09em", textTransform:"uppercase", marginTop:4 }}>UW Companion</span>
        <ChevronLeft size={12} color={TT}/>
      </button>
      <style>{CSS}</style>
    </div>
  );

  return (
    <div style={{ width:"clamp(340px,26vw,440px)", minWidth:340, height:"100vh", background:"#F5F7FB", borderLeft:`1px solid ${BDL}`, display:"flex", flexDirection:"column", flexShrink:0, fontFamily:font, overflow:"hidden" }}>
      <div style={{ background:`linear-gradient(135deg,#0A1828,#162A4A)`, flexShrink:0, padding:"14px 16px 12px", display:"flex", alignItems:"flex-start", justifyContent:"space-between", boxShadow:"0 4px 20px rgba(0,0,0,0.25)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:38, height:38, background:"rgba(255,255,255,0.08)", borderRadius:11, border:"1px solid rgba(255,255,255,0.12)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Sparkles size={19} color={GOLD}/>
          </div>
          <div>
            <p style={{ fontSize:"0.86rem", fontWeight:800, color:"white", lineHeight:1.1 }}>UW Companion</p>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginTop:5 }}>
              <span style={{ width:7, height:7, borderRadius:"50%", background:dotColor, display:"inline-block", animation:"pulseDot 2s infinite", boxShadow:`0 0 0 2px ${dotColor}40` }}/>
              <span style={{ fontSize:"0.63rem", color:"rgba(255,255,255,0.65)", fontWeight:600 }}>{statusLabel}</span>
            </div>
          </div>
        </div>
        <div style={{ display:"flex", gap:6 }}>
          {(mode !== "proactive" || isNewSub) && (
            <button onClick={() => { setMode("proactive"); setActiveFlag(null); if (!isNewSub) setMessages([]); if (isNewSub) { setNewSubPhase("checklist"); setReviewResult(null); } }} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:7, cursor:"pointer", transition:"background 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.15)")} onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}>
              <RotateCcw size={12} color="rgba(255,255,255,0.7)"/>
            </button>
          )}
          <button onClick={() => setIsOpen(false)} style={{ width:28, height:28, display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,0.08)", border:"1px solid rgba(255,255,255,0.15)", borderRadius:7, cursor:"pointer", transition:"background 0.2s" }}
            onMouseEnter={e => (e.currentTarget.style.background="rgba(255,255,255,0.15)")} onMouseLeave={e => (e.currentTarget.style.background="rgba(255,255,255,0.08)")}>
            <ChevronRight size={12} color="rgba(255,255,255,0.7)"/>
          </button>
        </div>
      </div>

      <div style={{ background:"white", borderBottom:`1px solid ${BDL}`, padding:"7px 13px", display:"flex", gap:4, flexShrink:0 }}>
        {isNewSub ? (
          <>
            {newSubPhase !== "reviewed" && <ModeTab label="Checklist" icon={<FileText size={9}/>} active={newSubPhase==="checklist"} color={BLUE} onClick={() => { setNewSubPhase("checklist"); setReviewResult(null); }}/>}
            {showMetrics && <ModeTab label="Metrics" icon={<TrendingUp size={9}/>} active={false} color={GREEN} onClick={() => {}}/>}
            {newSubPhase === "reviewed" && <ModeTab label="Auto-Review" icon={<Sparkles size={9}/>} active color={GREEN} onClick={() => {}}/>}
            {mode === "conversational" && messages.length > 0 && <ModeTab label="Chat" icon={<Send size={9}/>} active={false} color={PURPLE} onClick={() => {}}/>}
          </>
        ) : (
          (["proactive","drilldown","conversational"] as CompanionMode[]).map(m => {
            const mb = MODE_BADGE[m];
            return <ModeTab key={m} label={mb.label} icon={mb.icon} active={mode===m} color={mb.color} onClick={() => { if (m==="proactive") { setMode("proactive"); setActiveFlag(null); } else if (m==="conversational" && messages.length>0) setMode("conversational"); }}/>;
          })
        )}
      </div>

      <div style={{ flex:1, overflowY:"auto" }}>
        {isNewSub && (
          <>
            {newSubPhase === "checklist" && (scanning ? <ScanningView ctxId={ctxId}/> : (<><NewSubmissionView products={selectedProducts} items={docItems} statuses={docStatuses} onToggle={handleDocToggle} onAskAbout={sendMessage}/>{showMetrics && <DocMetricsPanel items={docItems} statuses={docStatuses} onBeginReview={handleBeginReview}/>}{mode==="conversational" && messages.length>0 && <ConversationalView messages={messages} isTyping={isTyping} scrollRef={scrollRef} userInitials={user?.initials??"U"} accentColor={BLUE}/>}</>))}
            {newSubPhase === "reviewing" && <ScanningView ctxId="new-submission-review"/>}
            {newSubPhase === "reviewed" && reviewResult && (<><DocReviewPanel review={reviewResult} onAskAbout={sendMessage}/>{mode==="conversational" && messages.length>0 && <ConversationalView messages={messages} isTyping={isTyping} scrollRef={scrollRef} userInitials={user?.initials??"U"} accentColor={GREEN}/>}</>)}
          </>
        )}
        {!isNewSub && (
          <>
            {mode === "proactive" && (scanning ? <ScanningView ctxId={ctxId}/> : <ProactiveModeView content={content} ctxId={ctxId} onFlagClick={f => { setActiveFlag(f); setMode("drilldown"); }} onActionClick={sendMessage}/>)}
            {mode === "drilldown" && activeFlag && <DrilldownModeView flag={activeFlag} onBack={() => { setMode("proactive"); setActiveFlag(null); }} onQuickAsk={sendMessage}/>}
            {mode === "conversational" && <ConversationalView messages={messages} isTyping={isTyping} scrollRef={scrollRef} userInitials={user?.initials??"U"} accentColor={badge.color}/>}
          </>
        )}
      </div>

      <div style={{ padding:"10px 12px 12px", background:"white", borderTop:`1px solid ${BDL}`, flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"flex-end", gap:8, border:`1.5px solid ${input?BLUE:BDL}`, borderRadius:10, padding:"8px 8px 8px 13px", background:"#F8FAFC", transition:"border-color 0.2s,box-shadow 0.2s", boxShadow:input?`0 0 0 3px ${BLUE}12`:"none" }}>
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder={placeholder} disabled={isTyping} rows={1}
            style={{ flex:1, background:"transparent", border:"none", outline:"none", resize:"none", fontSize:"0.75rem", color:NAVY, fontFamily:font, lineHeight:1.5, maxHeight:72, overflowY:"auto" }}
            onInput={e => { const el = e.currentTarget; el.style.height="auto"; el.style.height=Math.min(el.scrollHeight,72)+"px"; }}/>
          <button onClick={() => sendMessage(input)} disabled={!input.trim()||isTyping} style={{ width:32, height:32, flexShrink:0, background:input.trim()&&!isTyping?`linear-gradient(135deg,${NAVY},${BLUE})`:BDL, borderRadius:8, border:"none", cursor:input.trim()&&!isTyping?"pointer":"not-allowed", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:input.trim()&&!isTyping?`0 4px 10px ${BLUE}30`:"none", transition:"all 0.2s ease" }}>
            <Send size={13} color="white"/>
          </button>
        </div>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginTop:6 }}>
          <div style={{ display:"flex", alignItems:"center", gap:3 }}>
            <AlertCircle size={8} color={TT}/>
            <span style={{ fontSize:"0.55rem", color:TT }}>Advisory only — verify before binding.</span>
          </div>
          <span style={{ fontSize:"0.55rem", color:TT }}>⏎ to send</span>
        </div>
      </div>
      <style>{CSS}</style>
    </div>
  );
}

const CSS = `
  @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.55;transform:scale(.72)} }
  @keyframes livePulse { 0%,100%{transform:scale(1);opacity:.15} 50%{transform:scale(2.2);opacity:.04} }
  @keyframes typingDot { 0%,80%,100%{opacity:.2;transform:scale(.8)} 40%{opacity:1;transform:scale(1)} }
  @keyframes companionPulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
  @keyframes spinRing { to{transform:rotate(360deg)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes popIn { from{opacity:0;transform:scale(0.5)} to{opacity:1;transform:scale(1)} }
`;
