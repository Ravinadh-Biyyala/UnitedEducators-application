import { motion } from "framer-motion";
import { ArrowLeft, CheckCircle2, UploadCloud, ShieldAlert, BarChart, CreditCard, ChevronRight, Activity, Users, FileText } from "lucide-react";
import { Link, useParams } from "wouter";
import { useState } from "react";
import { OverviewSection } from "../components/submission/OverviewSection";
import { RiskSection } from "../components/submission/RiskSection";
import { LossSection } from "../components/submission/LossSection";
import { RatingSection } from "../components/submission/RatingSection";
import { CorrespondenceSection } from "../components/submission/CorrespondenceSection";
import { AuditSection } from "../components/submission/AuditSection";
import { DocumentUploadModal } from "../components/upload/DocumentComprehensionModal";

export function SubmissionDetail() {
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState("overview");
  const [showUploadModal, setShowUploadModal] = useState(false);

  const sections = [
    { id: "overview", label: "Overview", icon: FileText },
    { id: "risk", label: "Risk & COPE", icon: ShieldAlert },
    { id: "loss", label: "Loss Analysis", icon: BarChart },
    { id: "rating", label: "Rating & Quote", icon: CreditCard },
    { id: "correspondence", label: "Correspondence & Tasks", icon: Users },
    { id: "audit", label: "Audit Trail", icon: Activity },
  ];

  return (
    <div className="min-h-full flex flex-col bg-background relative">
      <div className="bg-white/80 backdrop-blur-xl border-b border-border sticky top-0 z-20 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/submissions" className="p-2 text-muted-foreground hover:bg-secondary rounded-full transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{id || "SUB-10428"}</span>
              <span className="px-2 py-0.5 bg-brand-blue/10 text-brand-blue rounded text-xs font-semibold">Underwriting</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Riverside Unified School District</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/80 transition-colors text-sm font-medium">
            Decline
          </button>
          <button className="px-4 py-2 bg-brand-gold text-white rounded-lg hover:bg-brand-gold-dark transition-colors text-sm font-bold shadow-sm">
            Generate Quote
          </button>
        </div>
      </div>

      <div className="bg-white px-8 py-6 border-b border-border">
        <div className="max-w-4xl mx-auto flex items-center justify-between relative">
          <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-secondary -z-10" />
          {[
            { label: "Intake", status: "done" },
            { label: "Triage", status: "done" },
            { label: "Underwriting", status: "active" },
            { label: "Quote", status: "pending" },
            { label: "Decision", status: "pending" },
            { label: "Bind", status: "pending" }
          ].map((step, i) => (
            <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                step.status === 'done' ? 'bg-brand-blue border-brand-blue text-white' :
                step.status === 'active' ? 'bg-white border-brand-blue text-brand-blue' :
                'bg-white border-border text-muted-foreground'
              }`}>
                {step.status === 'done' ? <CheckCircle2 size={16} /> : <span className="text-sm font-bold">{i + 1}</span>}
              </div>
              <span className={`text-xs font-semibold uppercase tracking-wider ${
                step.status === 'active' ? 'text-brand-blue' : 'text-muted-foreground'
              }`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex max-w-[1400px] mx-auto w-full py-8 px-8 gap-8">
        <aside className="w-64 shrink-0">
          <div className="sticky top-48 space-y-1">
            {sections.map(s => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={`w-full flex items-center justify-between p-3 rounded-xl transition-all ${
                  activeSection === s.id 
                    ? 'bg-brand-blue text-white shadow-md' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <div className="flex items-center gap-3">
                  <s.icon size={18} />
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
                {activeSection === s.id && <ChevronRight size={16} />}
              </button>
            ))}

            <div className="mt-8 p-4 bg-brand-blue/5 border border-brand-blue/10 rounded-xl">
              <h4 className="text-xs font-bold text-brand-blue uppercase tracking-wider mb-3">AI Agent Actions</h4>
              <div className="space-y-2">
                <button 
                  onClick={() => setShowUploadModal(true)}
                  className="w-full flex items-center gap-2 text-sm text-foreground bg-white border border-border p-2 rounded-lg hover:border-brand-blue/30 transition-colors shadow-sm"
                >
                  <UploadCloud size={14} className="text-brand-blue" /> Parse New Doc
                </button>
                <button className="w-full flex items-center gap-2 text-sm text-foreground bg-white border border-border p-2 rounded-lg hover:border-brand-blue/30 transition-colors shadow-sm">
                  <ShieldAlert size={14} className="text-brand-blue" /> Run Checks
                </button>
              </div>
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0 pb-32">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {activeSection === "overview" && <OverviewSection />}
            {activeSection === "risk" && <RiskSection />}
            {activeSection === "loss" && <LossSection />}
            {activeSection === "rating" && <RatingSection />}
            {activeSection === "correspondence" && <CorrespondenceSection />}
            {activeSection === "audit" && <AuditSection />}
          </motion.div>
        </main>
      </div>

      {showUploadModal && <DocumentUploadModal onClose={() => setShowUploadModal(false)} />}
    </div>
  );
}