interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  stroke: string;
  // When provided, the area under the line is filled with this color.
  // Otherwise only the line + a single end-dot is drawn.
  fill?: string;
  // Highlights whether the LAST data point is in a good or bad position.
  // Drives the end-dot color: "good" = stroke color, "bad" = red, "neutral" = stroke.
  tone?: "good" | "bad" | "neutral";
}

/**
 * Minimal SVG sparkline for KPI tiles. Renders a smooth line through `data`
 * with a soft area fill underneath and an end-dot at the latest value.
 *
 * Why inline SVG (not a chart lib): a workbench page renders ~5 of these in a
 * row, each ≤ 8 data points. The full visual budget here is one line + one
 * dot — anything heavier just wastes pixels and bundle size.
 */
export function Sparkline({
  data,
  width = 88,
  height = 28,
  stroke,
  fill,
  tone = "neutral",
}: SparklineProps) {
  if (data.length < 2) return null;

  // Scale points into the SVG box. Add a tiny vertical inset so the end-dot
  // doesn't get clipped at the top/bottom edges when a value sits at the
  // series min or max.
  const inset = 3;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = (width - 2) / (data.length - 1);

  const pts = data.map((v, i) => {
    const x = 1 + i * step;
    const y = inset + (height - 2 * inset) * (1 - (v - min) / range);
    return { x, y };
  });

  // Smooth path via midpoint cubic — no library, no per-point math beyond
  // the previous-and-current pair.
  const path = pts
    .map((p, i, arr) => {
      if (i === 0) return `M ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
      const prev = arr[i - 1];
      const cx = (prev.x + p.x) / 2;
      return `C ${cx.toFixed(2)} ${prev.y.toFixed(2)}, ${cx.toFixed(2)} ${p.y.toFixed(2)}, ${p.x.toFixed(2)} ${p.y.toFixed(2)}`;
    })
    .join(" ");

  const areaPath = fill
    ? `${path} L ${pts[pts.length - 1].x.toFixed(2)} ${height} L ${pts[0].x.toFixed(2)} ${height} Z`
    : null;

  const last = pts[pts.length - 1];
  const dotColor =
    tone === "bad" ? "#B91C1C"
    : tone === "good" ? stroke
    : stroke;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      style={{ display: "block", overflow: "visible" }}
      aria-hidden
    >
      {areaPath && (
        <path d={areaPath} fill={fill} opacity={0.18} />
      )}
      <path
        d={path}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={last.x} cy={last.y} r={2.2} fill={dotColor} />
      <circle cx={last.x} cy={last.y} r={4} fill={dotColor} opacity={0.18} />
    </svg>
  );
}
