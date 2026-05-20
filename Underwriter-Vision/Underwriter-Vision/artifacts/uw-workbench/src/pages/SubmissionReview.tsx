import { useRoute, Link } from "wouter";
import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, AlertTriangle, Sparkles, FileSearch, Activity, Shield, ArrowRight } from "lucide-react";
import { PageBody, SectionTitle, StatusPill } from "@/components/Primitives";
import { getProfile } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";

const REVIEWS = [
  { id: "nbi", label: "New Business Intake (NBI)", icon: FileSearch, summary: "Application packet verified", findings: 4 },
  { id: "fdm", label: "Fact & Data Match (FDM)", icon: Sparkles, summary: "All key data points cross-referenced", findings: 3 },
  { id: "loss", label: "Loss Run Review", icon: Activity, summary: "5-year claims pattern analyzed", findings: 2 },
  { id: "ext", label: "External Check", icon: Shield, summary: "Sanctions, litigation, news scanned", findings: 1 },
] as const;

export function SubmissionReview() {
  const [, params] = useRoute("/submission/:id/review");
  const id = params?.id ?? "SUB-7829";
  const profile = getProfile(id);
  const [step, setStep] = useState(0);
  const r = REVIEWS[step];

  return (
    <PageBody className="!pt-6 !max-w-[1400px] mx-auto">
      <PageRegister
        routeKey={`review:${id}`}
        title={`Review · ${profile.institutionName}`}
        subtitle={`Step ${step + 1} of ${REVIEWS.length}`}
        greeting="Walk me through it. I've pre-run NBI, FDM, loss and external checks — I'll surface the findings as you advance."
        suggestions={[
          { id: "next", label: "Advance to next step", tone: "blue", icon: "ArrowRight" },
          { id: "build", label: "Build the quote", tone: "gold", icon: "Wand2", navigateTo: `/submission/${id}/quote` },
          { id: "back-sub", label: "Back to submission", tone: "violet", icon: "Building2", navigateTo: `/submission/${id}` },
        ]}
        respond={(sid) => { if (sid === "next") setStep(s => Math.min(s + 1, REVIEWS.length - 1)); }}
      />
      <SectionTitle
        eyebrow={`${profile.id} · Review Workflow`}
        title="Guided Review"
        sub={`Step ${step + 1} of ${REVIEWS.length} — Companion has prepared a deterministic review for ${profile.institutionName}.`}
        action={
          <Link href={`/submission/${id}`} className="text-xs text-primary font-semibold hover:underline">← Back to submission</Link>
        }
      />

      {/* Stepper */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {REVIEWS.map((rv, i) => {
          const Icon = rv.icon;
          const done = i < step;
          const active = i === step;
          return (
            <button key={rv.id} onClick={() => setStep(i)} className={cn(
              "rounded-xl border p-4 text-left transition-all",
              active && "ring-2 ring-primary border-primary/50 bg-primary/5",
              done && "bg-emerald-50/40 border-emerald-200",
              !done && !active && "bg-card hover:bg-muted/40"
            )}>
              <div className="flex items-start justify-between gap-2">
                <div className={cn(
                  "size-9 rounded-xl grid place-items-center",
                  done ? "bg-emerald-500 text-white" : active ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                )}>
                  {done ? <CheckCircle2 className="size-4" /> : <Icon className="size-4" />}
                </div>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Step {i + 1}</span>
              </div>
              <div className="mt-3 font-semibold text-sm">{rv.label}</div>
              <div className="text-[11px] text-muted-foreground mt-1">{rv.findings} findings</div>
            </button>
          );
        })}
      </div>

      {/* Active review */}
      <motion.div
        key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border bg-card overflow-hidden"
      >
        <div className="px-6 py-5 border-b bg-gradient-to-r from-primary/8 to-accent/8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="size-12 rounded-xl bg-white grid place-items-center shadow-sm">
              <r.icon className="size-5 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{r.label}</h2>
              <p className="text-sm text-muted-foreground">{r.summary}</p>
            </div>
          </div>
          <StatusPill tone="green">Companion-Verified</StatusPill>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-x divide-border">
          <div className="p-6">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="size-4 text-emerald-600" /> What's good
            </h3>
            <ul className="space-y-3">
              {profile.greenFlags.slice(0, 3).map((f, i) => (
                <li key={i} className="rounded-xl border bg-emerald-50/30 border-emerald-200/60 p-3">
                  <div className="font-semibold text-sm">{f.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{f.source}</div>
                </li>
              ))}
            </ul>
          </div>

          <div className="p-6">
            <h3 className="font-display font-bold mb-4 flex items-center gap-2">
              <AlertTriangle className="size-4 text-rose-600" /> What needs attention
            </h3>
            <ul className="space-y-3">
              {profile.redFlags.map((f, i) => (
                <li key={i} className="rounded-xl border bg-rose-50/30 border-rose-200/60 p-3">
                  <div className="font-semibold text-sm">{f.gap}</div>
                  <div className="text-xs text-muted-foreground mt-1">→ {f.action}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <StatusPill tone="red" size="sm">Owner · {f.owner}</StatusPill>
                    <button className="text-xs font-semibold text-primary hover:underline">Take action →</button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="px-6 py-4 border-t bg-muted/20 flex items-center justify-between">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="h-10 px-4 rounded-full text-sm font-semibold disabled:opacity-30 hover:bg-muted flex items-center gap-1.5"
          >
            <ChevronLeft className="size-4" /> Previous
          </button>

          <div className="text-xs text-muted-foreground">
            {step + 1} / {REVIEWS.length}
          </div>

          {step < REVIEWS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              className="h-10 px-5 rounded-full bg-primary text-primary-foreground text-sm font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-shadow flex items-center gap-1.5"
            >
              Next review <ChevronRight className="size-4" />
            </button>
          ) : (
            <Link href={`/submission/${id}/quote`} className="h-10 px-5 rounded-full bg-gradient-to-r from-primary to-accent text-white text-sm font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow flex items-center gap-1.5">
              Build Quote <ArrowRight className="size-4" />
            </Link>
          )}
        </div>
      </motion.div>
    </PageBody>
  );
}
