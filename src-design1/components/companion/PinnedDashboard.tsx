import { Sparkles, X, ArrowUpRight, BarChart3 } from "lucide-react";
import { useCompanion, type PinnedViz, type VizSpec } from "./CompanionContext";

const N    = "#0123D4";
const G    = "#C9A227";
const BDL  = "#DCE3EC";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#7A8FA3";
const font = "'Source Sans 3', system-ui, sans-serif";

export function PinnedDashboard() {
  const { pinned, unpinViz } = useCompanion();
  if (!pinned.length) return null;

  return (
    <section
      aria-label="Pinned by you"
      style={{
        marginBottom: 24,
        borderRadius: 16, border: `1px solid ${BDL}`,
        background: "white", overflow: "hidden",
        boxShadow: "0 1px 2px rgba(11,26,110,0.04), 0 8px 24px -12px rgba(11,26,110,0.10)",
        fontFamily: font,
      }}
    >
      <header style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "12px 20px", borderBottom: `1px solid ${BDL}`,
        background: `linear-gradient(90deg, ${N}0A, ${G}0A, transparent)`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: `${N}19`, display: "grid", placeItems: "center", color: N }}>
            <Sparkles size={13} />
          </span>
          <h3 style={{ fontWeight: 800, fontSize: 15, letterSpacing: "-0.01em", color: TD, margin: 0 }}>Pinned by you</h3>
          <span style={{
            fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em",
            fontWeight: 800, color: TT, background: "#F0F3F8",
            padding: "2px 6px", borderRadius: 4,
          }}>{pinned.length}</span>
        </div>
        <p style={{ fontSize: 11, color: TT, margin: 0 }}>
          Charts you saved from the Companion. They live here until you remove them.
        </p>
      </header>
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: 1, background: BDL,
      }}>
        {pinned.map((p) => (
          <div key={p.id} style={{ background: "white" }}>
            <PinnedCard pin={p} onRemove={() => unpinViz(p.id)} />
          </div>
        ))}
      </div>
    </section>
  );
}

function PinnedCard({ pin, onRemove }: { pin: PinnedViz; onRemove: () => void }) {
  const v = pin.viz;
  const title = "title" in v ? v.title : "Pinned chart";
  const intro = "intro" in v && v.intro ? v.intro : pin.source?.page ? `From ${pin.source.page}` : undefined;

  return (
    <article style={{ position: "relative", height: "100%", padding: 20, fontFamily: font }}>
      <button
        onClick={onRemove}
        aria-label="Remove from dashboard"
        title="Remove"
        style={{
          position: "absolute", top: 12, right: 12,
          width: 28, height: 28, borderRadius: 8,
          display: "grid", placeItems: "center",
          color: TT, background: "transparent", border: "none", cursor: "pointer",
        }}
      >
        <X size={13} />
      </button>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
        <span style={{ width: 20, height: 20, borderRadius: 6, background: `${N}19`, display: "grid", placeItems: "center", color: N }}>
          <BarChart3 size={11} />
        </span>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.14em", fontWeight: 800, color: TT }}>
          {v.kind === "linecard" ? "Trend" : v.kind}
        </div>
        {pin.source?.href && (
          <a href={pin.source.href}
            style={{ marginLeft: "auto", marginRight: 28, fontSize: 10.5, fontWeight: 700, color: N, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 2 }}>
            Source <ArrowUpRight size={11} />
          </a>
        )}
      </div>
      <h4 style={{ fontWeight: 800, fontSize: 14, lineHeight: 1.3, paddingRight: 28, color: TD, margin: 0 }}>{title}</h4>
      {intro && <p style={{ fontSize: 12, color: TM, marginTop: 4, lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as any, overflow: "hidden" }}>{intro}</p>}
      <div style={{ marginTop: 12 }}>
        {v.kind === "linecard" && <LinecardMini viz={v} />}
        {v.kind === "donut" && <DonutMini viz={v} />}
        {v.kind === "bars" && <BarsMini viz={v} />}
        {(v.kind !== "linecard" && v.kind !== "donut" && v.kind !== "bars") && <UnsupportedPin />}
      </div>
    </article>
  );
}

function UnsupportedPin() {
  return (
    <div style={{
      height: 120, borderRadius: 8, border: `1px dashed ${BDL}`,
      display: "grid", placeItems: "center", fontSize: 11, color: TT,
    }}>
      Preview not available
    </div>
  );
}

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
    <div style={{ borderRadius: 12, border: `1px solid ${BDL}`, background: "linear-gradient(180deg, #FFFFFF, #FAFBFD)", padding: 12 }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ fontWeight: 800, fontSize: 20, fontFamily: "ui-monospace, monospace", color: TD, lineHeight: 1 }}>{fmt(last)}</div>
        <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 800, color: TT }}>latest</div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 130 }} preserveAspectRatio="none" role="img" aria-label={viz.title}>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={ys(t)} y2={ys(t)} stroke="#E2E6EE" strokeWidth="1" strokeDasharray="2 4" />
            <text x={padL - 6} y={ys(t) + 3} textAnchor="end" fontSize="9" fill="#7A879E" fontFamily="ui-monospace, monospace">{fmt(t)}</text>
          </g>
        ))}
        {viz.data.map((d, i) => (
          <text key={i} x={xs(i)} y={H - 6} textAnchor="middle" fontSize="9.5" fill="#5A6B8C">{d.label}</text>
        ))}
        <polyline fill="none" stroke={N} strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" points={points} vectorEffect="non-scaling-stroke" />
        {viz.data.map((d, i) => (
          <g key={`pt-${i}`}>
            <circle cx={xs(i)} cy={ys(d.value)} r="3.25" fill={N} />
            <circle cx={xs(i)} cy={ys(d.value)} r="1.4" fill="#fff" />
          </g>
        ))}
      </svg>
    </div>
  );
}

function DonutMini({ viz }: { viz: Extract<VizSpec, { kind: "donut" }> }) {
  const total = viz.segments.reduce((s, x) => s + x.value, 0) || 1;
  const R = 42, IR = 28, CX = 60, CY = 60;
  let acc = 0;
  const arcs = viz.segments.map(seg => {
    const start = (acc / total) * Math.PI * 2 - Math.PI / 2;
    acc += seg.value;
    const end   = (acc / total) * Math.PI * 2 - Math.PI / 2;
    const large = end - start > Math.PI ? 1 : 0;
    const x1 = CX + R  * Math.cos(start), y1 = CY + R  * Math.sin(start);
    const x2 = CX + R  * Math.cos(end),   y2 = CY + R  * Math.sin(end);
    const x3 = CX + IR * Math.cos(end),   y3 = CY + IR * Math.sin(end);
    const x4 = CX + IR * Math.cos(start), y4 = CY + IR * Math.sin(start);
    return { d: `M${x1},${y1} A${R},${R} 0 ${large} 1 ${x2},${y2} L${x3},${y3} A${IR},${IR} 0 ${large} 0 ${x4},${y4} Z`, color: seg.color, label: seg.label, value: seg.value };
  });
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${BDL}`, background: "white", padding: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <svg width={120} height={120} viewBox="0 0 120 120">
        {arcs.map((a, i) => <path key={i} d={a.d} fill={a.color} />)}
      </svg>
      <div style={{ flex: 1, fontSize: 11, lineHeight: 1.55 }}>
        {arcs.map((a, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: 2, background: a.color, flexShrink: 0 }} />
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", color: TD }}>{a.label}</span>
            <span style={{ fontWeight: 700, color: TM }}>{Math.round((a.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarsMini({ viz }: { viz: Extract<VizSpec, { kind: "bars" }> }) {
  const max = Math.max(...viz.series.map(s => s.value)) || 1;
  return (
    <div style={{ borderRadius: 12, border: `1px solid ${BDL}`, background: "white", padding: 12, display: "flex", flexDirection: "column", gap: 5 }}>
      {viz.series.slice(0, 8).map((s, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
          <span style={{ width: 78, color: TM, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.label}</span>
          <div style={{ flex: 1, height: 8, background: "#EEF1F6", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ width: `${(s.value / max) * 100}%`, height: "100%", background: N, borderRadius: 4 }} />
          </div>
          <span style={{ width: 36, textAlign: "right", fontWeight: 700, color: TD, fontFamily: "ui-monospace, monospace" }}>{s.value}{viz.unit ? "" : ""}</span>
        </div>
      ))}
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
