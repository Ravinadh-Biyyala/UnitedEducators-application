import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Reply, Forward, Star, Paperclip, Send, Sparkles, Upload, FileSearch, Wand2, ArrowRight, CheckCircle2 } from "lucide-react";
import { Link } from "wouter";
import { PageBody, SectionTitle, StatusPill } from "@/components/Primitives";
import { INBOX } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { PageRegister } from "@/components/companion/PageRegister";
import { useCompanion, newId, now, type CompanionMsg } from "@/components/companion/CompanionContext";
import { detectIntent, FALLBACK_HELP } from "@/lib/companionNlu";

export function Inbox() {
  const [activeId, setActiveId] = useState(INBOX[0].id);
  const active = INBOX.find(m => m.id === activeId)!;
  const { startJob, jobs } = useCompanion();
  const [comprehended, setComprehended] = useState<Record<string, boolean>>({});

  function comprehendThread() {
    const subShort = active.submissionShort;
    setComprehended(c => ({ ...c, [active.id]: true }));
    startJob({
      id: `inbox-${active.id}`,
      title: `Comprehending ${active.attachments?.length ?? 0} attachment${(active.attachments?.length ?? 0) === 1 ? "" : "s"}`,
      subtitle: `${subShort} · ${active.from}`,
      href: `/submission/${active.submission}`,
      steps: [
        "Reading email body & header metadata…",
        "OCR-scanning attached PDFs…",
        "Matching content against UE form catalog…",
        "Extracting key facts and exposures…",
        "Updating submission record…",
        "Done — submission updated.",
      ],
    });
  }

  const isProcessing = useMemo(() => jobs.some(j => j.id === `inbox-${active.id}` && !j.done), [jobs, active.id]);

  // Drive the glass-modal step reveal while comprehension is running.
  const [glassStep, setGlassStep] = useState(0);
  useEffect(() => {
    if (!isProcessing) { setGlassStep(0); return; }
    setGlassStep(0);
    const total = (active.attachments?.length ?? 0) + 3;
    const ivl = setInterval(() => {
      setGlassStep(s => (s >= total ? s : s + 1));
    }, 380);
    return () => clearInterval(ivl);
  }, [isProcessing, active.id, active.attachments?.length]);

  return (
    <PageBody className="!pt-6 !max-w-[1500px] mx-auto">
      <PageRegister
        routeKey="inbox"
        title="Inbox"
        subtitle={`${INBOX.filter(m => m.unread).length} unread`}
        greeting="I keep your inbox tidy. I can comprehend the active thread's attachments, draft a reply, or jump to its submission."
        suggestions={[
          { id: "comprehend", label: "Comprehend this thread", hint: "Read attachments + extract facts", tone: "blue", icon: "FileSearch" },
          { id: "draft-reply", label: "Draft acknowledgment", hint: "Polite, brand-aligned", tone: "gold", icon: "Wand2" },
          { id: "open-submission", label: `Open ${active.submissionShort}`, hint: active.submission, tone: "violet", icon: "FileText", navigateTo: `/submission/${active.submission}` },
          { id: "missing-docs", label: "What's still missing?", hint: "Required UE forms not yet on file", tone: "red", icon: "AlertTriangle" },
        ]}
        facts={() => {
          const lines = INBOX.map(m =>
            `- [${m.unread ? "UNREAD" : "read"}] "${m.subject}" from ${m.from} (${m.fromOrg}) · ${m.submissionShort} · ${m.time}${m.attachments?.length ? ` · ${m.attachments.length} attachment(s)` : ""}`
          ).join("\n");
          return `Inbox (${INBOX.length} threads, currently viewing "${active.subject}"):\n${lines}`;
        }}
        respond={(sid) => {
          if (sid === "comprehend") {
            comprehendThread();
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Reading "${active.subject}" — I'll surface a card up top with progress, then push the extracted data straight into ${active.submissionShort}.` }];
          }
          if (sid === "draft-reply") {
            return [{ id: newId(), role: "agent", kind: "text", ts: now(),
              text: `Draft ready:\n\n"Hi ${active.from.split(" ")[0]}, thanks for the materials. I've routed them into ${active.submissionShort} and will revert with our quote indication shortly. — Maya"` }];
          }
          if (sid === "missing-docs") {
            return [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
              kind: "checklist", title: "Outstanding required forms",
              items: [
                { ok: false, label: "SIR Actuarial Opinion", sub: "Buffer Excess Liability dependency" },
                { ok: false, label: "Sexual Misconduct Supplemental", sub: "UE standard for residential programs" },
                { ok: true,  label: "All-Lines Application", sub: "Received Mar 15" },
                { ok: true,  label: "Loss Run · 6-yr", sub: "Received Mar 15" },
              ],
            } }];
          }
          return;
        }}
        freeText={(text) => {
          const intent = detectIntent(text);
          const unread = INBOX.filter(m => m.unread);
          const list = (title: string, rows: typeof INBOX, emptyText: string): CompanionMsg[] => rows.length
            ? [{ id: newId(), role: "agent", kind: "viz", ts: now(), viz: {
                kind: "checklist", title,
                items: rows.slice(0, 8).map(m => ({
                  ok: !m.unread, label: m.subject,
                  sub: `${m.from} · ${m.submissionShort} · ${m.time}`,
                })),
              } }]
            : [{ id: newId(), role: "agent", kind: "text", ts: now(), text: emptyText }];

          switch (intent.kind) {
            case "remaining":
              return list(`${unread.length} unread`, unread, "Inbox zero — every thread is read.");
            case "count":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `${INBOX.length} threads · ${unread.length} unread · ${INBOX.filter(m => m.attachments?.length).length} with attachments.` }];
            case "next": {
              const top = unread[0] ?? INBOX[0];
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Open "${top.subject}" from ${top.from} (${top.submissionShort}) — I can comprehend it for you with one tap.` }];
            }
            case "search": {
              const term = intent.term;
              const hits = INBOX.filter(m =>
                [m.subject, m.from, m.fromOrg, m.submission, m.submissionShort, m.preview].join(" ").toLowerCase().includes(term)
              );
              return list(`${hits.length} matches for "${term}"`, hits, `No threads mention "${term}".`);
            }
            case "summary":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(),
                text: `Right now: "${active.subject}" from ${active.from} (${active.submissionShort}). ${active.attachments?.length ? `${active.attachments.length} attachment${active.attachments.length === 1 ? "" : "s"}. ` : ""}Want me to comprehend it?` }];
            case "greeting":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: `Hi. ${unread.length} unread threads waiting.` }];
            case "thanks":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: "Anytime." }];
            case "help":
              return [{ id: newId(), role: "agent", kind: "text", ts: now(), text: FALLBACK_HELP }];
            default:
              return;
          }
        }}
      />

      <SectionTitle
        eyebrow="Workbench"
        title="Inbox"
        sub="Brokers, internal teammates, and the Companion — all in one thread."
      />

      <div className="rounded-2xl border bg-card overflow-hidden grid grid-cols-1 md:grid-cols-[360px_1fr] min-h-[600px]">
        <ul className="border-r divide-y overflow-y-auto scroll-thin max-h-[80vh]">
          {INBOX.map(m => (
            <li key={m.id}>
              <button
                onClick={() => setActiveId(m.id)}
                className={cn(
                  "w-full text-left px-4 py-3.5 hover:bg-muted/50 transition-colors flex gap-3 items-start",
                  activeId === m.id && "bg-primary/5 border-l-2 border-primary"
                )}
              >
                <div className={cn(
                  "size-9 rounded-xl text-white grid place-items-center text-xs font-bold shrink-0",
                  m.category === "system" ? "bg-gradient-to-br from-primary to-accent" :
                  m.category === "internal" ? "bg-gradient-to-br from-primary to-[#1E40AF]" :
                  "bg-gradient-to-br from-amber-500 to-amber-700"
                )}>
                  {m.fromInitials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-sm truncate", m.unread ? "font-bold" : "font-medium text-muted-foreground")}>{m.from}</span>
                    {m.unread && <span className="size-2 rounded-full bg-primary shrink-0" />}
                    <span className="text-[10px] text-muted-foreground ml-auto shrink-0">{m.time}</span>
                  </div>
                  <div className={cn("text-xs mt-0.5 truncate", m.unread ? "font-semibold" : "text-muted-foreground")}>{m.subject}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1">{m.preview}</div>
                  <div className="mt-1.5 flex items-center gap-2">
                    <Link href={`/submission/${m.submission}`} className="text-[10px] font-semibold text-primary hover:underline">{m.submissionShort}</Link>
                    {comprehended[m.id] && <span className="text-[10px] font-semibold text-emerald-700 inline-flex items-center gap-1"><Sparkles className="size-2.5" /> Comprehended</span>}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>

        <motion.div key={active.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
          <header className="px-6 py-5 border-b flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <h2 className="font-display text-xl font-bold">{active.subject}</h2>
                {active.category === "system" && <StatusPill tone="gold" size="sm"><Sparkles className="size-3" /> Companion</StatusPill>}
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{active.from}</span>
                <span>·</span>
                <span>{active.fromOrg}</span>
                <span>·</span>
                <span>{active.time}</span>
              </div>
              <Link href={`/submission/${active.submission}`} className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-primary hover:underline">
                Linked: {active.submissionShort} ({active.submission}) →
              </Link>
            </div>
            <div className="flex items-center gap-1">
              <button className="size-9 rounded-full hover:bg-muted grid place-items-center"><Star className="size-4" /></button>
              <button className="h-9 px-3 rounded-full hover:bg-muted text-sm font-semibold flex items-center gap-1.5"><Reply className="size-4" /> Reply</button>
              <button className="h-9 px-3 rounded-full hover:bg-muted text-sm font-semibold flex items-center gap-1.5"><Forward className="size-4" /> Forward</button>
            </div>
          </header>

          <div className="flex-1 overflow-y-auto scroll-thin px-6 py-6">
            <article className="prose prose-sm max-w-none">
              {active.body.split("\n").map((line, i) => (
                <p key={i} className="text-foreground/90 whitespace-pre-wrap leading-relaxed">{line || "\u00A0"}</p>
              ))}
            </article>

            {active.attachments && active.attachments.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Paperclip className="size-4 text-muted-foreground" />
                    <h3 className="font-display font-bold text-sm">Attachments · {active.attachments.length}</h3>
                  </div>
                  <button
                    onClick={comprehendThread}
                    disabled={isProcessing}
                    className={cn(
                      "h-9 px-4 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-md",
                      isProcessing
                        ? "bg-muted text-muted-foreground"
                        : comprehended[active.id]
                          ? "bg-emerald-500 text-white shadow-emerald-500/30"
                          : "bg-gradient-to-r from-primary to-[#1E40AF] text-white shadow-primary/30 hover:shadow-lg hover:shadow-primary/40",
                    )}
                  >
                    {isProcessing
                      ? <><span className="size-2 rounded-full bg-emerald-400 animate-pulse" /> Comprehending…</>
                      : comprehended[active.id]
                        ? <><Sparkles className="size-3.5 text-white" /> Re-run comprehension</>
                        : <><Upload className="size-3.5" /> Upload &amp; Comprehend</>}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {active.attachments.map(a => (
                    <div key={a.name} className="rounded-xl border p-3 flex items-center gap-3 bg-gradient-to-br from-muted/30 to-transparent group hover:border-primary/30 transition-colors">
                      <div className="size-10 rounded-lg bg-primary/10 grid place-items-center text-primary shrink-0">
                        <Paperclip className="size-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold truncate">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground">{a.size}</div>
                      </div>
                      {comprehended[active.id]
                        ? <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 px-2 py-1 rounded-full bg-emerald-100">Indexed</span>
                        : <button className="text-xs font-semibold text-primary hover:underline opacity-0 group-hover:opacity-100 transition-opacity">Open</button>}
                    </div>
                  ))}
                </div>

                {comprehended[active.id] && !isProcessing && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="mt-4 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50 to-white p-4 flex items-start gap-3"
                  >
                    <div className="size-10 rounded-xl bg-emerald-100 text-emerald-700 grid place-items-center shrink-0">
                      <FileSearch className="size-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-display font-bold text-sm text-foreground">Attachments routed into {active.submissionShort}</div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        Extracted facts have been pushed into the submission record. Documents are indexed and searchable.
                      </p>
                    </div>
                    <Link href={`/submission/${active.submission}`} className="h-9 px-4 rounded-full bg-foreground text-background text-xs font-semibold inline-flex items-center gap-1.5 shrink-0">
                      Open submission <ArrowRight className="size-3.5" />
                    </Link>
                  </motion.div>
                )}
              </div>
            )}
          </div>

          {/* Glass comprehension popup — same aesthetic as New Submission */}
          <AnimatePresence>
            {isProcessing && (
              <InboxComprehensionGlass
                subject={active.subject}
                from={active.from}
                fromOrg={active.fromOrg}
                submissionShort={active.submissionShort}
                attachments={active.attachments ?? []}
                step={glassStep}
              />
            )}
          </AnimatePresence>

          <div className="border-t p-4 bg-muted/20">
            <div className="flex items-end gap-2 rounded-2xl border bg-card p-2 focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/10 transition-all">
              <textarea rows={2} placeholder="Reply to this thread…" className="flex-1 resize-none px-2 py-1.5 bg-transparent text-sm outline-none" />
              <button className="size-10 rounded-xl bg-primary text-white grid place-items-center"><Send className="size-4" /></button>
            </div>
          </div>
        </motion.div>
      </div>
    </PageBody>
  );
}

function InboxComprehensionGlass({
  subject, from, fromOrg, submissionShort, attachments, step,
}: {
  subject: string; from: string; fromOrg: string; submissionShort: string;
  attachments: { name: string; size: string }[]; step: number;
}) {
  const findings = [
    { label: "Reading email body & header metadata", sub: `${from} · ${fromOrg}` },
    ...attachments.map(a => ({ label: `OCR-scanning ${a.name}`, sub: a.size })),
    { label: "Matching content against UE form catalog", sub: "Cross-referencing required forms" },
    { label: `Updating submission ${submissionShort}`, sub: "Extracted facts pushed to record" },
  ];
  return (
    <motion.div
      key="inbox-comprehension-modal"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[90] grid place-items-center px-4 bg-[#0B1A6E]/55 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Comprehending email attachments"
    >
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
        <div className="absolute inset-0 hero-mesh opacity-70 pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_-10%,rgba(255,255,255,0.18),transparent_55%)] pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-accent/50 to-transparent" />

        <div className="relative p-7 md:p-8 flex items-start gap-4">
          <div className="size-12 rounded-2xl bg-white/10 backdrop-blur grid place-items-center ring-1 ring-white/30 shrink-0">
            <Sparkles className="size-6 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-display text-xl md:text-2xl font-bold">Comprehending the email</div>
            <p className="text-white/70 text-sm mt-1 truncate">"{subject}" · {attachments.length} attachment{attachments.length === 1 ? "" : "s"} · routing to {submissionShort}</p>

            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-2">
              {findings.map((f, i) => (
                <AnimatePresence key={i}>
                  {step > i && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0 }}
                      transition={{ type: "spring", stiffness: 240, damping: 18 }}
                      className="flex items-start gap-2 rounded-xl backdrop-blur-xl border bg-white/85 text-emerald-900 border-white/40 px-3 py-2 text-[12px]"
                    >
                      <span className="size-5 rounded-full grid place-items-center shrink-0 mt-0.5 bg-emerald-500/25 text-emerald-700">
                        <CheckCircle2 className="size-3" />
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
              Reading… you'll only be asked about what needs your decision.
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
