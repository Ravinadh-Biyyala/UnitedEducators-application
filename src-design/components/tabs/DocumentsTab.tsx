import { useState } from "react";
import { FileText, FileSpreadsheet, FileBadge, Download, Eye, CheckCircle2, Clock, AlertCircle, Highlighter } from "lucide-react";
import { DocPreviewModal, type PreviewDoc, type HighlightEntry, type DocHighlights, HIGHLIGHT_PALETTE } from "../DocPreviewModal";

// ─── UE tokens ───────────────────────────────────────────────────────────────
const N   = "#0123D4";
const G   = "#C9A227";
const TH  = "#F0F3F8";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";

type DocStatus = "Verified" | "Pending" | "Missing";
interface Doc extends PreviewDoc {}

const docs: Doc[] = [
  // Application
  { id: 1,  name: "Standard Education Application 2024.pdf",    type: "PDF",   category: "Application", uploaded: "Mar 15, 2024", size: "1.2 MB", status: "Verified",  required: true },
  { id: 2,  name: "Supplemental Safety Questionnaire.pdf",      type: "PDF",   category: "Application", uploaded: "Mar 15, 2024", size: "480 KB", status: "Verified",  required: true },
  { id: 3,  name: "Enrollment & Faculty Roster 2023-24.xlsx",   type: "XLSX",  category: "Application", uploaded: "Mar 15, 2024", size: "820 KB", status: "Verified",  required: true },
  { id: 4,  name: "Prior Year Application Response 2023.pdf",   type: "PDF",   category: "Application", uploaded: "Mar 16, 2024", size: "950 KB", status: "Verified",  required: false },
  // Loss
  { id: 5,  name: "5-Year Certified Loss Runs.xlsx",            type: "XLSX",  category: "Loss",        uploaded: "Mar 15, 2024", size: "640 KB", status: "Verified",  required: true },
  { id: 6,  name: "Open Claims Detail Report.pdf",              type: "PDF",   category: "Loss",        uploaded: "Mar 17, 2024", size: "310 KB", status: "Pending",   required: true },
  // Financial
  { id: 7,  name: "Audited Financial Statement FY2023.pdf",     type: "PDF",   category: "Financial",   uploaded: "Mar 16, 2024", size: "3.4 MB", status: "Verified",  required: true },
  { id: 8,  name: "Adopted Budget Report FY2024-25.pdf",        type: "PDF",   category: "Financial",   uploaded: "Mar 16, 2024", size: "1.8 MB", status: "Verified",  required: true },
  { id: 9,  name: "GASB 68 Pension Liability Report.pdf",       type: "PDF",   category: "Financial",   uploaded: "Mar 18, 2024", size: "740 KB", status: "Pending",   required: false },
  { id: 10, name: "Annual Investment Report 2023.pdf",          type: "PDF",   category: "Financial",   uploaded: "",             size: "",        status: "Missing",   required: false },
  // Property
  { id: 11, name: "Property Schedule & Valuations.xlsx",        type: "XLSX",  category: "Property",    uploaded: "Mar 15, 2024", size: "1.1 MB", status: "Verified",  required: true },
  { id: 12, name: "Building Inspection Reports 2023.pdf",       type: "PDF",   category: "Property",    uploaded: "Mar 15, 2024", size: "5.2 MB", status: "Verified",  required: true },
  { id: 13, name: "COPE Survey – Lincoln HS.pdf",               type: "PDF",   category: "Property",    uploaded: "Mar 19, 2024", size: "920 KB", status: "Pending",   required: false },
  // Compliance
  { id: 14, name: "Certificate of Self-Insurance.pdf",          type: "PDF",   category: "Compliance",  uploaded: "Mar 15, 2024", size: "210 KB", status: "Verified",  required: true },
  { id: 15, name: "Safety Committee Minutes 2023.pdf",          type: "PDF",   category: "Compliance",  uploaded: "Mar 16, 2024", size: "390 KB", status: "Verified",  required: false },
  { id: 16, name: "Background Check Policy Statement.pdf",      type: "PDF",   category: "Compliance",  uploaded: "",             size: "",        status: "Missing",   required: true },
];

const categories = ["All", "Application", "Loss", "Financial", "Property", "Compliance"] as const;
type Category = typeof categories[number];

const categoryColors: Record<string, { bg: string; text: string }> = {
  Application: { bg: "#E8F0F9", text: "#00427A" },
  Loss:        { bg: "#FFF8E6", text: "#8A5C00" },
  Financial:   { bg: "#E8F5EC", text: "#1A5C30" },
  Property:    { bg: "#F0EEF8", text: "#4A2D80" },
  Compliance:  { bg: TH,       text: TM         },
};

const statusIcon = (s: DocStatus) => {
  if (s === "Verified") return <CheckCircle2 size={14} color="#2E7D32" />;
  if (s === "Pending")  return <Clock size={14} color="#B45309" />;
  return <AlertCircle size={14} color="#B91C1C" />;
};

const statusStyle = (s: DocStatus) => {
  if (s === "Verified") return { color: "#1A5C30", bg: "#E8F5EC", border: "#93C8A0" };
  if (s === "Pending")  return { color: "#8A5C00", bg: "#FFF8E6", border: "#F0D88A" };
  return { color: "#7A1F1F", bg: "#FBEAEA", border: "#E8A8A8" };
};

const fileIcon = (type: string) => {
  if (type === "XLSX") return <FileSpreadsheet size={15} color="#2E7D32" />;
  if (type === "PDF")  return <FileText size={15} color="#B91C1C" />;
  return <FileBadge size={15} color={TT} />;
};

// Summarise the highlight colors used in a doc as small swatches
function HighlightBadge({ highlights }: { highlights: HighlightEntry[] }) {
  if (!highlights || highlights.length === 0) return null;

  // Unique colors used
  const usedColors = Array.from(new Set(highlights.map((h) => h.color)));

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-0.5"
      style={{
        background: "#FFF8E6",
        border: "1px solid #F0D88A",
        display: "inline-flex",
      }}
    >
      <Highlighter size={10} color="#8A5C00" />
      <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#8A5C00" }}>
        {highlights.length}
      </span>
      {/* Color dots */}
      <div className="flex items-center gap-0.5">
        {usedColors.map((c) => (
          <span
            key={c}
            className="rounded-full"
            style={{ width: 6, height: 6, background: HIGHLIGHT_PALETTE[c].dot }}
            title={HIGHLIGHT_PALETTE[c].label}
          />
        ))}
      </div>
    </div>
  );
}

export function DocumentsTab() {
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [previewDoc, setPreviewDoc] = useState<Doc | null>(null);
  const [allHighlights, setAllHighlights] = useState<DocHighlights>({});

  const filtered    = activeCategory === "All" ? docs : docs.filter((d) => d.category === activeCategory);
  const previewable = docs.filter((d) => d.status !== "Missing");

  const verified = docs.filter((d) => d.status === "Verified").length;
  const pending  = docs.filter((d) => d.status === "Pending").length;
  const missing  = docs.filter((d) => d.status === "Missing").length;

  const openPreview  = (doc: Doc) => setPreviewDoc(doc);
  const closePreview = () => setPreviewDoc(null);

  const navigatePreview = (dir: "prev" | "next") => {
    if (!previewDoc) return;
    const idx  = previewable.findIndex((d) => d.id === previewDoc.id);
    const next = dir === "prev" ? previewable[idx - 1] : previewable[idx + 1];
    if (next) setPreviewDoc(next);
  };

  const previewIdx = previewDoc ? previewable.findIndex((d) => d.id === previewDoc.id) : -1;

  const handleHighlightsChange = (docId: number, highlights: HighlightEntry[]) => {
    setAllHighlights((prev) => ({ ...prev, [docId]: highlights }));
  };

  const totalHighlighted = Object.values(allHighlights).filter((h) => h.length > 0).length;

  return (
    <>
      <div className="space-y-5">

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Verified",           value: verified, color: "#1A5C30", bg: "#E8F5EC", border: "#93C8A0", s: "Verified"  as DocStatus },
            { label: "Pending Review",     value: pending,  color: "#8A5C00", bg: "#FFF8E6", border: "#F0D88A", s: "Pending"   as DocStatus },
            { label: "Missing / Required", value: missing,  color: "#7A1F1F", bg: "#FBEAEA", border: "#E8A8A8", s: "Missing"   as DocStatus },
          ].map((stat, i) => (
            <div key={i} className="px-5 py-4 flex items-center gap-4" style={{ background: stat.bg, border: `1px solid ${stat.border}`, borderTop: `3px solid ${stat.color}` }}>
              {statusIcon(stat.s)}
              <div>
                <p style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>{stat.label}</p>
                <p style={{ fontSize: "1.45rem", fontWeight: 800, color: stat.color, lineHeight: 1.25, marginTop: 2 }}>
                  {stat.value} <span style={{ fontSize: "0.78rem", fontWeight: 500 }}>docs</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Document Table */}
        <div style={{ background: "white", border: `1px solid ${BD}`, borderTop: `3px solid ${N}` }}>
          {/* Filter + highlight summary */}
          <div className="px-5 py-3.5 flex items-center justify-between flex-wrap gap-3" style={{ borderBottom: `1px solid ${BDL}`, background: TH }}>
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className="px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.75rem", fontWeight: 600,
                    background: activeCategory === cat ? N : "white",
                    color:      activeCategory === cat ? "white" : TM,
                    border:     `1px solid ${activeCategory === cat ? N : BD}`,
                    borderRadius: 2,
                  }}
                >
                  {cat} {cat === "All" ? `(${docs.length})` : `(${docs.filter((d) => d.category === cat).length})`}
                </button>
              ))}
            </div>
            {totalHighlighted > 0 && (
              <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: "#FFF8E6", border: `1px solid #F0D88A` }}>
                <Highlighter size={12} color="#8A5C00" />
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#8A5C00" }}>
                  {totalHighlighted} doc{totalHighlighted !== 1 ? "s" : ""} with highlights
                </span>
              </div>
            )}
          </div>

          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: TH }}>
                {["Document", "Category", "Uploaded", "Size", "Status", "Actions"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left" style={{ fontSize: "0.62rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.08em", borderBottom: `1px solid ${BDL}` }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc) => {
                const ss = statusStyle(doc.status);
                const cc = categoryColors[doc.category];
                const docHighlights  = allHighlights[doc.id] ?? [];
                const hasHighlights  = docHighlights.length > 0;

                return (
                  <tr
                    key={doc.id}
                    style={{ borderBottom: `1px solid ${BDL}`, background: hasHighlights ? "#FFFDF4" : "white" }}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* Name */}
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        {fileIcon(doc.type)}
                        <div className="flex flex-col gap-0.5">
                          {doc.status !== "Missing" ? (
                            <button
                              onClick={() => openPreview(doc)}
                              className="text-left transition-colors"
                              style={{ fontSize: "0.82rem", fontWeight: 500, color: "#005B99", textDecoration: "none" }}
                              onMouseEnter={(e) => (e.currentTarget.style.textDecoration = "underline")}
                              onMouseLeave={(e) => (e.currentTarget.style.textDecoration = "none")}
                            >
                              {doc.name}
                            </button>
                          ) : (
                            <p style={{ fontSize: "0.82rem", fontWeight: 500, color: TT }}>{doc.name}</p>
                          )}
                          <div className="flex items-center gap-2">
                            {doc.required && <span style={{ fontSize: "0.62rem", color: "#005B99", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>Required</span>}
                            {hasHighlights && <HighlightBadge highlights={docHighlights} />}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <span className="px-2.5 py-0.5" style={{ fontSize: "0.68rem", fontWeight: 700, background: cc.bg, color: cc.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{doc.category}</span>
                    </td>
                    <td className="px-5 py-3" style={{ fontSize: "0.78rem", color: doc.uploaded ? TM : TT }}>{doc.uploaded || "—"}</td>
                    <td className="px-5 py-3" style={{ fontSize: "0.78rem", color: TT }}>{doc.size || "—"}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1.5 px-2 py-0.5 w-fit" style={{ background: ss.bg, border: `1px solid ${ss.border}` }}>
                        {statusIcon(doc.status)}
                        <span style={{ fontSize: "0.68rem", fontWeight: 700, color: ss.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{doc.status}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      {doc.status !== "Missing" ? (
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openPreview(doc)}
                            className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all hover:brightness-95"
                            style={{
                              border: `1px solid ${hasHighlights ? "#F0D88A" : BD}`,
                              background: hasHighlights ? "#FFF8E6" : "white",
                              borderRadius: 2,
                            }}
                            title="Preview document"
                          >
                            <Eye size={13} color={hasHighlights ? "#8A5C00" : N} />
                            <span style={{ fontSize: "0.70rem", fontWeight: 700, color: hasHighlights ? "#8A5C00" : N }}>Preview</span>
                            {hasHighlights && <Highlighter size={11} color="#8A5C00" />}
                          </button>
                          <button
                            className="p-1.5 transition-colors hover:bg-gray-100"
                            style={{ border: `1px solid ${BD}`, borderRadius: 2 }}
                            title="Download"
                          >
                            <Download size={13} color={TM} />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="px-3 py-1.5 transition-all hover:brightness-95"
                          style={{ fontSize: "0.70rem", fontWeight: 700, background: "#B91C1C", color: "white", borderRadius: 2 }}
                        >
                          Request
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {previewDoc && (
        <DocPreviewModal
          doc={previewDoc}
          highlights={allHighlights[previewDoc.id] ?? []}
          onHighlightsChange={(h) => handleHighlightsChange(previewDoc.id, h)}
          onClose={closePreview}
          onPrev={() => navigatePreview("prev")}
          onNext={() => navigatePreview("next")}
          hasPrev={previewIdx > 0}
          hasNext={previewIdx < previewable.length - 1}
        />
      )}
    </>
  );
}