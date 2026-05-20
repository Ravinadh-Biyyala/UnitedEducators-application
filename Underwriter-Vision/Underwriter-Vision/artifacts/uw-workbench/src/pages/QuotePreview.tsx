import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Download, Printer, CheckCircle2 } from "lucide-react";
import { PageBody } from "@/components/Primitives";
import { getProfile } from "@/lib/mockData";
import { PageRegister } from "@/components/companion/PageRegister";

export function QuotePreview() {
  const [, params] = useRoute("/submission/:id/quote/preview");
  const id = params?.id ?? "SUB-7829";
  const p = getProfile(id);
  const total = p.coverages.reduce((s, c) => s + parseInt(c.premium.replace(/[^\d]/g, "")), 0);

  return (
    <PageBody className="!pt-6 !max-w-[1100px] mx-auto">
      <PageRegister
        routeKey={`quote-preview:${id}`}
        title={`Quote letter · ${p.institutionName}`}
        subtitle="Ready to send"
        greeting="Final pass before this leaves your inbox. I can re-check signing authority, draft a broker note, or send it directly."
        suggestions={[
          { id: "edit", label: "Back to builder", tone: "blue", icon: "Wand2", navigateTo: `/submission/${id}/quote` },
          { id: "open", label: "Open submission", tone: "violet", icon: "Building2", navigateTo: `/submission/${id}` },
        ]}
      />
      {/* toolbar */}
      <div className="flex items-center justify-between mb-6">
        <Link href={`/submission/${id}/quote`} className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Back to builder</Link>
        <div className="flex items-center gap-2">
          <button className="h-10 px-4 rounded-full border bg-card text-sm font-semibold flex items-center gap-2 hover:bg-muted"><Printer className="size-4" /> Print</button>
          <button className="h-10 px-4 rounded-full border bg-card text-sm font-semibold flex items-center gap-2 hover:bg-muted"><Download className="size-4" /> PDF</button>
          <button className="h-10 px-5 rounded-full bg-primary text-white text-sm font-bold flex items-center gap-2 shadow-lg shadow-primary/30">
            <Send className="size-4" /> Send to broker
          </button>
        </div>
      </div>

      {/* The "letter" */}
      <motion.article
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-card shadow-xl ring-1 ring-border overflow-hidden"
      >
        <div className="hero-mesh px-10 py-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-display text-2xl font-bold">United Educators</div>
              <div className="text-xs text-white/70 mt-1 tracking-widest uppercase">Quote · Indication</div>
            </div>
            <div className="text-right text-xs text-white/80">
              <div>Quote ref · QT-2024-{id.replace("SUB-", "")}</div>
              <div>Issued · April 18, 2026</div>
              <div>Valid until · May 18, 2026</div>
            </div>
          </div>
        </div>

        <div className="p-10 space-y-8">
          <section>
            <h2 className="font-display text-2xl font-bold">{p.institutionName}</h2>
            <p className="text-sm text-muted-foreground">{p.memberType} · {p.enrollment} · {p.location}</p>
            <p className="text-sm text-muted-foreground">Member #{p.memberNumber} · Member since {p.memberSince}</p>
            <p className="text-sm text-muted-foreground mt-2">Broker · {p.brokerage} ({p.brokerContact})</p>
          </section>

          <section className="grid grid-cols-3 gap-4">
            {[
              { l: "Effective", v: p.effectiveDate },
              { l: "Expiration", v: p.expiryDate },
              { l: "Underwriter", v: p.underwriter.name },
            ].map(s => (
              <div key={s.l} className="rounded-xl border p-4 bg-muted/30">
                <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{s.l}</div>
                <div className="font-semibold mt-1">{s.v}</div>
              </div>
            ))}
          </section>

          <section>
            <h3 className="font-display text-lg font-bold mb-3">Coverage summary</h3>
            <table className="w-full text-sm">
              <thead className="text-[10px] uppercase tracking-wider text-muted-foreground border-b">
                <tr><th className="text-left py-2">Coverage</th><th className="text-right py-2">Limit</th><th className="text-right py-2">Aggregate</th><th className="text-right py-2">Retention</th><th className="text-right py-2">Premium</th></tr>
              </thead>
              <tbody>
                {p.coverages.map(c => (
                  <tr key={c.name} className="border-b">
                    <td className="py-3 font-semibold">{c.name}</td>
                    <td className="py-3 text-right font-mono-tabular">{c.limit}</td>
                    <td className="py-3 text-right font-mono-tabular">{c.aggregateLimit}</td>
                    <td className="py-3 text-right font-mono-tabular">{c.retention}</td>
                    <td className="py-3 text-right font-mono-tabular font-semibold">{c.premium}</td>
                  </tr>
                ))}
                <tr className="bg-primary/5 border-t-2 border-primary">
                  <td className="py-4 font-bold text-primary">Total Annual Premium</td>
                  <td colSpan={3}></td>
                  <td className="py-4 text-right font-display font-bold text-primary text-2xl">${total.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border bg-emerald-50/40 border-emerald-200 p-5">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="size-5 text-emerald-700" />
              <span className="font-display font-bold text-emerald-900">Quote is in appetite — ready for broker delivery</span>
            </div>
            <p className="text-sm text-emerald-800">
              Companion has verified all required documents are present and the quote is within standard authority.
              Hit send to deliver this indication to {p.brokerContact} at {p.brokerage}.
            </p>
          </section>

          <footer className="border-t pt-6 text-xs text-muted-foreground">
            <p>This indication is preliminary and subject to receipt of complete underwriting information, satisfactory inspection results, and final pricing committee approval. Coverage is subject to all terms, conditions, and exclusions of the policy form.</p>
          </footer>
        </div>
      </motion.article>
    </PageBody>
  );
}
