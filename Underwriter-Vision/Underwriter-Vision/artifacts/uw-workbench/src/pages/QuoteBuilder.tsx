import { useEffect, useMemo, useRef, useState } from "react";
import { useRoute, Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Sparkles, Plus, X, ChevronRight, ShieldCheck, AlertTriangle, CheckCircle2, Send } from "lucide-react";
import { PageBody, SectionTitle, StatusPill } from "@/components/Primitives";
import { getProfile } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { newId, now, useCompanion, type CompanionMsg } from "@/components/companion/CompanionContext";
import { adviseFactorMove, adviseCommissionMove, adviseCompanionToggle } from "@/lib/underwriterBrain";

export function QuoteBuilder() {
  const [, params] = useRoute("/submission/:id/quote");
  const id = params?.id ?? "SUB-7829";
  const profile = getProfile(id);
  const routeKey = `quote:${id}`;
  const [coverages, setCoverages] = useState(profile.coverages);
  const [companions, setCompanions] = useState<string[]>([]);
  const [commission, setCommission] = useState(15);
  const [referOpen, setReferOpen] = useState(false);
  const [referredAt, setReferredAt] = useState<string | null>(null);

  const sub = coverages.reduce((s, c) => s + parseInt(c.premium.replace(/[^\d]/g, "")), 0);
  const companionsTotal = companions.length * 18000;
  const total = sub + companionsTotal;
  const totalWithComm = total * (1 + commission / 100);

  // ── Referral triggers (live) ─────────────────────────────────────────────
  const triggers = useMemo(() => {
    const out: { id: string; label: string; severity: "warn" | "block" }[] = [];
    const overFactor = coverages.find(c => c.factor > 1.20);
    if (overFactor) out.push({ id: "factor", label: `${overFactor.name} factor ${overFactor.factor.toFixed(2)}× exceeds 1.20× standard authority`, severity: overFactor.factor > 1.30 ? "block" : "warn" });
    if (totalWithComm > 750_000) out.push({ id: "premium", label: `Total premium $${Math.round(totalWithComm).toLocaleString()} exceeds $750K standard authority`, severity: "warn" });
    const cyber = coverages.find(c => c.name.toLowerCase().includes("cyber"));
    if (cyber && parseInt(cyber.limit.replace(/[^\d]/g, "")) > 1_000_000) out.push({ id: "cyber", label: `Cyber limit ${cyber.limit} exceeds $1M K-12 sublimit`, severity: "warn" });
    const lr = parseFloat(profile.lossRatio?.toString().replace(/[^\d.]/g, "") || "0");
    if (lr > 75) out.push({ id: "loss", label: `5-yr loss ratio ${profile.lossRatio} above 75%`, severity: "warn" });
    return out;
  }, [coverages, totalWithComm, profile.lossRatio]);

  function updateCoverage(idx: number, key: "limit" | "retention" | "factor", value: any) {
    setCoverages(cs => cs.map((c, i) => i === idx ? { ...c, [key]: value } : c));
  }

  // ── Proactive Companion nudges ────────────────────────────────────────────
  // The agent reasons like a senior UE underwriter — coverage-line aware,
  // account-grounded, with concrete dollar trade-offs and pull-able levers.
  const { pushMsg } = useCompanion();
  const expiringPremium = parseInt(profile.expiringPremium.replace(/[^\d]/g, "")) || total;
  const baseline = useRef({
    commission: 15,
    factors: profile.coverages.map(c => c.factor),
    companions: [] as string[],
  });
  const lastNudge = useRef<string>("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const b = baseline.current;

      // Find the factor that moved most (≥0.03×) since last baseline.
      let bestIdx = -1, bestDelta = 0;
      coverages.forEach((c, i) => {
        const d = Math.abs(c.factor - b.factors[i]);
        if (d >= 0.03 && d > bestDelta) { bestIdx = i; bestDelta = d; }
      });

      const commDelta = +(commission - b.commission).toFixed(1);

      // Companion toggles since baseline.
      const added   = companions.filter(c => !b.companions.includes(c));
      const removed = b.companions.filter(c => !companions.includes(c));

      let advice: ReturnType<typeof adviseFactorMove> | null = null;

      if (bestIdx >= 0) {
        const c = coverages[bestIdx];
        const linePremium = parseInt(c.premium.replace(/[^\d]/g, ""));
        advice = adviseFactorMove({
          profile,
          coverageName: c.name,
          oldFactor: b.factors[bestIdx],
          newFactor: c.factor,
          premium: linePremium,
          totalPremium: total,
          expiringPremium,
        });
      } else if (Math.abs(commDelta) >= 0.5) {
        advice = adviseCommissionMove({
          profile, oldComm: b.commission, newComm: commission, preCommissionTotal: total,
        });
      } else if (added.length || removed.length) {
        const code = added[0] ?? removed[0];
        advice = adviseCompanionToggle({
          profile, added: !!added.length, code, totalCompanionsNow: companions.length,
        });
      }

      if (!advice) return;
      if (advice.text === lastNudge.current) return;
      lastNudge.current = advice.text;

      const sevPrefix = advice.severity === 2 ? "⚠️ " : advice.severity === 1 ? "💡 " : "🪄 ";
      const msg: CompanionMsg = {
        id: newId(), role: "agent", kind: "text", ts: now(),
        text: `${sevPrefix}${advice.text}`,
        suggestions: advice.chips?.length
          ? advice.chips.map(ch => ({ id: ch.id, label: ch.label, tone: ch.tone ?? "blue" }))
          : undefined,
      };
      pushMsg(routeKey, msg);

      baseline.current = {
        commission,
        factors: coverages.map(c => c.factor),
        companions: [...companions],
      };
    }, 750);

    return () => { if (timer.current) clearTimeout(timer.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [commission, companions.join(","), coverages.map(c => c.factor).join(",")]);

  return (
    <PageBody className="!pt-6 !max-w-[1500px] mx-auto">
      <PageRegister
        routeKey={`quote:${id}`}
        title={`Quote · ${profile.institutionName}`}
        subtitle={`Indicated ${profile.quotedPremium}`}
        greeting="I'm watching the rater. Ask me to suggest a premium, justify each coverage, or jump to preview when you're ready."
        facts={() => [
          `Account: ${profile.institutionName} (${id}) · expiring premium ${profile.expiringPremium}`,
          `Loss ratio (5-yr): ${profile.lossRatio} · open claims: ${profile.claims.filter(c => c.status === "Open").length}`,
          `Coverages: ${coverages.map(c => `${c.name} ${c.limit} @ ${c.factor.toFixed(2)}× = $${parseInt(c.premium.replace(/[^\d]/g, "")).toLocaleString()}`).join("; ")}`,
          `Companions selected: ${companions.length ? companions.join(", ") : "none"} · commission ${commission}% · final premium $${Math.round(totalWithComm).toLocaleString()}`,
          `Referral triggers active: ${triggers.length ? triggers.map(t => t.label).join(" | ") : "none"}`,
          `Standard authority: factor ≤ 1.20×, total ≤ $750K, K-12 cyber ≤ $1M. Director of UW: Robert Chen.`,
          referredAt ? `This file was referred to senior UW at ${referredAt}.` : `This file has not been referred yet.`,
        ].join("\n")}
        suggestions={[
          { id: "split", label: "Show premium by coverage", tone: "blue", icon: "ChartPie" },
          { id: "suggest", label: "Suggest pricing levers", hint: "SIR, factor, commission", tone: "gold", icon: "Wand2" },
          ...(triggers.length && !referredAt ? [{ id: "refer", label: "Refer to Senior UW", hint: triggers[0].label, tone: "gold" as const, icon: "ShieldCheck" as const }] : []),
          { id: "preview", label: "Preview the quote letter", tone: "blue", icon: "FileText", navigateTo: `/submission/${id}/quote/preview` },
          { id: "back", label: "Back to submission", tone: "blue", icon: "Building2", navigateTo: `/submission/${id}` },
        ]}
        respond={(sid) => {
          if (sid === "split") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "donut", title: "Premium by coverage",
            segments: coverages.map((c, i) => ({ label: c.name, value: parseInt(c.premium.replace(/[^\d]/g, "")), color: ["#0123D4","#1E40AF","#C9A227","#7B6217","#10B981","#6366F1"][i % 6] })),
          } }];
          if (sid === "suggest") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Three levers I'd pull on Brookfield: (1) Raise GL SIR $50K → $75K — saves ~$8.4K. (2) Apply Property sprinkler credit (94% coverage qualifies for 5%) — saves ~$2.6K. (3) Move commission 15% → 13.5% if Marsh can absorb on a Tier-1 account — saves member ~$2.1K, broker still nets ${`$${Math.round(total * 0.135).toLocaleString()}`}. Want me to apply any of these?`,
            suggestions: [
              { id: "apply-sir",       label: "Apply SIR $50K → $75K",      tone: "blue" },
              { id: "apply-sprinkler", label: "Apply 5% sprinkler credit",   tone: "gold" },
            ],
          }];
          if (sid === "cap-factor") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Capping the highest-moved factor at the top of the UE band and rebalancing the gap into a higher SIR keeps the premium target. Net to member: roughly flat, but the file reads cleanly at audit.`,
            suggestions: [{ id: "draft-rationale", label: "Draft the file note", tone: "blue" }] }];
          if (sid === "draft-rationale") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Drafting: "Pricing decision — ${profile.institutionName} (${id}). Coverage band reviewed against UE manual rates and 5-year experience (LR ${profile.lossRatio}, ${profile.claims.filter(c => c.status === "Open").length} open claim(s)). Adjustment supported by ${profile.greenFlags?.[0]?.title ?? "documented controls"}. Reviewed by ${profile.underwriter.name}." Ready to attach to the file?`,
            suggestions: [{ id: "preview", label: "Open quote preview", tone: "violet" }] }];
          if (sid === "show-band") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "bars", title: "UE manual rate bands",
            unit: "×",
            series: coverages.map(c => ({ label: c.name, value: +(c.factor).toFixed(2), tone: c.factor > 1.15 ? "gold" : c.factor < 0.95 ? "blue" : "blue" })),
          } }];
          if (sid === "request-rm-signoff") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Sending Risk Management a sign-off request with the credit rationale and last 3 yr loss runs attached. Standard turnaround is 24 hr.`}];
          if (sid === "draft-broker-note") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `Drafting note to ${profile.brokerContact} at ${profile.brokerage}: "Per our pricing review on ${profile.institutionName}, commission landing at ${commission}% reflects this account's ${profile.lossRatio} loss ratio. Member premium ${`$${Math.round(totalWithComm).toLocaleString()}`}. Happy to walk through the build." Ready to send?` }];
          if (sid === "compare-broker-tier") return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
            kind: "bars", title: "Commission vs. broker tier (UE benchmark)", unit: "%",
            series: [
              { label: "Tier 1 (Marsh, Aon, WTW)", value: 13.5, tone: "blue" },
              { label: "Tier 2 (Gallagher, Hub)",  value: 14.5, tone: "blue" },
              { label: "Tier 3 (regional)",         value: 15.5, tone: "gold" },
              { label: "This quote",                value: commission, tone: commission >= 15 ? "gold" : "blue" },
            ],
          } }];
          if (sid === "apply-sir") {
            const gl = coverages.findIndex(c => c.name.toLowerCase().includes("general") || c.name.toLowerCase() === "gl");
            if (gl >= 0) {
              setCoverages(cs => cs.map((c, i) => i === gl ? { ...c, retention: "$75,000", factor: +(c.factor * 0.94).toFixed(2) } : c));
            }
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Applied: GL SIR raised to $75K, factor eased ~6% to reflect the higher retention. New premium reflected in the rail.` }];
          }
          if (sid === "refer") {
            setReferOpen(true);
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Opening the referral panel. I've pre-filled the rationale based on the active triggers — review, edit, and send to Robert Chen (Director of UW). Standard turnaround is 24h.`,
            }];
          }
          if (sid === "apply-sprinkler") {
            const pi = coverages.findIndex(c => c.name.toLowerCase().includes("property") || c.name.toLowerCase().includes("building"));
            if (pi >= 0) {
              setCoverages(cs => cs.map((c, i) => i === pi ? { ...c, factor: +(c.factor * 0.95).toFixed(2) } : c));
            }
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Applied: 5% sprinkler credit on Property (94% sprinklered, masonry construction). Factor reduced. I logged the credit basis to the audit trail.` }];
          }
          return;
        }}
      />
      <SectionTitle
        eyebrow={`${id} · Quote Builder`}
        title={`Build quote — ${profile.institutionName}`}
        sub="Tune limits, retentions, and factors. The Companion auto-recalculates premium and surfaces companion products in real-time."
        action={
          <Link href={`/submission/${id}/quote/preview`} className="h-11 px-5 rounded-full bg-gradient-to-r from-primary to-accent text-white font-bold text-sm shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow flex items-center gap-2">
            Preview & Send <ArrowRight className="size-4" />
          </Link>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        <section className="rounded-2xl border bg-card overflow-hidden">
          <header className="px-5 py-4 border-b">
            <h3 className="font-display font-bold">Coverage lines</h3>
          </header>
          <div className="divide-y">
            {coverages.map((c, idx) => {
              const premium = parseInt(c.premium.replace(/[^\d]/g, ""));
              return (
                <div key={c.name} className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">Aggregate {c.aggregateLimit}</div>
                    </div>
                    <div className="font-display text-2xl font-bold text-primary font-mono-tabular">
                      ${premium.toLocaleString()}
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Limit"><input value={c.limit} onChange={e => updateCoverage(idx, "limit", e.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none" /></Field>
                    <Field label="Retention"><input value={c.retention} onChange={e => updateCoverage(idx, "retention", e.target.value)} className="w-full bg-transparent text-sm font-semibold outline-none" /></Field>
                    <Field label="Factor">
                      <input type="range" min="0.8" max="1.4" step="0.01" value={c.factor}
                        onChange={e => updateCoverage(idx, "factor", parseFloat(e.target.value))}
                        className="w-full accent-primary" />
                      <div className="text-xs text-right font-mono-tabular font-semibold">{c.factor.toFixed(2)}×</div>
                    </Field>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Companions */}
          <div className="border-t bg-gradient-to-b from-accent/5 to-transparent p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="size-4 text-accent" />
              <h4 className="font-display font-bold">Companion products</h4>
              <span className="text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/15 rounded-full px-2 py-0.5">Suggested by Companion</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {profile.companions.map(c => {
                const added = companions.includes(c.code);
                return (
                  <button
                    key={c.code}
                    onClick={() => setCompanions(curr => added ? curr.filter(x => x !== c.code) : [...curr, c.code])}
                    className={cn(
                      "rounded-xl border p-4 text-left transition-all",
                      added ? "border-primary bg-primary/5 ring-2 ring-primary/30" : "hover:border-primary/40 bg-card"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-tabular text-xs font-bold text-accent bg-accent/15 rounded px-2 py-0.5">{c.code}</span>
                        <span className="font-semibold text-sm">{c.name}</span>
                      </div>
                      {added ? <X className="size-4 text-primary" /> : <Plus className="size-4 text-muted-foreground" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">{c.teaser}</p>
                    <div className="mt-2 text-xs font-semibold text-primary">$18,000 / yr</div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* Summary rail */}
        <aside className="space-y-4">
          <div className="rounded-2xl border bg-card overflow-hidden sticky top-24">
            <div className="hero-mesh px-5 py-5 text-white">
              <div className="text-[11px] uppercase tracking-wider text-white/60 font-semibold">Total quoted premium</div>
              <div className="font-display text-4xl font-bold mt-1">${Math.round(totalWithComm).toLocaleString()}</div>
              <div className="text-xs text-white/70 mt-1">Inclusive of {commission}% broker commission</div>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <Row label="Subtotal coverages" value={`$${sub.toLocaleString()}`} />
              {companionsTotal > 0 && <Row label={`Companions (${companions.length})`} value={`$${companionsTotal.toLocaleString()}`} />}
              <Row label="Pre-commission total" value={`$${total.toLocaleString()}`} bold />

              <div className="pt-2 border-t">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-muted-foreground">Broker commission</span>
                  <span className="font-mono-tabular font-bold">{commission}%</span>
                </div>
                <input type="range" min="10" max="20" step="0.5" value={commission}
                  onChange={e => setCommission(parseFloat(e.target.value))}
                  className="w-full accent-primary" />
              </div>

              <div className="pt-2 border-t flex justify-between">
                <span className="font-semibold">Final premium</span>
                <span className="font-display font-bold text-primary text-lg">${Math.round(totalWithComm).toLocaleString()}</span>
              </div>

              <div className="pt-3 space-y-2">
                {triggers.length > 0 && !referredAt && (
                  <div className="rounded-xl border border-accent/40 bg-gradient-to-br from-accent/10 to-transparent p-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <AlertTriangle className="size-3.5 text-accent" />
                      <span className="text-[11px] font-bold uppercase tracking-wider text-accent">
                        {triggers.length} referral trigger{triggers.length === 1 ? "" : "s"}
                      </span>
                    </div>
                    <ul className="text-[11px] text-foreground/80 space-y-0.5 leading-relaxed">
                      {triggers.slice(0, 2).map(t => <li key={t.id}>· {t.label}</li>)}
                      {triggers.length > 2 && <li className="text-muted-foreground">+{triggers.length - 2} more</li>}
                    </ul>
                  </div>
                )}

                {referredAt ? (
                  <div className="h-11 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold grid place-items-center px-3">
                    <span className="inline-flex items-center gap-1.5"><CheckCircle2 className="size-3.5" /> Referred to Robert Chen · {referredAt}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setReferOpen(true)}
                    className={cn(
                      "w-full h-11 rounded-full text-sm font-semibold inline-flex items-center justify-center gap-2 transition-all",
                      triggers.length > 0
                        ? "bg-gradient-to-r from-accent to-[#7B6217] text-white shadow-lg shadow-accent/30 hover:shadow-accent/50"
                        : "border bg-card hover:bg-muted text-foreground/80",
                    )}
                  >
                    <ShieldCheck className="size-4" />
                    {triggers.length > 0 ? "Refer to Senior UW" : "Refer to Senior UW (optional)"}
                  </button>
                )}

                <Link href={`/submission/${id}/quote/preview`} className="block h-11 rounded-full bg-primary text-white font-semibold text-sm grid place-items-center shadow-lg shadow-primary/30">
                  Preview Quote
                </Link>
                <button className="w-full h-10 rounded-full border text-sm font-semibold hover:bg-muted">Save as draft</button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {referOpen && (
          <ReferralGlass
            account={profile.institutionName}
            subId={id}
            triggers={triggers}
            premium={Math.round(totalWithComm)}
            onClose={() => setReferOpen(false)}
            onSend={() => {
              const stamp = new Date().toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
              setReferredAt(stamp);
              setReferOpen(false);
              pushMsg(routeKey, {
                id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Sent to Robert Chen (Director of UW) at ${stamp} with rationale + active triggers attached. I'll ping you the moment he responds — no need to babysit it.`,
                suggestions: [
                  { id: "preview", label: "Preview quote letter", tone: "blue" },
                  { id: "draft-broker-note", label: "Draft holding note to broker", tone: "gold" },
                ],
              });
            }}
          />
        )}
      </AnimatePresence>
    </PageBody>
  );
}

function ReferralGlass({
  account, subId, triggers, premium, onClose, onSend,
}: {
  account: string; subId: string; premium: number;
  triggers: { id: string; label: string; severity: "warn" | "block" }[];
  onClose: () => void; onSend: () => void;
}) {
  const defaultRationale = triggers.length
    ? `Referring ${account} (${subId}). Triggers: ${triggers.map(t => t.label).join("; ")}. Quoted premium $${premium.toLocaleString()}. Requesting senior sign-off and authority extension.`
    : `Referring ${account} (${subId}) for senior review. Quoted premium $${premium.toLocaleString()}.`;
  const [rationale, setRationale] = useState(defaultRationale);
  const [sending, setSending] = useState(false);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] grid place-items-center px-4 bg-[#0B1A6E]/55 backdrop-blur-md"
      role="dialog" aria-modal="true" aria-label="Refer to Senior Underwriter"
      onClick={onClose}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div className="absolute -top-24 -left-16 size-[420px] rounded-full bg-primary/35 blur-[110px]"
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div className="absolute -bottom-24 -right-10 size-[460px] rounded-full bg-accent/30 blur-[120px]"
          animate={{ x: [0, -24, 16, 0], y: [0, -14, 18, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.2 }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        onClick={e => e.stopPropagation()}
        className="relative w-full max-w-[760px] rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#0B1230]/92 via-[#10204e]/88 to-[#0B1230]/92 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl"
      >
        <div className="absolute inset-0 hero-mesh opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/60 to-transparent" />

        <div className="relative p-7 md:p-8">
          <div className="flex items-start gap-4">
            <div className="size-12 rounded-2xl bg-white/10 backdrop-blur grid place-items-center ring-1 ring-white/30 shrink-0">
              <ShieldCheck className="size-6 text-accent" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-display text-xl md:text-2xl font-bold">Refer to Senior Underwriter</div>
              <p className="text-white/70 text-sm mt-1">Routing {account} ({subId}) to Robert Chen, Director of UW.</p>
            </div>
            <button onClick={onClose} className="size-9 rounded-full bg-white/10 hover:bg-white/20 grid place-items-center" aria-label="Close">
              <X className="size-4" />
            </button>
          </div>

          {triggers.length > 0 && (
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
              {triggers.map(t => (
                <div key={t.id} className="flex items-start gap-2 rounded-xl bg-white/85 text-foreground border border-white/40 px-3 py-2 text-[12px]">
                  <span className={cn("size-5 rounded-full grid place-items-center shrink-0 mt-0.5",
                    t.severity === "block" ? "bg-red-500/20 text-red-700" : "bg-accent/25 text-[#7B6217]")}>
                    <AlertTriangle className="size-3" />
                  </span>
                  <span className="font-semibold leading-snug">{t.label}</span>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <label className="text-[11px] font-bold uppercase tracking-wider text-white/60">Rationale (Robert will see this)</label>
            <textarea
              value={rationale}
              onChange={e => setRationale(e.target.value)}
              rows={5}
              className="mt-1.5 w-full rounded-2xl bg-white/95 text-foreground p-4 text-sm leading-relaxed outline-none focus:ring-4 focus:ring-accent/30 border border-white/40"
            />
          </div>

          <div className="mt-5 flex items-center gap-2 justify-end">
            <button onClick={onClose} className="h-10 px-4 rounded-full text-sm font-semibold bg-white/10 hover:bg-white/20">Cancel</button>
            <button
              disabled={sending || !rationale.trim()}
              onClick={() => { setSending(true); setTimeout(onSend, 700); }}
              className="h-10 px-5 rounded-full text-sm font-bold inline-flex items-center gap-2 bg-gradient-to-r from-accent to-[#7B6217] text-white shadow-lg shadow-accent/40 disabled:opacity-60"
            >
              {sending ? <><span className="size-2 rounded-full bg-white animate-pulse" /> Sending…</> : <><Send className="size-4" /> Send referral</>}
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, children }: any) {
  return (
    <div className="rounded-lg border bg-muted/30 px-3 py-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-0.5">{label}</div>
      {children}
    </div>
  );
}
function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={cn("flex justify-between", bold && "font-bold")}>
      <span className={bold ? "" : "text-muted-foreground"}>{label}</span>
      <span className="font-mono-tabular">{value}</span>
    </div>
  );
}
