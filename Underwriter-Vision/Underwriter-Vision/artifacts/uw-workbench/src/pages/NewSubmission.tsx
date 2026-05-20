import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload, FileText, Sparkles, CheckCircle2, AlertTriangle, Wand2, ArrowRight,
  Building2, FileStack, User, Shield, Plus, Trash2, ChevronRight, ChevronLeft, Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PageBody, SectionTitle } from "@/components/Primitives";
import { UE_FORMS, tierFromType, tierLabel, NEW_SUBMISSION_PREFILL, type InstitutionTier } from "@/lib/mockData";
import { useCompanion, newId, now } from "@/components/companion/CompanionContext";
import { PageRegister } from "@/components/companion/PageRegister";

type UploadedDoc = {
  id: string;
  name: string;
  size: string;
  matched?: { code: string; label: string };
  status: "uploading" | "comprehending" | "ready" | "unrecognized";
};

const SAMPLE_DROP: UploadedDoc[] = [
  { id: "d1", name: "Lakeside_All-Lines_Application.pdf",     size: "2.6 MB", status: "ready", matched: { code: "IS-ALL", label: "All-Lines Application (Independent / Charter)" } },
  { id: "d2", name: "Lakeside_SexMisc_Supplemental.pdf",      size: "918 KB", status: "ready", matched: { code: "IS-SXM", label: "Sexual Misconduct Supplemental" } },
  { id: "d3", name: "Lakeside_Loss_Run_2018-2024.pdf",        size: "1.4 MB", status: "ready" },
  { id: "d4", name: "Lakeside_Audited_Financials_FY24.pdf",   size: "5.1 MB", status: "ready" },
  { id: "d5", name: "Lakeside_COPE_Survey.xlsx",              size: "812 KB", status: "ready" },
];

export function NewSubmission() {
  const [, navigate] = useLocation();
  const { startJob } = useCompanion();
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0); // 0 upload, 1 comprehending, 2 prefill, 3 review-confirm
  const [docs, setDocs] = useState<UploadedDoc[]>([]);
  const [tier, setTier] = useState<InstitutionTier>("Independent_Charter");
  const [account, setAccount] = useState(NEW_SUBMISSION_PREFILL.account);
  const [policy, setPolicy] = useState(NEW_SUBMISSION_PREFILL.policy);
  const [broker, setBroker] = useState(NEW_SUBMISSION_PREFILL.broker);
  const [notes, setNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const prefillRef = useRef<HTMLDivElement>(null);
  const comprehendRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState<string[]>([]);

  function simulateUpload() {
    setDocs([]);
    // Float a glass status card top-right (same pattern as Inbox) so the
    // packet ingestion is visible even if the user scrolls.
    startJob({
      id: `intake-${Date.now()}`,
      title: `Comprehending ${SAMPLE_DROP.length} attachments`,
      subtitle: `${NEW_SUBMISSION_PREFILL.account.preferredName || "Demo packet"} · ${tierLabel(tier)}`,
      steps: [
        "Reading filenames & MIME types…",
        "OCR-scanning attached PDFs…",
        "Matching content against UE form catalog…",
        "Extracting structured fields…",
        "Cross-referencing broker access scope…",
        "Done — packet ready for comprehension.",
      ],
    });
    SAMPLE_DROP.forEach((d, i) => {
      setTimeout(() => setDocs(prev => [...prev, { ...d, status: "uploading" }]), i * 220);
      setTimeout(() => setDocs(prev => prev.map(x => x.id === d.id ? { ...x, status: "comprehending" } : x)), i * 220 + 700);
      setTimeout(() => setDocs(prev => prev.map(x => x.id === d.id ? { ...x, status: d.status } : x)), i * 220 + 1400);
    });
  }

  // Robust auto-scroll: walks up to find the real scroll container (the page
  // is wrapped in flex+overflow-hidden ancestors, so plain scrollIntoView is
  // unreliable). Uses double rAF so the target is mounted & laid out first.
  function smoothScrollTo(el: HTMLElement | null, offset = 88) {
    if (!el) return;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      let scroller: HTMLElement | Window = window;
      let p: HTMLElement | null = el.parentElement;
      while (p) {
        const s = getComputedStyle(p);
        if (/auto|scroll|overlay/.test(s.overflowY) && p.scrollHeight > p.clientHeight) {
          scroller = p; break;
        }
        p = p.parentElement;
      }
      if (scroller === window) {
        const top = el.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: "smooth" });
      } else {
        const s = scroller as HTMLElement;
        const top = el.getBoundingClientRect().top - s.getBoundingClientRect().top + s.scrollTop - offset;
        s.scrollTo({ top, behavior: "smooth" });
      }
    }));
  }

  // Scroll to the live comprehension panel the moment the user clicks
  // "Comprehend packet" (step → 1) so the action feels immediate, then again
  // to the pre-filled fields once extraction completes (step → 2).
  useEffect(() => {
    if (step === 1) {
      smoothScrollTo(comprehendRef.current, 96);
      return undefined;
    }
    if (step === 2) {
      const t = setTimeout(() => smoothScrollTo(prefillRef.current, 96), 120);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [step]);

  function startComprehension() {
    setStep(1);
    setRevealed([]);
    const required = UE_FORMS[tier].filter(f => f.required);
    const findings = [
      ...required.map(r => {
        const matched = docs.some(d => d.matched?.code === r.code);
        return { ok: matched, label: r.name, sub: matched ? "Detected ✓" : "Missing — companion will request" };
      }),
      { ok: true, label: "Loss runs · 6 years", sub: `Detected 6 claims · $${"112,400"} incurred` },
      { ok: true, label: "COPE survey", sub: "38 buildings · 1.42M sq ft" },
      { ok: true, label: "Audited financials FY24", sub: "Operating budget verified" },
    ];
    findings.forEach((_, i) => setTimeout(() => setRevealed(r => [...r, `f${i}`]), 350 + i * 280));
    setTimeout(() => setStep(2), 350 + findings.length * 280 + 600);
  }

  function submitNew() {
    setStep(3);
    // Background job — companion processes all docs and "creates" the submission.
    startJob({
      id: "new-sub",
      title: `Indexing ${account.institutionName}`,
      subtitle: `${docs.length} docs · ${tierLabel(tier)} · packet validation`,
      href: "/submission/SUB-7829",
      steps: [
        "Persisting member master record…",
        "Mapping product lines to coverages…",
        "Scoring appetite vs. UE underwriting bands…",
        "Cross-referencing broker access scope…",
        "Creating tasks for missing documents…",
        "Submission ready for review.",
      ],
    });
    setTimeout(() => navigate("/submissions"), 1100);
  }

  return (
    <PageBody className="!pt-6 !max-w-[1280px] mx-auto">
      <PageRegister
        routeKey="new-submission"
        title="New Submission"
        subtitle="Lucid intake"
        greeting="Drop the broker's packet here and I'll comprehend every page — extracting account, broker, policy and exposure data so you don't have to retype anything."
        suggestions={[
          { id: "auto-fill", label: "Use the demo packet", hint: "Simulate Marsh broker drop", tone: "blue", icon: "FileStack" },
          { id: "show-required", label: "Show required forms", hint: `For ${tierLabel(tier)}`, tone: "gold", icon: "Shield" },
          { id: "appetite-preview", label: "Appetite preview", hint: "Pre-screen before submit", tone: "violet", icon: "Compass" },
          { id: "go-submissions", label: "Back to all submissions", tone: "blue", icon: "FileStack", navigateTo: "/submissions" },
        ]}
        respond={(sid) => {
          if (sid === "auto-fill") { simulateUpload(); return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Streaming the demo packet into the dropzone — ready in a moment." }]; }
          if (sid === "show-required") {
            const items = UE_FORMS[tier].map(f => ({ ok: f.required, label: f.name, sub: f.required ? "Required" : "Optional supplemental" }));
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: { kind: "checklist", title: `UE Forms · ${tierLabel(tier)}`, items } }];
          }
          if (sid === "appetite-preview") {
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: { kind: "ring", title: "Pre-screen appetite", value: 81, bars: [
              { label: "Segment fit", value: 88 }, { label: "Loss experience", value: 76, tone: "gold" }, { label: "Geography", value: 84 },
            ] } }];
          }
          return;
        }}
      />

      <SectionTitle
        eyebrow="Workbench"
        title="New Submission"
        sub="Drop documents. The Companion reads them, extracts every field, and only asks you what it cannot infer."
        action={<Link href="/submissions" className="hidden md:inline-flex h-10 px-4 items-center gap-2 rounded-full bg-muted/60 text-sm font-medium hover:bg-muted">All submissions</Link>}
      />

      {/* Stepper */}
      <ol className="flex items-center gap-2 mb-6 text-xs">
        {["Drop documents", "Companion comprehends", "Confirm & submit"].map((label, i) => {
          const stage = i === 0 ? 0 : i === 1 ? 1 : 2;
          const state = step === 3 ? "done" : step >= stage ? (step === stage ? "active" : "done") : "todo";
          return (
            <li key={label} className="flex items-center gap-2">
              <span className={cn("size-7 rounded-full grid place-items-center font-bold text-[11px] transition-colors",
                state === "active" ? "bg-primary text-primary-foreground shadow-md shadow-primary/30" :
                state === "done" ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground")}>
                {state === "done" ? <CheckCircle2 className="size-3.5" /> : i + 1}
              </span>
              <span className={cn("font-semibold", state === "active" ? "text-foreground" : "text-muted-foreground")}>{label}</span>
              {i < 2 && <ChevronRight className="size-3 text-muted-foreground mx-1" />}
            </li>
          );
        })}
      </ol>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Dropzone & docs */}
        <section className="lg:col-span-2 space-y-5">
          <Dropzone
            tier={tier} setTier={setTier}
            onPick={() => fileRef.current?.click()}
            onDemo={simulateUpload}
            disabled={step === 1}
          />
          <input ref={fileRef} type="file" multiple className="hidden"
                 onChange={() => simulateUpload()} />

          {/* Document list */}
          {docs.length > 0 && (
            <div className="rounded-2xl border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b flex items-center gap-2">
                <FileStack className="size-4 text-primary" />
                <h3 className="font-display font-bold text-sm">Packet · {docs.length} files</h3>
                <span className="text-[11px] text-muted-foreground ml-2">
                  {docs.filter(d => d.status === "ready").length} ready
                </span>
                {step < 2 && (
                  <button
                    onClick={startComprehension}
                    disabled={!docs.length || step === 1 || docs.some(d => d.status !== "ready")}
                    className="ml-auto h-9 px-4 rounded-full bg-gradient-to-r from-primary to-[#1E40AF] text-white text-xs font-semibold shadow-lg shadow-primary/25 disabled:opacity-40 inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="size-3.5 text-accent" /> Comprehend packet
                  </button>
                )}
              </div>
              <ul className="divide-y">
                {docs.map(d => (
                  <li key={d.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="size-9 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
                      <FileText className="size-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{d.name}</div>
                      <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2 flex-wrap">
                        <span>{d.size}</span>
                        {d.matched && <span className="font-mono-tabular bg-accent/15 text-[#7B6217] px-1.5 py-0.5 rounded">{d.matched.code}</span>}
                        {d.matched && <span className="truncate">{d.matched.label}</span>}
                        {!d.matched && d.status === "ready" && <span className="text-amber-700">Supporting · cross-referenced</span>}
                      </div>
                    </div>
                    <DocStatus status={d.status} />
                    <button onClick={() => setDocs(prev => prev.filter(x => x.id !== d.id))}
                            className="size-8 rounded-lg hover:bg-muted grid place-items-center text-muted-foreground">
                      <Trash2 className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Comprehension overlay */}
          <div ref={comprehendRef} className="scroll-mt-24">
            <AnimatePresence>
              {step === 1 && (
                <ComprehensionGlass
                  tier={tier} docs={docs} revealed={revealed}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Pre-fill review */}
          {step >= 2 && (
            <div ref={prefillRef} className="space-y-5 scroll-mt-24">
              <PrefillBanner docCount={docs.length} />
              <PrefillCard icon={Building2} title="Account" tag="extracted from All-Lines App p.1–3">
                <Grid>
                  <Field label="Institution Name" value={account.institutionName} onChange={v => setAccount({ ...account, institutionName: v })} />
                  <Field label="DEC Page Name" value={account.decPageName} onChange={v => setAccount({ ...account, decPageName: v })} />
                  <Field label="Preferred / Short Name" value={account.preferredName} onChange={v => setAccount({ ...account, preferredName: v })} />
                  <Field label="Parent Account" value={account.parentAccount} onChange={v => setAccount({ ...account, parentAccount: v })} />
                  <Field label="Institution Type" value={account.institutionType} onChange={v => setAccount({ ...account, institutionType: v })} />
                  <Field label="Sub-category" value={account.subCategory} onChange={v => setAccount({ ...account, subCategory: v })} />
                  <Field label="Boarding" value={account.boarding} onChange={v => setAccount({ ...account, boarding: v })} />
                  <Field label="Education Segment" value={account.educationSegment} onChange={v => setAccount({ ...account, educationSegment: v })} />
                  <Field label="Enrollment" value={account.enrollment} onChange={v => setAccount({ ...account, enrollment: v })} />
                  <Field label="Renewal Type" value={account.renewalType} onChange={v => setAccount({ ...account, renewalType: v })} />
                  <Field label="Address" value={account.address} onChange={v => setAccount({ ...account, address: v })} className="md:col-span-2" />
                  <Field label="City" value={account.city} onChange={v => setAccount({ ...account, city: v })} />
                  <Field label="State" value={account.state} onChange={v => setAccount({ ...account, state: v })} />
                  <Field label="Zip" value={account.zip} onChange={v => setAccount({ ...account, zip: v })} />
                  <Field label="County" value={account.county} onChange={v => setAccount({ ...account, county: v })} />
                  <Field label="NAIC" value={account.naic} onChange={v => setAccount({ ...account, naic: v })} />
                </Grid>
              </PrefillCard>

              <PrefillCard icon={Shield} title="Policy & Coverage" tag="extracted from prior DEC + UE rating sheet">
                <Grid>
                  <Field label="Effective Date" value={policy.effectiveDate} onChange={v => setPolicy({ ...policy, effectiveDate: v })} />
                  <Field label="Expiry Date" value={policy.expiryDate} onChange={v => setPolicy({ ...policy, expiryDate: v })} />
                  <Field label="Expiring Premium" value={policy.expiringPremium} onChange={v => setPolicy({ ...policy, expiringPremium: v })} />
                  <Field label="Expiring Carrier" value={policy.expiringCarrier} onChange={v => setPolicy({ ...policy, expiringCarrier: v })} />
                  <Field label="SIR · Per Occurrence" value={policy.sirPerOcc} onChange={v => setPolicy({ ...policy, sirPerOcc: v })} />
                  <Field label="SIR · Aggregate" value={policy.sirAggregate} onChange={v => setPolicy({ ...policy, sirAggregate: v })} />
                  <Field label="Territory" value={policy.territory} onChange={v => setPolicy({ ...policy, territory: v })} />
                  <Field label="Product Lines" value={policy.productLines.join(", ")} onChange={v => setPolicy({ ...policy, productLines: v.split(",").map(s => s.trim()).filter(Boolean) })} className="md:col-span-2" />
                </Grid>
              </PrefillCard>

              <PrefillCard icon={User} title="Broker" tag="extracted from broker cover letter">
                <Grid>
                  <Field label="Brokerage" value={broker.brokerage} onChange={v => setBroker({ ...broker, brokerage: v })} className="md:col-span-2" />
                  <Field label="Contact Name" value={broker.contactName} onChange={v => setBroker({ ...broker, contactName: v })} />
                  <Field label="License" value={broker.license} onChange={v => setBroker({ ...broker, license: v })} />
                  <Field label="Email" value={broker.email} onChange={v => setBroker({ ...broker, email: v })} />
                  <Field label="Phone" value={broker.phone} onChange={v => setBroker({ ...broker, phone: v })} />
                  <Field label="Access Level" value={broker.accessLevel} onChange={v => setBroker({ ...broker, accessLevel: v })} className="md:col-span-2" />
                </Grid>
              </PrefillCard>

              <PrefillCard icon={Activity} title="Underwriter Notes" tag="only the underwriter writes here">
                <textarea
                  rows={4}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Anything the broker mentioned verbally, gut-feel observations, special handling instructions…"
                  className="w-full rounded-xl border bg-background px-3 py-2 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all resize-none"
                />
              </PrefillCard>

              <div className="flex items-center justify-between gap-3 pt-1">
                <button onClick={() => setStep(0)} className="h-11 px-5 rounded-full bg-muted hover:bg-muted/70 text-sm font-medium inline-flex items-center gap-1.5">
                  <ChevronLeft className="size-4" /> Re-upload
                </button>
                <button onClick={submitNew}
                  className="h-11 px-6 rounded-full bg-gradient-to-r from-primary to-[#1E40AF] text-white text-sm font-semibold shadow-lg shadow-primary/30 inline-flex items-center gap-2">
                  Create submission <ArrowRight className="size-4" />
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Right column: Required forms checklist + appetite preview */}
        <aside className="space-y-5">
          <RequiredFormsCard tier={tier} docs={docs} />
          <AppetitePreviewCard />
        </aside>
      </div>
    </PageBody>
  );
}

function Dropzone({ tier, setTier, onPick, onDemo, disabled }: { tier: InstitutionTier; setTier: (t: InstitutionTier) => void; onPick: () => void; onDemo: () => void; disabled?: boolean }) {
  const [hover, setHover] = useState(false);
  return (
    <div className="rounded-2xl border bg-card overflow-hidden">
      <div className="px-5 pt-4 pb-3 flex flex-wrap items-center gap-3">
        <div>
          <h3 className="font-display font-bold text-base">Step 1 · Drop the broker's packet</h3>
          <p className="text-xs text-muted-foreground mt-0.5">PDFs, spreadsheets, scanned images — the Companion reads them all.</p>
        </div>
        <div className="ml-auto inline-flex items-center gap-2 text-xs">
          <label className="text-muted-foreground font-medium">Member tier</label>
          <select value={tier} onChange={e => setTier(e.target.value as InstitutionTier)}
            className="h-9 px-3 rounded-full bg-muted/60 text-xs font-semibold focus:outline-none focus:ring-4 focus:ring-primary/10">
            <option value="Public_K12">Public K-12</option>
            <option value="Independent_Charter">Independent / Charter</option>
            <option value="College_LT3000">College &lt; 3,000</option>
            <option value="College_GTE3000">College ≥ 3,000</option>
            <option value="Other">Association / Foundation / Museum</option>
          </select>
        </div>
      </div>

      <div
        onDragOver={e => { e.preventDefault(); setHover(true); }}
        onDragLeave={() => setHover(false)}
        onDrop={e => { e.preventDefault(); setHover(false); onDemo(); }}
        className={cn(
          "m-5 mt-0 relative rounded-2xl border-2 border-dashed transition-all p-10 text-center overflow-hidden dot-grid",
          hover ? "border-primary bg-primary/5" : "border-border",
          disabled && "opacity-60 pointer-events-none",
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
        <div className="relative">
          <div className="mx-auto size-14 rounded-2xl bg-gradient-to-br from-primary to-[#1E40AF] grid place-items-center shadow-xl shadow-primary/30 mb-4">
            <Upload className="size-6 text-white" />
          </div>
          <div className="font-display text-lg font-bold">Drop files here</div>
          <p className="text-sm text-muted-foreground mt-1">or click to browse. We'll match each file against UE's required forms for {tierLabel(tier)}.</p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <button onClick={onPick} className="h-10 px-5 rounded-full bg-foreground text-background text-sm font-semibold inline-flex items-center gap-1.5">
              <Plus className="size-4" /> Choose files
            </button>
            <button onClick={onDemo} className="h-10 px-5 rounded-full bg-muted text-foreground text-sm font-semibold inline-flex items-center gap-1.5">
              <Wand2 className="size-4 text-accent" /> Use demo packet
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DocStatus({ status }: { status: UploadedDoc["status"] }) {
  const map = {
    uploading:     { tone: "bg-primary/15 text-primary",   label: "Uploading…" },
    comprehending: { tone: "bg-accent/20 text-[#7B6217]",  label: "Comprehending…" },
    ready:         { tone: "bg-emerald-100 text-emerald-700", label: "Ready" },
    unrecognized:  { tone: "bg-amber-100 text-amber-700",  label: "Unrecognized" },
  } as const;
  const m = map[status];
  return <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full", m.tone)}>{m.label}</span>;
}

function PrefillBanner({ docCount }: { docCount: number }) {
  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-200/70 bg-gradient-to-r from-emerald-50 to-white p-4 flex items-start gap-3">
      <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
        <CheckCircle2 className="size-5" />
      </div>
      <div className="flex-1">
        <div className="font-display font-bold">Pre-filled from {docCount} documents</div>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          Every value below was extracted from the packet. Edit anything that looks off — only the
          <span className="font-semibold text-foreground"> Underwriter Notes </span>
          field needs your input by default.
        </p>
      </div>
    </motion.div>
  );
}

function PrefillCard({ icon: Icon, title, tag, children }: { icon: any; title: string; tag: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-card overflow-hidden">
      <header className="px-5 py-3.5 border-b flex items-center gap-3 bg-gradient-to-r from-primary/5 to-transparent">
        <div className="size-9 rounded-xl bg-primary/10 grid place-items-center text-primary"><Icon className="size-4" /></div>
        <div className="flex-1">
          <div className="font-display font-bold text-sm">{title}</div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mt-0.5 flex items-center gap-1.5">
            <Sparkles className="size-3 text-accent" /> {tag}
          </div>
        </div>
      </header>
      <div className="p-5">{children}</div>
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{children}</div>;
}

function Field({ label, value, onChange, className }: { label: string; value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold flex items-center gap-1">
        {label}
        <Sparkles className="size-2.5 text-accent" />
      </span>
      <input value={value} onChange={e => onChange(e.target.value)}
        className="mt-1 w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none focus:border-primary/40 focus:ring-4 focus:ring-primary/10 transition-all" />
    </label>
  );
}

function RequiredFormsCard({ tier, docs }: { tier: InstitutionTier; docs: UploadedDoc[] }) {
  const forms = UE_FORMS[tier];
  const matchedCodes = new Set(docs.filter(d => d.matched).map(d => d.matched!.code));
  return (
    <div className="rounded-2xl border bg-card p-5 sticky top-20">
      <div className="flex items-center gap-2">
        <Shield className="size-4 text-primary" />
        <h3 className="font-display font-bold text-sm">UE Forms · {tierLabel(tier)}</h3>
      </div>
      <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">Real UE application packet. Required first, then supplementals.</p>
      <ul className="mt-3 space-y-1.5">
        {forms.map(f => {
          const matched = matchedCodes.has(f.code);
          return (
            <li key={f.code} className={cn(
              "flex items-start gap-2 rounded-lg p-2 text-xs",
              matched ? "bg-emerald-50/70" : f.required ? "bg-amber-50/60" : "bg-muted/40",
            )}>
              <span className={cn("size-5 rounded-full grid place-items-center shrink-0 mt-0.5",
                matched ? "bg-emerald-500 text-white" : f.required ? "bg-amber-500 text-white" : "bg-muted-foreground/30 text-muted-foreground")}>
                {matched ? <CheckCircle2 className="size-3" /> : f.required ? <AlertTriangle className="size-3" /> : <FileText className="size-3" />}
              </span>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-foreground leading-tight">{f.name}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{f.code} · {f.required ? "Required" : "Supplemental"} · {f.productHint}</div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function AppetitePreviewCard() {
  return (
    <div className="rounded-2xl border bg-gradient-to-br from-primary/5 via-card to-accent/5 p-5">
      <div className="flex items-center gap-2">
        <Sparkles className="size-4 text-accent" />
        <h3 className="font-display font-bold text-sm">Pre-screen appetite</h3>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        {[
          { l: "Segment fit", v: "88" },
          { l: "Loss exp.", v: "76" },
          { l: "Geography", v: "84" },
        ].map(x => (
          <div key={x.l} className="rounded-xl bg-card border p-2">
            <div className="font-display text-lg font-bold">{x.v}</div>
            <div className="text-[9px] uppercase tracking-wider text-muted-foreground mt-0.5">{x.l}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-2 text-[11px] text-emerald-800">
        <CheckCircle2 className="size-3 inline mr-1" /> In-appetite — Independent K-12, PNW.
      </div>
    </div>
  );
}

function ComprehensionGlass({ tier, docs, revealed }: { tier: InstitutionTier; docs: UploadedDoc[]; revealed: string[] }) {
  const required = UE_FORMS[tier].filter(f => f.required);
  const findings = [
    ...required.map(r => ({ ok: docs.some(d => d.matched?.code === r.code), label: r.name, sub: docs.some(d => d.matched?.code === r.code) ? "Detected ✓" : "Missing — companion will request" })),
    { ok: true, label: "Loss runs · 6 years", sub: "6 claims · $112K incurred" },
    { ok: true, label: "COPE survey", sub: "38 buildings · 1.42M sq ft" },
    { ok: true, label: "Audited financials FY24", sub: "Operating budget verified" },
  ];
  return (
    <motion.div
      key="comprehension-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] grid place-items-center px-4 bg-[#0B1A6E]/55 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Comprehending the packet"
    >
      {/* Drifting brand-color aurora behind the glass */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-16 size-[420px] rounded-full bg-primary/35 blur-[110px]"
          animate={{ x: [0, 30, -10, 0], y: [0, 20, -10, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-24 -right-10 size-[460px] rounded-full bg-accent/25 blur-[120px]"
          animate={{ x: [0, -24, 16, 0], y: [0, -14, 18, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.98 }}
        transition={{ type: "spring", stiffness: 280, damping: 26 }}
        className="relative w-full max-w-[760px] rounded-3xl overflow-hidden border border-white/15 bg-gradient-to-br from-[#0B1230]/90 via-[#10204e]/85 to-[#0B1230]/90 text-white shadow-[0_40px_120px_-20px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl"
      >
        {/* Glass surface treatment */}
        <div className="absolute inset-0 hero-mesh opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />

        <div className="relative p-7 md:p-8 flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-white/10 backdrop-blur grid place-items-center ring-1 ring-white/30 shrink-0">
            <Sparkles className="size-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl md:text-2xl font-bold">Comprehending the packet</div>
            <p className="text-white/70 text-sm mt-1">Reading every page · matching against UE's {tierLabel(tier)} forms · extracting every field.</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
              {findings.map((f, i) => (
                <AnimatePresence key={i}>
                  {revealed.includes(`f${i}`) && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 18 }}
                      className={cn("flex items-start gap-2 rounded-xl backdrop-blur-xl border px-3 py-2 text-[12px]",
                        f.ok ? "bg-white/85 text-emerald-900 border-white/40" : "bg-amber-50/85 text-amber-900 border-amber-200")}>
                      <span className={cn("size-5 rounded-full grid place-items-center shrink-0 mt-0.5",
                        f.ok ? "bg-emerald-500/25 text-emerald-700" : "bg-amber-500/25 text-amber-700")}>
                        {f.ok ? <CheckCircle2 className="size-3" /> : <AlertTriangle className="size-3" />}
                      </span>
                      <div>
                        <div className="font-semibold leading-tight">{f.label}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">{f.sub}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              ))}
            </div>

            <div className="mt-5 flex items-center gap-2 text-[11px] text-white/70">
              <div className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Reading… we'll surface only what needs your decision.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
