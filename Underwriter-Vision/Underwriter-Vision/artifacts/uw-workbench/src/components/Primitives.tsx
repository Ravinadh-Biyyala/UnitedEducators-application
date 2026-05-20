import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Section heading ────────────────────────────────────────────────────────
export function SectionTitle({ eyebrow, title, sub, action }: {
  eyebrow?: string; title: string; sub?: string; action?: ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-5">
      <div>
        {eyebrow && (
          <div className="text-[11px] tracking-[0.18em] uppercase text-primary/70 font-bold mb-2">{eyebrow}</div>
        )}
        <h2 className="font-display text-2xl md:text-3xl font-bold text-balance">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-1.5 max-w-2xl">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Metric / KPI tile ──────────────────────────────────────────────────────
// Restrained, professional pattern: neutral card, mono-tabular value in foreground,
// a single hairline accent at the top and a thin sparkline. No washes / glows / orbs.
export function MetricTile({ label, value, sub, trend, accent = "blue", icon: Icon, spark }: {
  label: string; value: string; sub?: string;
  trend?: "up" | "down" | "neutral";
  accent?: "blue" | "gold" | "green" | "red";
  icon?: LucideIcon;
  spark?: number[];
}) {
  const stroke =
    accent === "gold"  ? "#C9A227" :
    accent === "green" ? "#0B1A6E" :   // map green→navy for a calmer palette
    accent === "red"   ? "#9F1239" :
                         "#0123D4";
  const id = `tile-${label.replace(/\W+/g, "-")}-${accent}`;
  const points = spark && spark.length > 1 ? (() => {
    const max = Math.max(...spark), min = Math.min(...spark), span = max - min || 1;
    return spark.map((v, i) => `${(i / (spark.length - 1)) * 100},${100 - ((v - min) / span) * 70 - 15}`).join(" ");
  })() : null;
  const trendUp = trend === "up";
  const trendDown = trend === "down";

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
      className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-[0_1px_2px_rgba(11,26,110,0.04),0_4px_12px_-6px_rgba(11,26,110,0.08)] hover:shadow-[0_2px_4px_rgba(11,26,110,0.06),0_12px_24px_-10px_rgba(11,26,110,0.16)] hover:border-foreground/15 transition-[border-color,box-shadow,transform]"
    >
      {/* hairline accent at top */}
      <div className="absolute inset-x-0 top-0 h-[2px]" style={{ background: stroke }} />
      {/* faint corner wash for warmth without being colorful */}
      <div className="absolute -top-12 -right-12 size-28 rounded-full opacity-[0.06] blur-2xl pointer-events-none" style={{ background: stroke }} />

      <div className="relative flex items-start justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">{label}</div>
        {Icon && (
          <div className="size-7 rounded-lg grid place-items-center border bg-background/60 shrink-0" style={{ color: stroke, borderColor: `${stroke}22` }}>
            <Icon className="size-3.5" />
          </div>
        )}
      </div>

      <div className="relative mt-2.5 font-display text-[28px] font-bold leading-none tracking-tight font-mono-tabular text-foreground">
        {value}
      </div>

      {points && (
        <svg viewBox="0 0 100 100" className="relative mt-2.5 w-full h-8 overflow-visible" preserveAspectRatio="none">
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.22" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <polyline points={`0,100 ${points} 100,100`} fill={`url(#${id})`} stroke="none" />
          <motion.polyline
            initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            fill="none" stroke={stroke} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"
            points={points} vectorEffect="non-scaling-stroke"
          />
        </svg>
      )}

      {sub && (
        <div className="relative mt-2 flex items-center gap-1 text-[10.5px]">
          {trend && (
            <span className={cn(
              "inline-flex items-center justify-center size-4 rounded-full",
              trendDown ? "bg-foreground/8 text-muted-foreground" : "text-foreground",
            )} style={trendUp ? { background: `${stroke}18`, color: stroke } : undefined}>
              {trendDown ? <ArrowDownRight className="size-2.5" /> : <ArrowUpRight className="size-2.5" />}
            </span>
          )}
          <span className="text-muted-foreground">{sub}</span>
        </div>
      )}
    </motion.div>
  );
}

// ── Status pills ──────────────────────────────────────────────────────────
export function StatusPill({ children, tone = "blue", size = "md" }: {
  children: ReactNode;
  tone?: "blue" | "gold" | "green" | "red" | "purple" | "gray";
  size?: "sm" | "md";
}) {
  const tones = {
    blue: "bg-primary/10 text-primary border-primary/20",
    gold: "bg-accent/15 text-[#7B6217] border-accent/30",
    green: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    red: "bg-rose-500/10 text-rose-700 border-rose-500/20",
    purple: "bg-violet-500/10 text-violet-700 border-violet-500/20",
    gray: "bg-muted text-muted-foreground border-border",
  };
  const sizes = { sm: "text-[10px] px-2 py-0.5", md: "text-[11px] px-2.5 py-1" };
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 rounded-full font-semibold border tracking-wide uppercase",
      tones[tone], sizes[size]
    )}>{children}</span>
  );
}

export function statusTone(s: string): Parameters<typeof StatusPill>[0]["tone"] {
  if (s === "Bound" || s === "Quoted" || s === "Issued") return "green";
  if (s === "In Review" || s === "Quote In Progress") return "blue";
  if (s === "Pending Info" || s === "Information Gathering") return "gold";
  if (s === "Declined" || s === "Member Declined") return "red";
  if (s.includes("Quote")) return "purple";
  return "gray";
}

// ── Stage progress arc ────────────────────────────────────────────────────
const STAGES_FLAT = ["Intake & Triage", "Underwriting", "Quoting", "Decision", "Post-Bind"];
export function StageRail({ current, compact = false }: { current: string; compact?: boolean }) {
  const idx = STAGES_FLAT.findIndex(s => s === current);
  return (
    <div className={cn("flex items-center gap-1.5", compact ? "text-[10px]" : "text-xs")}>
      {STAGES_FLAT.map((s, i) => {
        const done = i < idx;
        const here = i === idx;
        return (
          <div key={s} className="flex items-center gap-1.5 flex-1">
            <div className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              done && "bg-primary",
              here && "bg-gradient-to-r from-primary to-accent",
              !done && !here && "bg-muted",
            )} />
            {!compact && (
              <span className={cn(
                "shrink-0 font-medium tracking-wide",
                here ? "text-primary" : done ? "text-foreground" : "text-muted-foreground"
              )}>
                {s}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Sparkline (manual, no chart library) ──────────────────────────────────
export function Sparkline({ data, color = "#0123D4", height = 38 }: { data: number[]; color?: string; height?: number }) {
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 100}`).join(" ");
  const area = `0,100 ${points} 100,100`;
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ height, width: "100%" }}>
      <defs>
        <linearGradient id={`spark-${color.replace("#","")}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.32" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill={`url(#spark-${color.replace("#","")})`} />
      <polyline fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" points={points} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

// ── Page header ───────────────────────────────────────────────────────────
export function PageHeader({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 md:px-10 pt-8", className)}>{children}</div>;
}
export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("px-6 md:px-10 py-8 max-w-[1500px]", className)}>{children}</div>;
}
