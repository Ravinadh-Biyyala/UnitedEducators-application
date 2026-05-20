import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, ArrowUpRight, BarChart3 } from "lucide-react";
import { useCompanion, type PinnedViz, type VizSpec } from "./CompanionContext";

// "Pinned by you" — a clean grid of linecards that the user has pinned from
// the Companion via the "Add to Dashboard" CTA. Renders nothing when empty.
export function PinnedDashboard() {
  const { pinned, unpinViz } = useCompanion();
  if (!pinned.length) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border bg-card overflow-hidden shadow-[0_1px_2px_rgba(11,26,110,0.04),0_8px_24px_-12px_rgba(11,26,110,0.10)]"
      aria-label="Pinned by you"
    >
      <header className="flex items-center justify-between px-5 py-3.5 border-b bg-gradient-to-r from-primary/[0.04] via-accent/[0.04] to-transparent">
        <div className="flex items-center gap-2">
          <span className="size-6 rounded-lg bg-primary/10 grid place-items-center text-primary">
            <Sparkles className="size-3.5" />
          </span>
          <h3 className="font-display font-bold text-[15px] tracking-tight">Pinned by you</h3>
          <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground bg-muted/60 px-1.5 py-0.5 rounded">
            {pinned.length}
          </span>
        </div>
        <p className="hidden sm:block text-[11px] text-muted-foreground">
          Charts you saved from the Companion. They live here until you remove them.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-px bg-border">
        <AnimatePresence initial={false}>
          {pinned.map((p) => (
            <motion.div
              key={p.id}
              layout
              initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="bg-card"
            >
              <PinnedCard pin={p} onRemove={() => unpinViz(p.id)} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}

function PinnedCard({ pin, onRemove }: { pin: PinnedViz; onRemove: () => void }) {
  const v = pin.viz;
  // Today only linecards carry the Add CTA. Keep the renderer narrow but
  // future-proof: render a small placeholder for any other kind we add later.
  const title = "title" in v ? v.title : "Pinned chart";
  const intro = "intro" in v && v.intro ? v.intro : pin.source?.page ? `From ${pin.source.page}` : undefined;

  return (
    <article className="group relative h-full p-5 hover:bg-muted/20 transition-colors">
      <button
        onClick={onRemove}
        aria-label="Remove from dashboard"
        title="Remove"
        className="absolute top-3 right-3 size-7 rounded-lg grid place-items-center text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors opacity-0 group-hover:opacity-100"
      >
        <X className="size-3.5" />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <span className="size-5 rounded-md bg-primary/10 grid place-items-center text-primary">
          <BarChart3 className="size-3" />
        </span>
        <div className="text-[10px] uppercase tracking-[0.14em] font-bold text-muted-foreground">
          {v.kind === "linecard" ? "Trend" : v.kind}
        </div>
        {pin.source?.href && (
          <a
            href={pin.source.href}
            className="ml-auto mr-8 text-[10.5px] font-semibold text-primary inline-flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            Source <ArrowUpRight className="size-3" />
          </a>
        )}
      </div>

      <h4 className="font-display font-bold text-[14px] leading-snug pr-8">{title}</h4>
      {intro && <p className="text-[12px] text-muted-foreground mt-1 leading-relaxed line-clamp-2">{intro}</p>}

      <div className="mt-3">
        {v.kind === "linecard" ? <LinecardMini viz={v} /> : <UnsupportedPin />}
      </div>
    </article>
  );
}

function UnsupportedPin() {
  return (
    <div className="h-[120px] rounded-lg border border-dashed grid place-items-center text-[11px] text-muted-foreground">
      Preview not available
    </div>
  );
}

// Minimal, dashboard-grade rendering of a linecard — same brand palette,
// dotted gridlines, blue line + dots. Sized for a tile in a 2/3-col grid.
function LinecardMini({ viz }: { viz: Extract<VizSpec, { kind: "linecard" }> }) {
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
  const tickMax = niceCeil(max * 1.1);
  const ticks = [tickMax, tickMax * 0.66, tickMax * 0.33, 0];
  const W = 360, H = 130, padL = 42, padR = 10, padT = 8, padB = 22;
  const innerW = W - padL - padR, innerH = H - padT - padB;
  const xs = (i: number) => padL + (viz.data.length === 1 ? innerW / 2 : (i / (viz.data.length - 1)) * innerW);
  const ys = (v: number) => padT + innerH - (v / tickMax) * innerH;
  const points = viz.data.map((d, i) => `${xs(i)},${ys(d.value)}`).join(" ");
  const last = viz.data[viz.data.length - 1]?.value ?? 0;

  return (
    <div className="rounded-xl border bg-gradient-to-b from-white to-[#FAFBFD] dark:from-card dark:to-card p-3">
      <div className="flex items-baseline justify-between mb-1">
        <div className="font-display font-bold text-[20px] font-mono-tabular text-foreground leading-none">{fmt(last)}</div>
        <div className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">latest</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[130px]" preserveAspectRatio="none" role="img" aria-label={viz.title}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E2E6EE" strokeWidth="1" strokeDasharray="2 4" />
            <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize="9" fill="#7A879E" fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace">{fmt(t)}</text>
          </g>
        ))}
        {viz.data.map((d, i) => (
          <text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#5A6B8C">{d.label}</text>
        ))}
        <motion.polyline
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7, ease: "easeOut" }}
          fill="none" stroke="#0123D4" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round"
          points={points} vectorEffect="non-scaling-stroke"
        />
        {viz.data.map((d, i) => (
          <g key={`pt-${i}`}>
            <circle cx={xs(i)} cy={ys(d.value)} r="3.25" fill="#0123D4" />
            <circle cx={xs(i)} cy={ys(d.value)} r="1.4" fill="#fff" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function niceCeil(n: number): number {
  if (n <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(n)));
  const f = n / pow;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * pow;
}
