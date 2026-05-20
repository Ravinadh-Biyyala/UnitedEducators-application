import { motion } from "framer-motion";
import { TrendingUp, Minus, TrendingDown, X } from "lucide-react";
import { PageBody, SectionTitle, StatusPill } from "@/components/Primitives";
import { APPETITE_SEGMENTS } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { newId, now } from "@/components/companion/CompanionContext";

const TREND = {
  expand: { icon: TrendingUp, label: "Expanding", tone: "green" as const },
  hold: { icon: Minus, label: "Hold", tone: "blue" as const },
  contract: { icon: TrendingDown, label: "Contracting", tone: "gold" as const },
  decline: { icon: X, label: "Closed", tone: "red" as const },
};

export function Appetite() {
  return (
    <PageBody className="!pt-6 !max-w-[1500px] mx-auto">
      <PageRegister
        routeKey="appetite"
        title="Appetite"
        subtitle={`${APPETITE_SEGMENTS.length} segments`}
        greeting="UE's live appetite map. Ask me where we're leaning in or pulling back, and I'll plot it for you."
        suggestions={[
          { id: "expanding", label: "Where are we expanding?", tone: "green", icon: "TrendingUp" },
          { id: "contracting", label: "Where are we contracting?", tone: "red", icon: "TrendingDown" },
          { id: "by-loss", label: "Segment loss ratios", tone: "gold", icon: "BarChart3" },
          { id: "back-portfolio", label: "Back to Portfolio", tone: "blue", icon: "BarChart3", navigateTo: "/portfolio" },
        ]}
        respond={(sid) => {
          if (sid === "expanding" || sid === "contracting") {
            const want = sid === "expanding" ? "expand" : "contract";
            const list = APPETITE_SEGMENTS.filter(s => s.trend === want);
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: sid === "expanding" ? "Expanding" : "Contracting",
              items: list.map(s => ({ ok: sid === "expanding", label: s.segment, sub: `Appetite ${s.appetite} · ${s.capacity}` })),
            } }];
          }
          if (sid === "by-loss") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "bars", title: "Appetite score by segment",
            series: APPETITE_SEGMENTS.map(s => ({ label: s.segment.split(" · ")[0], value: s.appetite, tone: s.appetite >= 80 ? "green" : s.appetite >= 60 ? "gold" : "red" })),
          } }];
          return;
        }}
      />
      <SectionTitle
        eyebrow="Appetite"
        title="What we're writing — and what we're not"
        sub="Live appetite signals across UE's segments. The Companion uses these to score every incoming submission in real-time."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {APPETITE_SEGMENTS.map((seg, i) => {
          const trend = TREND[seg.trend as keyof typeof TREND];
          const Icon = trend.icon;
          return (
            <motion.div
              key={seg.segment}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="rounded-2xl border bg-card p-5 lift-card"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display font-bold text-lg leading-tight">{seg.segment}</h3>
                <StatusPill tone={trend.tone} size="sm"><Icon className="size-3" /> {trend.label}</StatusPill>
              </div>

              <div className="mt-5 flex items-center gap-3">
                <Ring value={seg.appetite} />
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Capacity</div>
                  <div className="font-semibold text-sm">{seg.capacity}</div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{seg.note}</p>
            </motion.div>
          );
        })}
      </div>
    </PageBody>
  );
}

function Ring({ value }: { value: number }) {
  const circ = 2 * Math.PI * 32;
  const off = circ - (value / 100) * circ;
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="-rotate-90">
        <circle cx="40" cy="40" r="32" stroke="currentColor" className="text-muted" strokeWidth="7" fill="none" />
        <motion.circle
          cx="40" cy="40" r="32" stroke="url(#ag)" strokeWidth="7" fill="none" strokeLinecap="round" strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: off }} transition={{ duration: 1, ease: "easeOut" }}
        />
        <defs>
          <linearGradient id="ag" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#0123D4" /><stop offset="100%" stopColor="#C9A227" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-display text-xl font-bold leading-none">{value}</div>
          <div className="text-[8px] uppercase tracking-wider text-muted-foreground">/ 100</div>
        </div>
      </div>
    </div>
  );
}
