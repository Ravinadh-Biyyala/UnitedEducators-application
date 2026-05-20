import { useState, useMemo } from "react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import {
  Building2, Calendar, MapPin, Phone, Mail, FileText, Activity, Shield, AlertTriangle,
  CheckCircle2, Clock, Sparkles, ChevronRight, ArrowRight, Download, Eye, Plus,
  Layers, Compass, ListChecks, GraduationCap, BookOpen, ScrollText, Users, MessageSquare,
  History, Bot, Star, Briefcase, Wand2, Send, Paperclip,
  Droplets, Footprints, Flame, HeartPulse, Wrench, MapPinned, TrendingDown, TrendingUp, Minus,
} from "lucide-react";
import { PageBody, SectionTitle, StatusPill, statusTone, StageRail } from "@/components/Primitives";
import { getProfile, tierFromType, tierLabel, UE_FORMS, type SubmissionProfile } from "@/lib/mockData";
import {
  DOC_MATRIX, DOC_STAGES, STATUS_META, CATEGORIES, CATEGORY_META,
  currentDocStage, lifecycleSummary,
  type DocCategory, type DocStage,
} from "@/lib/docMatrix";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { newId, now } from "@/components/companion/CompanionContext";

const SECTIONS = [
  { id: "overview", label: "Overview", icon: Compass },
  { id: "member", label: "Member & Broker", icon: Building2 },
  { id: "risk", label: "Risk & Exposure", icon: Shield },
  { id: "loss", label: "Loss History", icon: Activity },
  { id: "documents", label: "Documents", icon: FileText },
  { id: "rating", label: "Coverage & Rating", icon: ScrollText },
  { id: "correspondence", label: "Correspondence", icon: MessageSquare },
  { id: "notes", label: "Notes", icon: BookOpen },
  { id: "approvals", label: "Approvals", icon: Star },
  { id: "audit", label: "Audit Trail", icon: History },
] as const;

export function SubmissionDetail() {
  const [, params] = useRoute("/submission/:id");
  const id = params?.id ?? "SUB-7829";
  const profile = useMemo(() => getProfile(id), [id]);
  const [section, setSection] = useState<typeof SECTIONS[number]["id"]>("overview");
  const tier = useMemo(() => tierFromType(profile.memberType), [profile.memberType]);
  const requiredForms = useMemo(() => UE_FORMS[tier].filter(f => f.required), [tier]);
  const onFile = new Set(profile.documents.filter(d => d.status === "Verified" || d.status === "Pending").map(d => d.name.toLowerCase()));
  const missingForms = requiredForms.filter(f => !Array.from(onFile).some(n => n.includes(f.code.toLowerCase()) || n.includes(f.name.split(" ")[0].toLowerCase())));

  return (
    <PageBody className="!pt-0 !max-w-[1500px] mx-auto">
      <PageRegister
        routeKey={`submission:${id}`}
        title={profile.institutionName}
        subtitle={`${profile.id} · ${tierLabel(tier)}`}
        greeting={`I have the full file open for ${profile.institutionName}. Ask me to summarize, build the quote, or jump to documents — I'll keep my work to actions on this account.`}
        suggestions={[
          { id: "summary", label: "Summarize this account", hint: "60-second briefing", tone: "blue", icon: "Sparkles" },
          { id: "missing", label: "What's missing?", hint: `${missingForms.length} required UE form(s)`, tone: "red", icon: "AlertTriangle" },
          { id: "docs-here", label: "Docs expected at this stage", hint: `${lifecycleSummary(currentDocStage(profile.stage)).total} per UE matrix`, tone: "blue", icon: "Layers" },
          { id: "risk", label: "Show risk profile", hint: "Bars + scores", tone: "gold", icon: "Shield" },
          { id: "loss-trend", label: "Loss trend (5 yrs)", hint: "Annual incurred", tone: "violet", icon: "Activity" },
          { id: "build-quote", label: "Build the quote", hint: "Open the rater", tone: "blue", icon: "Wand2", navigateTo: `/submission/${id}/quote` },
          { id: "open-inbox", label: "Open inbox for this account", tone: "blue", icon: "InboxIcon", navigateTo: "/inbox" },
        ]}
        respond={(sid) => {
          if (sid === "summary") return [{ id: newId(), role: "agent", kind: "text", ts: now(),
            text: `${profile.institutionName} (${tierLabel(tier)}) · ${profile.enrollment} · expiring ${profile.expiringPremium} → indicated ${profile.quotedPremium}. Loss ratio ${profile.lossRatio}, appetite ${profile.appetiteScore}/100. Two open items: SIR actuarial opinion and Sexual Misconduct supplemental.` }];
          if (sid === "missing") return [{ id: newId(), role: "agent", kind: "viz", ts: now(),
            viz: { kind: "checklist", title: `Required UE forms · ${tierLabel(tier)}`,
              items: requiredForms.map(f => ({ ok: !missingForms.includes(f), label: f.name, sub: `${f.code} · ${f.productHint}` })),
            } }];
          if (sid === "risk") return [{ id: newId(), role: "agent", kind: "viz", ts: now(),
            viz: { kind: "bars", title: "Risk dimensions", series: profile.riskBars.map(b => ({
              label: b.label, value: b.score, tone: b.tone === "good" ? "green" : b.tone === "warning" ? "gold" : "red",
            })) } }];
          if (sid === "loss-trend") {
            const data = profile.yearSummary.map(y => ({
              label: String(y.year),
              value: parseInt(y.incurred.replace(/[^0-9]/g, ""), 10) * 1000,
            }));
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(),
              viz: {
                kind: "linecard",
                title: "Incurred loss · 5-year history",
                intro: `Latest year incurred ${profile.yearSummary[profile.yearSummary.length - 1]!.incurred} — see the full loss-cost picture before pricing.`,
                data, yFormat: "currency",
                cta: "add-to-dashboard", dashboardHref: "/",
              } }];
          }
          if (sid === "docs-here") {
            const here = currentDocStage(profile.stage);
            const sum = lifecycleSummary(here);
            const docsHere = DOC_MATRIX.filter(d => d.flow[here]);
            const primary = docsHere.filter(d => d.flow[here] === "P").map(d => d.name);
            const created = docsHere.filter(d => d.flow[here] === "C").map(d => d.name);
            const reviewed = docsHere.filter(d => d.flow[here] === "R").map(d => d.name);
            const updated  = docsHere.filter(d => d.flow[here] === "U").map(d => d.name);
            const lines = [
              primary.length  ? `📥 Primary intake (${primary.length}): ${primary.slice(0, 3).join("; ")}${primary.length > 3 ? "…" : ""}` : "",
              created.length  ? `🛠️ Created here (${created.length}): ${created.slice(0, 3).join("; ")}${created.length > 3 ? "…" : ""}` : "",
              reviewed.length ? `🔎 Reviewed (${reviewed.length}): ${reviewed.slice(0, 3).join("; ")}${reviewed.length > 3 ? "…" : ""}` : "",
              updated.length  ? `🔁 Updated (${updated.length}): ${updated.slice(0, 3).join("; ")}${updated.length > 3 ? "…" : ""}` : "",
            ].filter(Boolean).join("\n");
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Per UE's Document Review Matrix, ${profile.institutionName} is at "${here}" — ${sum.total} documents are active.\n\n${lines}\n\nAsk me to "open the Documents tab" or "show what's missing" to take action.` }];
          }
          return;
        }}
        freeText={(text) => {
          const lower = text.toLowerCase();
          // Detect "deal with"/"help me with"/"how to address" + red flag reference
          const askVerb = /(how (do|to|should) i|how (do|to) (we|you)|help me (with|on|deal)|deal with|address|walk me through|what (do|to|should) (i )?do|what'?s the (next|play|move)|next steps?|to do (with|about)|fix|resolve|close|handle|tackle|approach|take care of)/i.test(lower);
          if (!askVerb) return;
          const flags = profile.redFlags ?? [];
          if (!flags.length) return;

          // Ordinal: "1st red flag", "first one", "the first", "second flag"
          const ordMap: Record<string, number> = {
            first: 0, "1st": 0, one: 0,
            second: 1, "2nd": 1, two: 1,
            third: 2, "3rd": 2, three: 2,
            fourth: 3, "4th": 3, four: 3,
          };
          let idx = -1;
          for (const k of Object.keys(ordMap)) {
            if (new RegExp(`\\b${k}\\b`).test(lower)) { idx = ordMap[k]!; break; }
          }
          // If ordinal didn't fire, try keyword match against red-flag titles/gaps
          if (idx < 0) {
            idx = flags.findIndex(f => {
              const hay = `${f.title} ${f.gap}`.toLowerCase();
              const words = lower.split(/\s+/).filter(w => w.length > 4);
              return words.filter(w => hay.includes(w)).length >= 2;
            });
          }
          // Generic "the red flag" with only one in play
          if (idx < 0 && /\bred\s*flag\b|missing|gap|issue/.test(lower) && flags.length === 1) idx = 0;
          if (idx < 0 || idx >= flags.length) return;

          const flag = flags[idx]!;
          // Specialist routing by owner
          const ownerSpec: Record<string, { name: string; role: string; tone: "blue" | "gold" | "violet" | "emerald" }> = {
            "Broker/User":        { name: "Devon Carter", role: "Broker Outreach Specialist",   tone: "blue" },
            "System Automation":  { name: "Priya Shah",   role: "Compliance & Forms Specialist", tone: "gold" },
            "Underwriter":        { name: "John Michaels", role: "Risk Review Specialist",       tone: "violet" },
          };
          const spec = ownerSpec[flag.owner] ?? ownerSpec["Broker/User"]!;

          // Build playbook tailored to the flag
          const isBrokerAsk = flag.owner === "Broker/User";
          const isSystem = flag.owner === "System Automation";
          const steps: { label: string; detail?: string }[] = isBrokerAsk
            ? [
                { label: `Confirm what UE needs to close this gap`, detail: flag.gap },
                { label: `Pull the broker contact on file`, detail: `${profile.brokerage} · ${profile.brokerContact}` },
                { label: `Draft outreach to broker`, detail: `Pre-filled below — review and send.` },
                { label: `Set 3-day follow-up reminder`, detail: `Auto-creates a Task if no reply.` },
                { label: `Mark resolved on receipt + re-run pricing`, detail: `Unblocks the indicative quote path.` },
              ]
            : isSystem
            ? [
                { label: `Trigger the automated request`, detail: flag.action },
                { label: `Confirm UE template language and SLA`, detail: `Standard 5-day broker SLA applies.` },
                { label: `Watch for receipt in Documents`, detail: `Auto-classifies on intake.` },
                { label: `Mark verified once on file`, detail: `Updates submission status.` },
              ]
            : [
                { label: `Open the underlying source`, detail: flag.source },
                { label: `Compare against UE thresholds`, detail: flag.gap },
                { label: `Document a one-line conclusion + decision`, detail: `Adds to submission notes.` },
                { label: `Route to senior UW if a referral trigger fires`, detail: `Pings Robert Chen with rationale.` },
              ];

          const draft = isBrokerAsk
            ? {
                kind: "email" as const,
                to: profile.brokerContact || "broker@partner.com",
                subject: `${profile.id} — ${flag.gap}`,
                body: `Hi,\n\nFor ${profile.institutionName} (${profile.id}) we have one outstanding item before I can finalize terms:\n\n• ${flag.gap}\n\nThis is the only blocker on our end — once received we can re-confirm pricing and turn the indication into a firm quote.\n\nIf you can get this back within 3 business days I can hold the current timeline.\n\nThanks,\nMaya Khanna · United Educators`,
              }
            : isSystem
            ? {
                kind: "note" as const,
                subject: `Auto-trigger: ${flag.action}`,
                body: `${flag.action}.\n\nGap: ${flag.gap}\nSource: ${flag.source}\n\nUE-standard request will be issued automatically and tracked in the submission.`,
              }
            : undefined;

          return [{
            id: newId(), role: "agent", kind: "viz", ts: now(),
            viz: {
              kind: "playbook",
              title: `${flag.title}`,
              specialist: spec,
              intro: `Here's a clean play to close this red flag for ${profile.institutionName}. Owner: ${flag.owner}.`,
              steps,
              draft,
              primaryCta: isBrokerAsk
                ? { label: "Send draft to broker", action: "send-draft" as const }
                : isSystem
                ? { label: "Trigger UE request", action: "send-draft" as const }
                : { label: "Open the source doc", action: "navigate" as const, href: `/submission/${profile.id}` },
              contextRef: { label: profile.id, href: `/submission/${profile.id}` },
            },
          }];
        }}
      />
      {/* Header banner */}
      <div className="hero-mesh -mx-6 md:-mx-10 px-6 md:px-10 pt-6 pb-8 mb-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 dot-grid opacity-10" />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] text-white/60 uppercase tracking-wider mb-3">
            <Link href="/submissions" className="hover:text-white">Submissions</Link>
            <ChevronRight className="size-3" />
            <span>{profile.id}</span>
          </div>

          <div className="flex flex-wrap items-start justify-between gap-6">
            <div className="flex items-start gap-5 min-w-0">
              <div className="size-16 rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20 grid place-items-center shrink-0">
                <Building2 className="size-7 text-accent" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="font-display text-3xl md:text-[36px] font-bold tracking-tight">{profile.institutionName}</h1>
                  <StatusPill tone="gold">Member · {profile.memberNumber}</StatusPill>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-white/85">
                  <Meta icon={GraduationCap}>{profile.memberType} · {profile.enrollment}</Meta>
                  <Meta icon={MapPin}>{profile.location}</Meta>
                  <Meta icon={Briefcase}>{profile.brokerage} · {profile.brokerContact}</Meta>
                  <Meta icon={Calendar}>Eff. {profile.effectiveDate} → {profile.expiryDate}</Meta>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href={`/submission/${id}/review`} className="h-10 px-4 rounded-full bg-white/10 backdrop-blur border border-white/30 text-white text-sm font-semibold hover:bg-white/15 flex items-center gap-2">
                <Wand2 className="size-4 text-accent" /> Run Review
              </Link>
              <Link href={`/submission/${id}/quote`} className="h-10 px-4 rounded-full bg-accent text-[#0B1230] text-sm font-bold shadow-lg shadow-accent/30 hover:scale-[1.02] transition-transform flex items-center gap-2">
                Build Quote <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Stage rail */}
          <div className="mt-7 max-w-3xl">
            <StageRail current={stageGroupOf(profile.stage)} />
          </div>

          {/* Header KPI strip */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-3 max-w-5xl">
            <HeaderKPI label="Expiring premium" value={profile.expiringPremium} sub={profile.expiringNote} />
            <HeaderKPI label="Quoted (indicated)" value={profile.quotedPremium} sub={profile.quotedNote} highlight />
            <HeaderKPI label="Loss ratio" value={profile.lossRatio} sub={profile.lossRatioNote} />
            <HeaderKPI label="Appetite score" value={`${profile.appetiteScore}/100`} sub="Strong fit" />
            <HeaderKPI label="Need-by" value={profile.needByDate} sub={profile.needByUrgency} />
          </div>
        </div>
      </div>

      {/* Section nav */}
      <div className="sticky top-16 z-20 -mx-6 md:-mx-10 px-6 md:px-10 bg-background/85 backdrop-blur border-b mb-6">
        <div className="flex items-center gap-1 overflow-x-auto scroll-hidden py-2">
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = section === s.id;
            return (
              <button
                key={s.id} onClick={() => setSection(s.id)}
                className={cn(
                  "shrink-0 inline-flex items-center gap-2 h-9 px-3.5 rounded-full text-sm font-medium transition-all",
                  active ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <Icon className="size-3.5" />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section body */}
      <motion.div key={section} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        {section === "overview" && <OverviewSection p={profile} />}
        {section === "member" && <MemberSection p={profile} />}
        {section === "risk" && <RiskSection p={profile} />}
        {section === "loss" && <LossSection p={profile} />}
        {section === "documents" && <DocumentsSection p={profile} tier={tier} />}
        {section === "rating" && <RatingSection p={profile} />}
        {section === "correspondence" && <CorrespondenceSection p={profile} />}
        {section === "notes" && <NotesSection p={profile} />}
        {section === "approvals" && <ApprovalsSection p={profile} />}
        {section === "audit" && <AuditSection p={profile} />}
      </motion.div>
    </PageBody>
  );
}

function HeaderKPI({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={cn(
      "relative rounded-lg px-3 py-2.5 border text-white",
      highlight ? "border-accent/40 bg-white/[0.04]" : "border-white/10 bg-white/[0.03]"
    )}>
      {highlight && <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r bg-accent" />}
      <div className="text-[9.5px] uppercase tracking-[0.14em] font-bold text-white/55">{label}</div>
      <div className="font-display text-[19px] font-bold mt-1 leading-none font-mono-tabular">{value}</div>
      <div className="text-[10px] mt-1 text-white/55">{sub}</div>
    </div>
  );
}

function Meta({ icon: Icon, children }: any) {
  return <span className="inline-flex items-center gap-1.5"><Icon className="size-3.5 opacity-60" />{children}</span>;
}

function Card({ title, action, children, className }: { title: string; action?: any; children: any; className?: string }) {
  return (
    <section className={cn("rounded-2xl border bg-card", className)}>
      <header className="px-5 py-4 border-b flex items-center justify-between">
        <h3 className="font-display font-bold">{title}</h3>
        {action}
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function FieldRow({ label, value, tone }: { label: string; value: string; tone?: "good" | "warning" | "bad" }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border/60 last:border-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={cn("text-sm font-semibold text-right max-w-[60%]",
        tone === "good" && "text-emerald-700",
        tone === "warning" && "text-amber-700",
        tone === "bad" && "text-rose-700",
      )}>{value}</span>
    </div>
  );
}

// ── OVERVIEW ───────────────────────────────────────────────────────────────
function OverviewSection({ p }: { p: SubmissionProfile }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* AI Summary */}
      <div className="lg:col-span-2 space-y-6">
        <Card title="Companion summary" action={
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-accent bg-accent/15 rounded-full px-2 py-1">
            <Sparkles className="size-3" /> AI
          </span>
        }>
          <p className="text-sm text-foreground/85 leading-relaxed">
            <strong>{p.institutionName}</strong> ({p.memberType}, {p.enrollment}) is in <strong>strong appetite</strong> for the {p.member.educationSegment} segment. Quoted premium of <strong>{p.quotedPremium}</strong> reflects a +7.8% indicated rate change driven by 2 primary CGL piercing events in the prior 5 years. Member has been with UE since {p.memberSince}; broker {p.brokerage} ({p.brokerContact}) is a Tier-1 partner. Recommended next steps: obtain SIR Actuarial Opinion, send Sexual Misconduct addendum to broker, and surface BLX companion at quote.
          </p>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <ScoreCard label="Appetite" score={p.appetiteScore} />
            <ScoreCard label="Claims health" score={p.claimsScore} />
            <ScoreCard label="Peer benchmark" score={p.benchmarkScore} />
          </div>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card title="Green flags">
            <ul className="space-y-3">
              {p.greenFlags.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.source}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <Card title="Red flags & gaps">
            <ul className="space-y-3">
              {p.redFlags.map((f, i) => (
                <li key={i} className="flex gap-2.5">
                  <AlertTriangle className="size-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold">{f.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{f.source}</div>
                    <div className="mt-2 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold text-rose-900 bg-rose-50 border border-rose-200 rounded-full px-2 py-0.5">
                      Owner · {f.owner}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>

        <Card title="Companion product suggestions" action={
          <Link href={`/submission/${p.id}/quote`} className="text-xs font-semibold text-primary hover:underline">Add to quote →</Link>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {p.companions.map(c => (
              <div key={c.code} className="rounded-xl border bg-gradient-to-br from-accent/10 to-transparent p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-mono-tabular text-xs font-bold text-accent bg-accent/15 rounded px-2 py-0.5">{c.code}</span>
                  <span className="font-semibold">{c.name}</span>
                </div>
                <p className="text-sm font-medium mb-1.5">{c.teaser}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{c.reasoning}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Right rail */}
      <div className="space-y-6">
        <Card title="Coverage at a glance">
          <div className="space-y-2">
            {p.productLines.map(pl => (
              <div key={pl} className="flex items-center justify-between text-sm">
                <span className="font-medium">{pl}</span>
                <CheckCircle2 className="size-4 text-emerald-600" />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Underwriting team">
          <ul className="space-y-3">
            {[
              { ...p.underwriter, kind: "Lead UW" },
              { ...p.uwSpecialist, kind: "Specialist" },
            ].map((u, i) => (
              <li key={i} className="flex items-center gap-3">
                <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center text-xs font-bold">
                  {u.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate">{u.name}</div>
                  <div className="text-[11px] text-muted-foreground">{u.title}</div>
                </div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 rounded-full px-2 py-0.5">{u.kind}</span>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="Quick actions">
          <div className="space-y-2">
            <ActionRow icon={FileText} label="Upload happens in the Inbox or New Submission flow" />
            <ActionRow icon={Send} label="Send broker request for SIR opinion" />
            <ActionRow icon={Wand2} label="Run external check" />
            <ActionRow icon={Star} label="Request approval routing" />
          </div>
        </Card>
      </div>
    </div>
  );
}

function ScoreCard({ label, score }: { label: string; score: number }) {
  const tone = score >= 80 ? "text-emerald-700" : score >= 60 ? "text-amber-700" : "text-rose-700";
  return (
    <div className="rounded-xl border p-3 bg-muted/30">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">{label}</div>
      <div className={cn("font-display text-2xl font-bold mt-1 leading-none", tone)}>{score}</div>
      <div className="text-[10px] text-muted-foreground">/ 100</div>
    </div>
  );
}

function ActionRow({ icon: Icon, label, onClick }: { icon: any; label: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/60 text-left transition-colors">
      <span className="size-8 rounded-lg bg-primary/10 text-primary grid place-items-center"><Icon className="size-4" /></span>
      <span className="text-sm flex-1">{label}</span>
      <ChevronRight className="size-4 text-muted-foreground" />
    </button>
  );
}

// ── MEMBER & BROKER ────────────────────────────────────────────────────────
function MemberSection({ p }: { p: SubmissionProfile }) {
  const m = p.member;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <Card title="Identification">
          <FieldRow label="Account name" value={m.accountName} />
          <FieldRow label="Dec. page name" value={m.decPageName} />
          <FieldRow label="Preferred name" value={m.preferredName} />
          <FieldRow label="Parent account" value={m.parentAccount} />
          <FieldRow label="Member number" value={p.memberNumber} />
          <FieldRow label="Member since" value={p.memberSince} />
        </Card>
        <Card title="Classification">
          <FieldRow label="Institution type" value={m.institutionType} />
          <FieldRow label="Sub-category" value={m.subCategory} />
          <FieldRow label="Boarding options" value={m.boardingOptions} />
          <FieldRow label="UW track" value={m.underwritingTrack} />
          <FieldRow label="Education segment" value={m.educationSegment} />
          <FieldRow label="Total enrollment" value={m.totalEnrollment} />
          <FieldRow label="Renewal type" value={m.renewalType} />
          <FieldRow label="Operating budget" value={m.budget} />
        </Card>
      </div>
      <div className="space-y-6">
        <Card title="Location">
          <FieldRow label="Territory" value={m.territory} />
          <FieldRow label="Physical address" value={m.physicalAddress} />
          <FieldRow label="City" value={m.physicalCity} />
          <FieldRow label="State / Zip" value={`${m.physicalState} ${m.physicalZip}`} />
          <FieldRow label="County" value={m.county} />
          <FieldRow label="Country" value={m.country} />
        </Card>

        <Card title="Broker contacts" action={
          <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><Plus className="size-3.5" /> Add</button>
        }>
          <div className="space-y-3">
            {p.brokerContacts.map(c => (
              <div key={c.name} className={cn(
                "rounded-xl border p-3 transition-colors",
                c.highlight ? "border-primary/40 bg-primary/5" : "bg-muted/30"
              )}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-gradient-to-br from-primary to-accent text-white grid place-items-center text-xs font-bold shrink-0">
                      {c.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                    </div>
                    <div>
                      <div className="font-semibold text-sm">{c.name}</div>
                      <div className="text-[11px] text-muted-foreground">{c.access}</div>
                    </div>
                  </div>
                  {c.highlight && <StatusPill tone="blue" size="sm">Primary</StatusPill>}
                </div>
                <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
                  <a className="flex items-center gap-1 hover:text-primary"><Phone className="size-3" />{c.phone}</a>
                  <a className="flex items-center gap-1 hover:text-primary"><Mail className="size-3" />{c.email}</a>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {c.roles.map(r => (
                    <span key={r} className="text-[10px] bg-background border rounded-full px-2 py-0.5">{r}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── RISK ───────────────────────────────────────────────────────────────────
function RiskSection({ p }: { p: SubmissionProfile }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Property exposure">
          {p.exposure.map((e, i) => <FieldRow key={i} label={e.label} value={e.value} tone={e.tone} />)}
        </Card>
        <Card title="Property characteristics">
          {p.property.map((e, i) => <FieldRow key={i} label={e.label} value={e.value} tone={e.highlight} />)}
        </Card>
      </div>

      <Card title="Risk score breakdown">
        <div className="space-y-3">
          {p.riskBars.map(b => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium">{b.label}</span>
                <span className="font-mono-tabular font-bold">{b.score}/100</span>
              </div>
              <div className="h-2 rounded-full bg-muted overflow-hidden">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${b.score}%` }}
                  transition={{ duration: 0.7, ease: "easeOut" }}
                  className={cn("h-full rounded-full",
                    b.tone === "good" && "bg-emerald-500",
                    b.tone === "warning" && "bg-amber-500",
                    b.tone === "bad" && "bg-rose-500")}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Safety & compliance checks">
          <div className="space-y-5">
            {p.safetyChecks.map(group => (
              <div key={group.section}>
                <div className="text-xs uppercase tracking-wider text-primary font-bold mb-2">{group.section}</div>
                <div className="space-y-1.5">
                  {group.items.map(it => (
                    <div key={it.label} className="flex items-center justify-between text-sm py-1.5">
                      <span>{it.label}</span>
                      {it.value === true && <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700"><CheckCircle2 className="size-4" /> Yes</span>}
                      {it.value === false && <span className="inline-flex items-center gap-1 text-xs font-semibold text-rose-700"><AlertTriangle className="size-4" /> No</span>}
                      {it.value === "partial" && <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700"><AlertTriangle className="size-4" /> Partial</span>}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
        <Card title="Liability exposures">
          <div className="space-y-3">
            {p.liabilityExposures.map(e => (
              <div key={e.label} className="rounded-xl border p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">{e.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{e.value}</div>
                </div>
                <StatusPill tone={e.tone === "good" ? "green" : e.tone === "bad" ? "red" : e.tone === "gold" ? "gold" : "blue"} size="sm">
                  {e.tone === "good" ? "Standard" : e.tone === "bad" ? "Sublimit" : "Reviewed"}
                </StatusPill>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── LOSS ───────────────────────────────────────────────────────────────────
const parseUSD = (s: string) => Number(s.replace(/[^0-9.-]/g, "")) || 0;
const fmtK = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : n >= 1_000 ? `$${(n / 1_000).toFixed(0)}K` : `$${n}`;

function claimIcon(type: string) {
  const t = type.toLowerCase();
  if (t.includes("water"))    return { Icon: Droplets,    label: "Water" };
  if (t.includes("fire"))     return { Icon: Flame,       label: "Fire" };
  if (t.includes("slip") || t.includes("fall")) return { Icon: Footprints, label: "Slip & Fall" };
  if (t.includes("student") || t.includes("sport") || t.includes("accident")) return { Icon: HeartPulse, label: "Student Injury" };
  if (t.includes("property")) return { Icon: Wrench,      label: "Property" };
  if (t.includes("auto"))     return { Icon: MapPinned,   label: "Auto" };
  return { Icon: Activity, label: type };
}

function LossSection({ p }: { p: SubmissionProfile }) {
  // Aggregates across the 5-year window
  const totals = p.yearSummary.reduce(
    (acc, y) => ({
      claims:   acc.claims   + y.claims,
      paid:     acc.paid     + parseUSD(y.paid),
      reserve:  acc.reserve  + parseUSD(y.reserve),
      incurred: acc.incurred + parseUSD(y.incurred),
      ratioSum: acc.ratioSum + parseUSD(y.ratio.replace("%", "")),
    }),
    { claims: 0, paid: 0, reserve: 0, incurred: 0, ratioSum: 0 },
  );
  const avgRatio = Math.round(totals.ratioSum / Math.max(p.yearSummary.length, 1));
  const open = p.claims.filter(c => c.status === "Open").length;
  const closed = p.claims.length - open;
  const maxIncurred = Math.max(...p.yearSummary.map(y => parseUSD(y.incurred)), 1);

  // Brand-aligned ratio band (UE blue → gold → deep navy as severity increases)
  const ratioBand =
    avgRatio < 25 ? { label: "Healthy",  color: "#0123D4", soft: "rgba(1,35,212,0.10)" } :
    avgRatio < 50 ? { label: "Watchful", color: "#C9A227", soft: "rgba(201,162,39,0.12)" } :
                    { label: "Elevated", color: "#0B1A6E", soft: "rgba(11,26,110,0.12)" };

  return (
    <div className="space-y-6">
      {/* HERO: gauge + summary stats — replaces the verbose first table */}
      <section className="rounded-2xl border bg-gradient-to-br from-white via-white to-primary/[0.04] dark:from-card dark:via-card dark:to-primary/[0.06] overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-0">
          {/* Gauge */}
          <div className="relative p-6 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-border/60"
               style={{ background: `radial-gradient(circle at 50% 60%, ${ratioBand.soft}, transparent 70%)` }}>
            <Gauge value={avgRatio} color={ratioBand.color} />
            <div className="mt-3 text-center">
              <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground font-bold">5-Year Avg. Loss Ratio</div>
              <div className="mt-1 inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: ratioBand.color }}>
                <span className="size-1.5 rounded-full" style={{ background: ratioBand.color }} />
                {ratioBand.label}
              </div>
            </div>
          </div>

          {/* Summary stats + bar chart */}
          <div className="p-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
              <Stat2 label="Total claims"   value={String(totals.claims)} sub={`${closed} closed · ${open} open`} icon={Layers}     tint="primary" />
              <Stat2 label="Total incurred" value={fmtK(totals.incurred)} sub={`across ${p.yearSummary.length} yrs`}  icon={Activity}  tint="primary" />
              <Stat2 label="Paid to date"   value={fmtK(totals.paid)}     sub="settled losses"                          icon={CheckCircle2} tint="emerald" />
              <Stat2 label="Open reserve"   value={fmtK(totals.reserve)}  sub="case + IBNR"                             icon={Shield}    tint="gold" />
            </div>

            {/* Year-by-year bars (incurred) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground font-bold">Incurred by year</div>
                <div className="text-[11px] text-muted-foreground">claims · loss ratio</div>
              </div>
              <div className="grid grid-cols-5 gap-3 items-end h-36">
                {p.yearSummary.map((y, i) => {
                  const incurred = parseUSD(y.incurred);
                  const h = Math.max(8, Math.round((incurred / maxIncurred) * 100));
                  const ratio = parseInt(y.ratio);
                  const fill = ratio < 25 ? "#0123D4" : ratio < 50 ? "#C9A227" : "#0B1A6E";
                  return (
                    <div key={y.year} className="flex flex-col items-center gap-1.5 h-full">
                      <div className="text-[10px] font-mono-tabular font-semibold text-muted-foreground">{fmtK(incurred)}</div>
                      <div className="flex-1 w-full flex items-end">
                        <motion.div
                          initial={{ height: 0 }} animate={{ height: `${h}%` }}
                          transition={{ delay: 0.1 + i * 0.06, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="w-full rounded-t-md relative group"
                          style={{ background: `linear-gradient(to top, ${fill}, ${fill}cc)` }}
                        >
                          <span className="absolute inset-x-0 -top-5 text-[10px] font-bold opacity-0 group-hover:opacity-100 text-center" style={{ color: fill }}>
                            {y.ratio}
                          </span>
                        </motion.div>
                      </div>
                      <div className="text-[11px] font-bold text-foreground">{y.year}</div>
                      <div className="text-[10px] text-muted-foreground font-mono-tabular">{y.claims}c · {y.ratio}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CLAIM CARDS — visual replacement for the long detail table */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-display font-bold text-base">Claim detail</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{p.claims.length} claims · {open} open · {closed} closed</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {p.claims.map((c, i) => {
            const { Icon, label } = claimIcon(c.type);
            const total = parseUSD(c.total);
            const sev = total > 15000 ? "high" : total > 7500 ? "med" : "low";
            const sevStyle =
              sev === "high" ? { ring: "ring-[#0B1A6E]/30",  bg: "bg-[#0B1A6E]/8",   icon: "text-[#0B1A6E]", chipBg: "bg-[#0B1A6E]/10",  chipText: "text-[#0B1A6E]" } :
              sev === "med"  ? { ring: "ring-accent/40",     bg: "bg-accent/10",     icon: "text-[#7B6217]", chipBg: "bg-accent/15",     chipText: "text-[#7B6217]" } :
                               { ring: "ring-primary/25",    bg: "bg-primary/8",     icon: "text-primary",   chipBg: "bg-primary/10",    chipText: "text-primary" };

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className={cn("relative overflow-hidden rounded-xl border bg-card p-4 ring-1 ring-inset hover:shadow-lg transition-shadow", sevStyle.ring)}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("size-11 rounded-xl grid place-items-center shrink-0", sevStyle.bg, sevStyle.icon)}>
                    <Icon className="size-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-tabular text-xs font-bold">{c.id}</span>
                      <span className={cn("text-[10px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded-full", sevStyle.chipBg, sevStyle.chipText)}>{label}</span>
                      <StatusPill tone={c.status === "Open" ? "gold" : "green"} size="sm">{c.status}</StatusPill>
                      {c.alert && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#0B1A6E]/10 text-[#0B1A6E]">
                          <AlertTriangle className="size-3" /> Alert
                        </span>
                      )}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-foreground truncate">{c.type}</div>
                    <div className="text-[11px] text-muted-foreground flex items-center gap-2 mt-0.5">
                      <Calendar className="size-3" /> {c.date}
                      <span>·</span>
                      <MapPin className="size-3" /> {c.location}
                    </div>

                    {/* Paid vs Reserve mini-bar */}
                    <div className="mt-3">
                      <div className="flex items-center justify-between text-[10px] font-mono-tabular mb-1">
                        <span className="text-muted-foreground">Paid {c.paid} · Reserve {c.reserve}</span>
                        <span className="font-bold text-foreground">{c.total}</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden flex">
                        <div className="h-full" style={{ width: `${(parseUSD(c.paid) / total) * 100}%`, background: "#0123D4" }} />
                        <div className="h-full" style={{ width: `${(parseUSD(c.reserve) / total) * 100}%`, background: "#C9A227" }} />
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Gauge({ value, color }: { value: number; color: string }) {
  const v = Math.max(0, Math.min(100, value));
  const r = 64, c = Math.PI * r; // half-circle circumference
  const dash = (v / 100) * c;
  return (
    <svg viewBox="0 0 160 100" className="w-44 h-28">
      <path d={`M 16 88 A ${r} ${r} 0 0 1 144 88`} fill="none" stroke="hsl(var(--muted))" strokeWidth="12" strokeLinecap="round" />
      <motion.path
        d={`M 16 88 A ${r} ${r} 0 0 1 144 88`} fill="none" stroke={color} strokeWidth="12" strokeLinecap="round"
        strokeDasharray={`${c}`} initial={{ strokeDashoffset: c }} animate={{ strokeDashoffset: c - dash }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      />
      <text x="80" y="76" textAnchor="middle" className="font-display font-bold" style={{ fontSize: 30, fill: color }}>{v}%</text>
    </svg>
  );
}

function Stat2({ label, value, sub, icon: Icon, tint }: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ className?: string }>;
  tint: "primary" | "gold" | "emerald";
}) {
  const accent = tint === "gold" ? "#C9A227" : tint === "emerald" ? "#0B1A6E" : "#0123D4";
  return (
    <div className="relative rounded-lg border bg-card px-3 py-2.5 hover:border-foreground/20 transition-colors">
      <div className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r" style={{ background: accent }} />
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        <Icon className="size-3" />
        {label}
      </div>
      <div className="mt-1 font-display font-bold text-[18px] leading-none font-mono-tabular text-foreground">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground mt-1">{sub}</div>}
    </div>
  );
}

// ── DOCUMENTS ──────────────────────────────────────────────────────────────
function DocumentsSection({ p, tier }: { p: SubmissionProfile; tier: ReturnType<typeof tierFromType> }) {
  const requiredForms = UE_FORMS[tier].filter(f => f.required);
  const supplementals = UE_FORMS[tier].filter(f => !f.required);
  const onFile = new Set(p.documents.map(d => d.name.toLowerCase()));
  const matched = (code: string, name: string) =>
    Array.from(onFile).some(n => n.includes(code.toLowerCase()) || n.includes(name.split(" ")[0].toLowerCase()));
  return (
    <div className="space-y-6">
      {/* The 40×10 UE Document Review Matrix is now driven by the Companion
          (right rail) — ask "Docs expected at this stage" and it returns the
          checklist for the current lifecycle phase. Keeping the heavy grid
          out of the page keeps Documents focused on what's actually on file. */}

      <div className="rounded-2xl border bg-gradient-to-r from-primary/5 to-accent/5 p-4 flex items-start gap-3">
        <div className="size-10 rounded-xl bg-primary/15 grid place-items-center text-primary shrink-0">
          <Sparkles className="size-5" />
        </div>
        <div className="flex-1">
          <div className="font-display font-bold text-sm">UE forms checklist · {tierLabel(tier)}</div>
          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
            Documents now arrive via the <span className="font-semibold text-foreground">Inbox</span> ("Upload &amp; Comprehend" on each email)
            or the <span className="font-semibold text-foreground">New Submission</span> intake. Below is what UE expects for this tier and what's currently on file.
          </p>
        </div>
        <Link href="/inbox" className="h-9 px-4 rounded-full bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 shrink-0">
          Go to Inbox <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <div>
        <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
          <Shield className="size-4 text-primary" /> Required for {tierLabel(tier)} <span className="text-[11px] text-muted-foreground font-normal">({requiredForms.length})</span>
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {requiredForms.map(f => {
            const ok = matched(f.code, f.name);
            return (
              <div key={f.code} className={cn("rounded-xl border p-3 flex items-start gap-3",
                ok ? "bg-emerald-50/50 border-emerald-200/60" : "bg-rose-50/50 border-rose-200/60")}>
                <div className={cn("size-9 rounded-lg grid place-items-center shrink-0",
                  ok ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
                  {ok ? <CheckCircle2 className="size-4" /> : <AlertTriangle className="size-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold">{f.name}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">{f.code} · {f.productHint}</div>
                  {!ok && <div className="mt-1.5 text-[11px] font-semibold text-rose-700">Missing — request from broker</div>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {supplementals.length > 0 && (
        <div>
          <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
            <FileText className="size-4 text-muted-foreground" /> Supplementals <span className="text-[11px] text-muted-foreground font-normal">({supplementals.length})</span>
          </h3>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {supplementals.map(f => (
              <li key={f.code} className="rounded-lg border p-2.5 text-xs flex items-center gap-2 bg-muted/30">
                <span className="size-6 rounded grid place-items-center bg-card text-muted-foreground"><FileText className="size-3" /></span>
                <span className="font-semibold flex-1 truncate">{f.name}</span>
                <span className="text-[10px] text-muted-foreground">{f.code}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <h3 className="font-display font-bold text-sm mb-3 flex items-center gap-2">
          <FileText className="size-4 text-primary" /> On file ({p.documents.length})
        </h3>
        <p className="text-sm text-muted-foreground mb-3">All documents are comprehended by the Companion. Findings flow into your review automatically.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {p.documents.map((d, i) => (
          <motion.div
            key={d.name}
            initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
            className={cn(
              "rounded-xl border p-4 flex items-start gap-3",
              d.status === "Verified" && "bg-emerald-50/40 border-emerald-200/60",
              d.status === "Pending" && "bg-amber-50/40 border-amber-200/60",
              d.status === "Missing" && "bg-rose-50/40 border-rose-200/60",
            )}
          >
            <div className={cn(
              "size-10 rounded-xl grid place-items-center shrink-0",
              d.status === "Verified" ? "bg-emerald-100 text-emerald-700" :
              d.status === "Pending" ? "bg-amber-100 text-amber-700" :
              "bg-rose-100 text-rose-700"
            )}>
              <FileText className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="font-semibold text-sm">{d.name}</div>
                  <div className="text-[11px] text-muted-foreground">{d.type}</div>
                </div>
                <StatusPill tone={d.status === "Verified" ? "green" : d.status === "Pending" ? "gold" : "red"} size="sm">{d.status}</StatusPill>
              </div>
              <div className="mt-2 flex items-center gap-3 text-[11px] text-muted-foreground">
                <span>{d.uploaded}</span><span>·</span><span>{d.size}</span><span>·</span><span>by {d.uploadedBy}</span>
              </div>
              {d.status !== "Missing" && (
                <div className="mt-3 flex items-center gap-2">
                  <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><Eye className="size-3.5" /> View</button>
                  <button className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"><Download className="size-3.5" /> Download</button>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ── RATING ────────────────────────────────────────────────────────────────
function RatingSection({ p }: { p: SubmissionProfile }) {
  const total = p.coverages.reduce((s, c) => s + parseInt(c.premium.replace(/[^\d]/g, "")), 0);
  return (
    <Card title="Coverage & rating" action={
      <Link href={`/submission/${p.id}/quote`} className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
        Open builder <ArrowRight className="size-3.5" />
      </Link>
    }>
      <div className="overflow-x-auto scroll-thin">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="text-left py-2 font-semibold">Coverage</th>
              <th className="text-right py-2 font-semibold">Limit</th>
              <th className="text-right py-2 font-semibold">Aggregate</th>
              <th className="text-right py-2 font-semibold">Retention</th>
              <th className="text-right py-2 font-semibold">Factor</th>
              <th className="text-right py-2 font-semibold">Premium</th>
            </tr>
          </thead>
          <tbody>
            {p.coverages.map(c => (
              <tr key={c.name} className="border-t">
                <td className="py-3 font-semibold">{c.name}</td>
                <td className="py-3 text-right font-mono-tabular">{c.limit}</td>
                <td className="py-3 text-right font-mono-tabular">{c.aggregateLimit}</td>
                <td className="py-3 text-right font-mono-tabular">{c.retention}</td>
                <td className="py-3 text-right font-mono-tabular">{c.factor}×</td>
                <td className="py-3 text-right font-mono-tabular font-bold">{c.premium}</td>
              </tr>
            ))}
            <tr className="border-t-2 border-primary bg-primary/5">
              <td className="py-3 font-bold">Total quoted premium</td>
              <td colSpan={4}></td>
              <td className="py-3 text-right font-mono-tabular text-lg font-display font-bold text-primary">${total.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── CORRESPONDENCE ────────────────────────────────────────────────────────
function CorrespondenceSection({ p }: { p: SubmissionProfile }) {
  return (
    <Card title="Recent correspondence" action={
      <button className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
        <Send className="size-3.5" /> Compose
      </button>
    }>
      <div className="space-y-3">
        {[
          { from: "Tyler Owens (Marsh)", to: "Maya Khanna", time: "Today · 11:42 AM", subject: "Loss runs + Sex Misc addendum attached", body: "Hi Maya — please find attached the 2024 supplemental loss run and the Sexual Misconduct addendum draft. Bind target remains June 1." },
          { from: "Maya Khanna", to: "Tyler Owens (Marsh)", time: "Yesterday · 4:18 PM", subject: "RE: SIR Actuarial Opinion", body: "Tyler — checking back on the SIR opinion. We need it to release the buffer-layer pricing. Can you confirm by EOD Monday?" },
          { from: "Companion", to: "Maya Khanna", time: "Apr 16 · 2:11 PM", subject: "Comprehension complete", body: "Document packet comprehended (8 docs / 4.2s). 4 reviews complete, 2 missing. Recommended companion: BLX." },
        ].map((m, i) => (
          <div key={i} className="rounded-xl border p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{m.subject}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{m.from} → {m.to}</div>
              </div>
              <span className="text-[11px] text-muted-foreground">{m.time}</span>
            </div>
            <p className="text-sm text-foreground/85 mt-3">{m.body}</p>
            <div className="mt-3 flex gap-2">
              <button className="text-xs font-semibold text-primary hover:underline">Reply</button>
              <button className="text-xs font-semibold text-primary hover:underline">Forward</button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── NOTES ─────────────────────────────────────────────────────────────────
function NotesSection({ p }: { p: SubmissionProfile }) {
  return (
    <Card title="Internal notes" action={
      <button className="h-9 px-3 rounded-full bg-primary text-primary-foreground text-xs font-semibold flex items-center gap-1.5">
        <Plus className="size-3.5" /> Add note
      </button>
    }>
      <div className="space-y-3">
        {p.notes.map(n => (
          <div key={n.id} className="flex gap-3 rounded-xl border p-4">
            <div className={cn(
              "size-9 rounded-xl text-white grid place-items-center text-xs font-bold shrink-0",
              n.author === "AI Companion" ? "bg-gradient-to-br from-primary to-accent" : "bg-gradient-to-br from-primary to-[#1E40AF]"
            )}>
              {n.initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-sm">{n.author}</span>
                <StatusPill tone={n.tag === "AI Insight" ? "gold" : "blue"} size="sm">{n.tag}</StatusPill>
                <span className="text-[11px] text-muted-foreground ml-auto">{n.time}</span>
              </div>
              <p className="text-sm text-foreground/85 mt-2">{n.body}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── APPROVALS ──────────────────────────────────────────────────────────────
function ApprovalsSection({ p }: { p: SubmissionProfile }) {
  return (
    <Card title="Approvals & referrals">
      <div className="space-y-3">
        {p.approvals.map(a => (
          <div key={a.id} className={cn(
            "rounded-xl border p-4",
            a.status === "Approved" ? "border-emerald-200 bg-emerald-50/40" :
            a.status === "Pending" ? "border-amber-200 bg-amber-50/40" :
            "border-primary/30 bg-primary/5"
          )}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="size-10 rounded-xl bg-gradient-to-br from-primary to-[#1E40AF] text-white grid place-items-center text-xs font-bold">
                  {a.name.split(" ").map(w => w[0]).slice(0, 2).join("")}
                </div>
                <div>
                  <div className="font-semibold text-sm">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground">{a.role} · {a.level}</div>
                </div>
              </div>
              <StatusPill tone={a.status === "Approved" ? "green" : a.status === "Pending" ? "gold" : "blue"} size="sm">{a.status}</StatusPill>
            </div>
            <p className="text-sm text-foreground/85 mt-3">{a.note}</p>
            <div className="text-[11px] text-muted-foreground mt-2">{a.time}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ── AUDIT ─────────────────────────────────────────────────────────────────
function AuditSection({ p }: { p: SubmissionProfile }) {
  return (
    <Card title="Audit trail">
      <ol className="relative border-l-2 border-border ml-3 space-y-4 py-2">
        {p.audit.map(e => (
          <li key={e.id} className="ml-5 relative">
            <span className={cn(
              "absolute -left-7 top-1.5 size-3 rounded-full ring-4 ring-background",
              e.actor === "AI Companion" ? "bg-accent" : e.actor === "System" ? "bg-muted-foreground" : "bg-primary"
            )} />
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-xs font-semibold">{e.actor}</span>
              <span className="text-xs text-muted-foreground">{e.action}</span>
              <span className="text-xs font-medium text-foreground">{e.target}</span>
              <span className="text-[11px] text-muted-foreground ml-auto">{e.time}</span>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}

function stageGroupOf(stage: string): string {
  if (["Information Gathering", "Review In Progress", "Referred"].includes(stage)) return "Underwriting";
  if (["Quote In Progress", "Quote Sent", "Quote Negotiation", "Revised Quote"].includes(stage)) return "Quoting";
  if (["Bound", "UE Non-Renewed", "Member Declined", "Member No Response"].includes(stage)) return "Decision";
  if (["Pending Issuance", "Issued", "Cancelled", "Endorsed"].includes(stage)) return "Post-Bind";
  return "Intake & Triage";
}

// ── Document Lifecycle Matrix (UE Document Review Matrix, 40 docs × 10 stages) ──
function DocLifecycleMatrix({ stage }: { stage: string }) {
  const here = currentDocStage(stage);
  const [cat, setCat] = useState<DocCategory | "All">("All");
  const [hover, setHover] = useState<{ docId: number; col: DocStage } | null>(null);

  const rows = cat === "All" ? DOC_MATRIX : DOC_MATRIX.filter(d => d.category === cat);
  const summary = lifecycleSummary(here);

  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      {/* Header band */}
      <header className="px-5 py-4 border-b bg-gradient-to-r from-primary/[0.06] via-transparent to-accent/[0.06]">
        <div className="flex items-start gap-3">
          <div className="size-10 rounded-xl bg-primary/15 grid place-items-center text-primary shrink-0">
            <Layers className="size-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-base leading-tight">Document Lifecycle · UE Review Matrix</h3>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              40 documents tracked across 10 lifecycle stages. You're at <span className="font-semibold text-foreground">{here}</span> —
              {" "}{summary.total} documents are active here ({summary.P} primary, {summary.C} created, {summary.R} reviewed, {summary.U} updated).
            </p>
          </div>
          <div className="hidden md:flex items-center gap-1.5 shrink-0">
            {(Object.keys(STATUS_META) as Array<keyof typeof STATUS_META>).map(k => (
              <span key={k} className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full"
                    style={{ background: STATUS_META[k].bg, color: STATUS_META[k].color }}>
                <span className="size-1.5 rounded-full" style={{ background: STATUS_META[k].color }} />
                {k} · {STATUS_META[k].label}
              </span>
            ))}
          </div>
        </div>

        {/* Lifecycle ribbon */}
        <div className="mt-4 flex items-center gap-1 overflow-x-auto scroll-thin pb-1">
          {DOC_STAGES.map((s, i) => {
            const isHere = s === here;
            const isPast = DOC_STAGES.indexOf(here) > i;
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <div className={cn(
                  "px-2.5 h-7 rounded-full text-[10.5px] font-bold uppercase tracking-wider grid place-items-center transition-all",
                  isHere ? "bg-primary text-primary-foreground shadow-md shadow-primary/30 scale-105" :
                  isPast ? "bg-primary/12 text-primary" :
                           "bg-muted text-muted-foreground",
                )}>
                  {s}
                </div>
                {i < DOC_STAGES.length - 1 && <ChevronRight className="size-3 text-muted-foreground/40 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Category filter */}
        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
          {(["All", ...CATEGORIES] as const).map(c => {
            const on = cat === c;
            const meta = c === "All" ? null : CATEGORY_META[c];
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={cn(
                  "h-7 px-2.5 rounded-full text-[11px] font-semibold inline-flex items-center gap-1.5 border transition-all",
                  on ? "bg-foreground text-background border-foreground shadow-sm"
                     : "bg-card text-muted-foreground hover:text-foreground hover:border-foreground/30",
                )}
              >
                {meta && <span className="size-1.5 rounded-full" style={{ background: meta.color }} />}
                {c}
                <span className={cn("text-[10px] font-mono-tabular", on ? "text-background/70" : "text-muted-foreground/60")}>
                  · {c === "All" ? DOC_MATRIX.length : DOC_MATRIX.filter(d => d.category === c).length}
                </span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Matrix grid */}
      <div className="overflow-x-auto scroll-thin">
        <div className="min-w-[1000px]">
          {/* Column headers */}
          <div className="grid sticky top-0 z-10 bg-card/95 backdrop-blur"
               style={{ gridTemplateColumns: `minmax(280px, 2fr) minmax(150px, 1fr) repeat(${DOC_STAGES.length}, minmax(58px, 1fr))` }}>
            <div className="px-4 py-2.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-b">Document</div>
            <div className="px-2 py-2.5 text-[10px] uppercase tracking-wider font-bold text-muted-foreground border-b">Source / Owner</div>
            {DOC_STAGES.map(s => (
              <div key={s} className={cn(
                "px-1 py-2.5 text-[9.5px] uppercase tracking-wider font-bold text-center border-b leading-tight",
                s === here ? "bg-primary/8 text-primary" : "text-muted-foreground/80",
              )}>
                {s.replace(" Proc.", "").replace(" Endorse.", "")}
              </div>
            ))}
          </div>

          {/* Rows */}
          {rows.map((d, idx) => {
            const meta = CATEGORY_META[d.category];
            return (
              <motion.div
                key={d.id}
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.012, 0.4) }}
                className="grid hover:bg-muted/30 transition-colors border-b border-border/50 last:border-b-0"
                style={{ gridTemplateColumns: `minmax(280px, 2fr) minmax(150px, 1fr) repeat(${DOC_STAGES.length}, minmax(58px, 1fr))` }}
              >
                <div className="px-4 py-2.5 flex items-center gap-2.5 min-w-0">
                  <span className="size-1.5 rounded-full shrink-0" style={{ background: meta.color }} title={d.category} />
                  <span className="text-[11px] font-mono-tabular text-muted-foreground/70 w-5 shrink-0">{String(d.id).padStart(2, "0")}</span>
                  <span className="text-[12.5px] font-semibold text-foreground truncate" title={d.name}>{d.name}</span>
                </div>
                <div className="px-2 py-2.5 text-[10.5px] text-muted-foreground truncate" title={d.source}>
                  {d.source}
                </div>
                {DOC_STAGES.map(s => {
                  const code = d.flow[s];
                  const isHere = s === here;
                  const isHover = hover?.docId === d.id && hover?.col === s;
                  return (
                    <div
                      key={s}
                      onMouseEnter={() => code && setHover({ docId: d.id, col: s })}
                      onMouseLeave={() => setHover(null)}
                      className={cn("relative px-1 py-2 grid place-items-center", isHere && "bg-primary/[0.04]")}
                    >
                      {code ? (
                        <span
                          role="img"
                          aria-label={`${d.name} — ${STATUS_META[code].long} at ${s}`}
                          tabIndex={0}
                          className="inline-grid place-items-center size-6 rounded-md text-[10px] font-bold cursor-help transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-1"
                          style={{ background: STATUS_META[code].bg, color: STATUS_META[code].color, boxShadow: `inset 0 0 0 1px ${STATUS_META[code].color}33` }}
                          title={`${STATUS_META[code].long} (${s})`}
                        >
                          {code}
                        </span>
                      ) : (
                        <span className="size-1 rounded-full bg-border" />
                      )}
                      {isHover && code && (
                        <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground text-background px-2 py-1 text-[10px] font-medium shadow-lg pointer-events-none">
                          {STATUS_META[code].long}
                        </div>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            );
          })}

          {rows.length === 0 && (
            <div className="px-5 py-10 text-center text-sm text-muted-foreground">No documents in this category.</div>
          )}
        </div>
      </div>

      {/* Footer note */}
      <div className="px-5 py-2.5 border-t bg-muted/30 text-[10.5px] text-muted-foreground flex items-center gap-2">
        <Sparkles className="size-3 text-primary" />
        Matrix sourced from UE's As-Is Document Review Matrix. The Companion uses this to know what to expect at each stage and what's overdue.
      </div>
    </section>
  );
}
