import { useMemo, useState } from "react";
import {
  FileText, FileSpreadsheet, FileBadge, Download, Eye, CheckCircle2,
  AlertCircle, Folder, FolderOpen, FileStack, Upload, Clock, Search,
  ChevronRight,
} from "lucide-react";
import { DocPreviewModal, type PreviewDoc, type HighlightEntry, type DocHighlights } from "../DocPreviewModal";
import {
  N, BDL, TD, TM, TT, OK, WARN, BAD,
  SectionCard, PrimaryButton, DangerButton, font,
} from "../DashboardCards";

// ─── Types ────────────────────────────────────────────────────────────────────
type DocStatus  = "Uploaded" | "InReview" | "Missing";
type FolderId   = "Shared" | "EPL" | "ELL" | "GL" | "Cyber";
type Category   = "Application" | "Loss" | "Financial" | "Property" | "Compliance" | "Member" | "Broker";

interface Doc {
  id: number;
  name: string;
  type: string;
  category: Category;
  product: FolderId;
  uploaded: string;
  uploadedBy: string;
  size: string;
  status: DocStatus;
  required: boolean;
}

// ─── Folder catalog ───────────────────────────────────────────────────────────
const FOLDERS: { id: FolderId; label: string; sub: string }[] = [
  { id: "Shared", label: "Submission-level",     sub: "Member, broker & shared docs" },
  { id: "EPL",    label: "Employment Practices", sub: "EPL specific documents"       },
  { id: "ELL",    label: "Educators Legal",      sub: "ELL specific documents"       },
  { id: "GL",     label: "General Liability",    sub: "GL specific documents"        },
  { id: "Cyber",  label: "Cyber Liability",      sub: "Cyber specific documents"     },
];

const CATEGORY_ORDER: Category[] = ["Member", "Broker", "Application", "Loss", "Financial", "Property", "Compliance"];

// ─── Mock data ────────────────────────────────────────────────────────────────
const docs: Doc[] = [
  // Submission-level / shared
  { id: 101, name: "ACORD 125 Application 2024.pdf",      type: "PDF",  category: "Application", product: "Shared", uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",    size: "1.4 MB", status: "Uploaded", required: true  },
  { id: 102, name: "Audited Financial Statement FY23.pdf", type: "PDF", category: "Financial",   product: "Shared", uploaded: "Mar 16, 2024", uploadedBy: "T. Owens (Broker)",    size: "2.4 MB", status: "Uploaded", required: true  },
  { id: 103, name: "OFAC Screening Report.pdf",            type: "PDF", category: "Compliance",  product: "Shared", uploaded: "Mar 17, 2024", uploadedBy: "Compliance System",    size: "180 KB", status: "Uploaded", required: true  },
  { id: 104, name: "Member Information Profile.xlsx",      type: "XLSX",category: "Member",      product: "Shared", uploaded: "Mar 15, 2024", uploadedBy: "M. Khanna",            size: "320 KB", status: "InReview", required: true  },
  { id: 105, name: "Broker Correspondence — Quote.msg",    type: "MSG", category: "Broker",      product: "Shared", uploaded: "Mar 18, 2024", uploadedBy: "T. Owens (Broker)",    size: "92 KB",  status: "Uploaded", required: false },
  { id: 106, name: "Prior Carrier Loss Summary.pdf",       type: "PDF", category: "Loss",        product: "Shared", uploaded: "",             uploadedBy: "",                      size: "",       status: "Missing",  required: true  },

  // EPL
  { id: 1,  name: "EPL Application Supplement.pdf",       type: "PDF",  category: "Application", product: "EPL",   uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "820 KB", status: "Uploaded", required: true  },
  { id: 2,  name: "Wage & Hour Practices Survey.xlsx",    type: "XLSX", category: "Application", product: "EPL",   uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "340 KB", status: "Uploaded", required: true  },
  { id: 3,  name: "EPL Loss Runs (5-Year).xlsx",          type: "XLSX", category: "Loss",        product: "EPL",   uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "1.1 MB", status: "InReview", required: true  },
  { id: 5,  name: "EEO Policy Statement.pdf",             type: "PDF",  category: "Compliance",  product: "EPL",   uploaded: "",             uploadedBy: "",                       size: "",       status: "Missing",  required: true  },

  // ELL
  { id: 6,  name: "Educator Liability Application.pdf",     type: "PDF", category: "Application", product: "ELL",   uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "1.2 MB", status: "Uploaded", required: true  },
  { id: 7,  name: "Faculty & Staff Roster 2023-24.xlsx",    type: "XLSX",category: "Application", product: "ELL",   uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "640 KB", status: "Uploaded", required: true  },
  { id: 8,  name: "Title IX Coordinator Certification.pdf",type: "PDF", category: "Compliance",  product: "ELL",   uploaded: "Mar 16, 2024", uploadedBy: "Brookfield HR",          size: "210 KB", status: "Uploaded", required: true  },
  { id: 9,  name: "Sexual Misconduct Policy.pdf",           type: "PDF", category: "Compliance",  product: "ELL",   uploaded: "",             uploadedBy: "",                       size: "",       status: "Missing",  required: true  },

  // GL
  { id: 10, name: "General Liability Application.pdf",    type: "PDF",  category: "Application", product: "GL",    uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "1.4 MB", status: "Uploaded", required: true  },
  { id: 11, name: "COPE Survey — Lincoln HS.pdf",         type: "PDF",  category: "Application", product: "GL",    uploaded: "Mar 17, 2024", uploadedBy: "T. Owens (Broker)",     size: "920 KB", status: "InReview", required: false },
  { id: 12, name: "5-Year GL Loss Runs.xlsx",             type: "XLSX", category: "Loss",        product: "GL",    uploaded: "Mar 15, 2024", uploadedBy: "T. Owens (Broker)",     size: "1.6 MB", status: "Uploaded", required: true  },
  { id: 13, name: "Building Inspection Reports 2023.pdf", type: "PDF",  category: "Property",    product: "GL",    uploaded: "Mar 15, 2024", uploadedBy: "Brookfield Facilities",  size: "5.2 MB", status: "Uploaded", required: true  },
  { id: 14, name: "Property Schedule & Valuations.xlsx",  type: "XLSX", category: "Property",    product: "GL",    uploaded: "",             uploadedBy: "",                       size: "",       status: "Missing",  required: true  },

  // Cyber
  { id: 15, name: "Cyber Risk Questionnaire.pdf",         type: "PDF",  category: "Application", product: "Cyber", uploaded: "Mar 18, 2024", uploadedBy: "T. Owens (Broker)",     size: "780 KB", status: "Uploaded", required: true  },
  { id: 16, name: "IT Security Policy.pdf",               type: "PDF",  category: "Compliance",  product: "Cyber", uploaded: "Mar 18, 2024", uploadedBy: "Brookfield IT",          size: "420 KB", status: "Uploaded", required: true  },
  { id: 17, name: "Data Breach Response Plan.pdf",        type: "PDF",  category: "Compliance",  product: "Cyber", uploaded: "",             uploadedBy: "",                       size: "",       status: "Missing",  required: false },
];

// ─── Style helpers ────────────────────────────────────────────────────────────
const categoryColors: Record<Category, { bg: string; text: string }> = {
  Application: { bg: "#E0E7FF", text: N         },
  Loss:        { bg: "#FFFBEB", text: "#B45309" },
  Financial:   { bg: "#E8F5EC", text: OK        },
  Property:    { bg: "#F0EEF8", text: "#5B21B6" },
  Compliance:  { bg: "#F1F5F9", text: TM        },
  Member:      { bg: "#E0F2FE", text: "#0369A1" },
  Broker:      { bg: "#FEF3C7", text: "#92400E" },
};

const fileIcon = (type: string) => {
  if (type === "XLSX") return <FileSpreadsheet size={15} color={OK}/>;
  if (type === "PDF")  return <FileText size={15} color={BAD}/>;
  return <FileBadge size={15} color={TT}/>;
};

const statusMeta = (s: DocStatus) => {
  if (s === "Uploaded") return { color: OK,   bg: "#E8F5EC", label: "Validated", icon: <CheckCircle2 size={11}/> };
  if (s === "InReview") return { color: WARN, bg: "#FEF3C7", label: "In Review", icon: <Clock        size={11}/> };
  return                       { color: BAD,  bg: "#FEE2E2", label: "Missing",   icon: <AlertCircle  size={11}/> };
};

// Map our internal DocStatus → PreviewDoc's accepted status enum
const previewStatus = (s: DocStatus): "Verified" | "Pending" | "Missing" =>
  s === "Uploaded" ? "Verified" : s === "InReview" ? "Pending" : "Missing";

// ═════════════════════════════════════════════════════════════════════════════
//   DocumentsTab
// ═════════════════════════════════════════════════════════════════════════════
export function DocumentsTab() {
  // Default = first product folder (per spec). Shared sits above it in the list.
  const [selectedFolder, setSelectedFolder] = useState<FolderId>("EPL");
  const [search, setSearch]                 = useState("");
  const [previewDoc, setPreviewDoc]         = useState<Doc | null>(null);
  const [allHighlights, setAllHighlights]   = useState<DocHighlights>({});

  // Folder-level stats + status dot
  const folderStats = useMemo(() => {
    return FOLDERS.map(f => {
      const docsIn   = docs.filter(d => d.product === f.id);
      const uploaded = docsIn.filter(d => d.status === "Uploaded").length;
      const inReview = docsIn.filter(d => d.status === "InReview").length;
      const missing  = docsIn.filter(d => d.status === "Missing").length;
      const missingRequired = docsIn.some(d => d.status === "Missing" && d.required);
      const dot      = missingRequired ? BAD : inReview > 0 ? WARN : missing > 0 ? WARN : OK;
      const statusLabel = missingRequired
        ? "Missing required"
        : inReview > 0
          ? "In review"
          : missing > 0
            ? "Optional missing"
            : "Complete";
      return { ...f, total: docsIn.length, uploaded, inReview, missing, dot, statusLabel };
    });
  }, []);

  // Docs in the selected folder, filtered + grouped by category
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = docs.filter(d => d.product === selectedFolder);
    if (q) list = list.filter(d => d.name.toLowerCase().includes(q));
    return CATEGORY_ORDER
      .map(cat => ({ category: cat, docs: list.filter(d => d.category === cat) }))
      .filter(g => g.docs.length > 0);
  }, [selectedFolder, search]);

  const selectedMeta = folderStats.find(f => f.id === selectedFolder)!;

  // Preview navigation across all previewable docs in the current folder
  const previewable = useMemo(
    () => docs.filter(d => d.product === selectedFolder && d.status !== "Missing"),
    [selectedFolder]
  );
  const previewIdx = previewDoc ? previewable.findIndex(d => d.id === previewDoc.id) : -1;

  const openPreview  = (doc: Doc) => setPreviewDoc(doc);
  const closePreview = () => setPreviewDoc(null);
  const navigatePreview = (dir: "prev" | "next") => {
    if (!previewDoc) return;
    const next = dir === "prev" ? previewable[previewIdx - 1] : previewable[previewIdx + 1];
    if (next) setPreviewDoc(next);
  };
  const handleHighlightsChange = (docId: number, highlights: HighlightEntry[]) => {
    setAllHighlights(prev => ({ ...prev, [docId]: highlights }));
  };

  return (
    <>
      <div className="space-y-5" style={{ fontFamily: font }}>
        <SectionCard
          title="Documents"
          icon={<Folder size={13}/>}
          accent={N}
          noPad
          action={
            <PrimaryButton>
              <Upload size={13}/>
              <span style={{ fontSize: "0.74rem", fontWeight: 700 }}>Upload Document</span>
            </PrimaryButton>
          }>

          {/* Two-pane: folder sidebar + folder content */}
          <div className="flex flex-col lg:flex-row" style={{ minHeight: 480 }}>

            {/* ── Folder sidebar ─────────────────────────────────────────── */}
            <aside
              className="lg:flex-col lg:w-[260px] lg:shrink-0 lg:border-r border-b lg:border-b-0"
              style={{ borderColor: BDL, background: "#FAFBFD" }}>
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible">
                {folderStats.map((f) => {
                  const isSelected = selectedFolder === f.id;
                  const isShared   = f.id === "Shared";
                  return (
                    <button
                      key={f.id}
                      onClick={() => { setSelectedFolder(f.id); setSearch(""); }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedFolder(f.id);
                          setSearch("");
                        }
                      }}
                      aria-current={isSelected ? "true" : undefined}
                      className="text-left lg:w-full shrink-0 lg:shrink transition-all"
                      style={{
                        minWidth: 220,
                        padding: "12px 14px",
                        background: isSelected ? `${N}0D` : "transparent",
                        borderLeft: `3px solid ${isSelected ? N : "transparent"}`,
                        borderRight: `1px solid ${BDL}`,
                        borderBottom: `1px solid ${BDL}`,
                        cursor: "pointer",
                        fontFamily: font,
                      }}
                      onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = "white"; }}
                      onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.background = "transparent"; }}>
                      <div className="flex items-center gap-2.5">
                        <span className="inline-flex items-center justify-center shrink-0"
                          style={{
                            width: 30, height: 30, borderRadius: 6,
                            background: isShared ? `${TM}18` : `${N}12`,
                            color: isShared ? TM : N,
                          }}>
                          {isShared
                            ? <FileStack size={14}/>
                            : isSelected ? <FolderOpen size={14}/> : <Folder size={14}/>}
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p style={{
                              fontSize: "0.78rem", fontWeight: 700, color: TD,
                              lineHeight: 1.2, whiteSpace: "nowrap",
                              overflow: "hidden", textOverflow: "ellipsis",
                            }}>{f.label}</p>
                            <span
                              aria-label={`Folder status: ${f.statusLabel}`}
                              title={f.statusLabel}
                              style={{
                                width: 8, height: 8, borderRadius: "50%",
                                background: f.dot, flexShrink: 0,
                                boxShadow: `0 0 0 2px ${f.dot}22`,
                              }}/>
                          </div>
                          <div className="flex items-center gap-1.5" style={{ marginTop: 2 }}>
                            <span style={{ fontSize: "0.6rem", fontWeight: 700, color: TT }}>
                              {f.total} doc{f.total !== 1 ? "s" : ""}
                            </span>
                            <span style={{ fontSize: "0.6rem", color: TT }}>·</span>
                            <span style={{ fontSize: "0.6rem", color: f.dot, fontWeight: 700 }}>
                              {f.statusLabel}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </aside>

            {/* ── Folder content ─────────────────────────────────────────── */}
            <main className="flex-1 min-w-0">

              {/* Folder header + search */}
              <div className="flex items-center justify-between gap-3 px-5 py-3 flex-wrap"
                style={{ borderBottom: `1px solid ${BDL}`, background: "white" }}>
                <div className="flex items-center gap-2 min-w-0">
                  <span className="inline-flex items-center justify-center shrink-0"
                    style={{
                      width: 28, height: 28, borderRadius: 6,
                      background: selectedFolder === "Shared" ? `${TM}18` : `${N}12`,
                      color: selectedFolder === "Shared" ? TM : N,
                    }}>
                    {selectedFolder === "Shared" ? <FileStack size={13}/> : <FolderOpen size={13}/>}
                  </span>
                  <div className="min-w-0">
                    <p style={{ fontSize: "0.86rem", fontWeight: 700, color: TD, lineHeight: 1.2 }}>
                      {selectedMeta.label}
                    </p>
                    <p style={{ fontSize: "0.66rem", color: TT, marginTop: 1 }}>
                      {selectedMeta.sub} · {selectedMeta.total} document{selectedMeta.total !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5"
                    style={{
                      fontSize: "0.64rem", fontWeight: 700, color: OK,
                      background: "#E8F5EC", padding: "3px 9px", borderRadius: 4,
                    }}>
                    <CheckCircle2 size={11}/> {selectedMeta.uploaded} Validated
                  </span>
                  {selectedMeta.inReview > 0 && (
                    <span className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: "0.64rem", fontWeight: 700, color: WARN,
                        background: "#FEF3C7", padding: "3px 9px", borderRadius: 4,
                      }}>
                      <Clock size={11}/> {selectedMeta.inReview} In Review
                    </span>
                  )}
                  {selectedMeta.missing > 0 && (
                    <span className="inline-flex items-center gap-1.5"
                      style={{
                        fontSize: "0.64rem", fontWeight: 700, color: BAD,
                        background: "#FEE2E2", padding: "3px 9px", borderRadius: 4,
                      }}>
                      <AlertCircle size={11}/> {selectedMeta.missing} Missing
                    </span>
                  )}

                  {/* Search box */}
                  <div className="relative" style={{ minWidth: 200 }}>
                    <Search size={12} color={TT}
                      style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)" }}/>
                    <input
                      type="text"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search in folder…"
                      style={{
                        width: "100%",
                        padding: "6px 10px 6px 26px",
                        fontSize: "0.72rem",
                        border: `1px solid ${BDL}`,
                        borderRadius: 5,
                        background: "white",
                        color: TD,
                        outline: "none",
                        fontFamily: font,
                      }}
                      onFocus={(e) => { e.currentTarget.style.borderColor = N; }}
                      onBlur={(e) => { e.currentTarget.style.borderColor = BDL; }}
                    />
                  </div>
                </div>
              </div>

              {/* Doc grid grouped by category */}
              <div className="px-5 py-4 space-y-4" style={{ background: "white" }}>
                {filteredGroups.length === 0 && (
                  <div className="flex flex-col items-center justify-center gap-2 py-12"
                    style={{ color: TT, fontSize: "0.78rem" }}>
                    <Folder size={28} color={TT}/>
                    <span>No documents in this folder match your search.</span>
                  </div>
                )}

                {filteredGroups.map(group => {
                  const cc = categoryColors[group.category];
                  return (
                    <div key={group.category}>
                      <div className="flex items-center gap-2 mb-2">
                        <span style={{
                          fontSize: "0.6rem", fontWeight: 800,
                          color: cc.text, background: cc.bg,
                          padding: "2px 8px", borderRadius: 3,
                          textTransform: "uppercase", letterSpacing: "0.06em",
                        }}>
                          {group.category}
                        </span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: TT }}>
                          {group.docs.length} doc{group.docs.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-2.5">
                        {group.docs.map(doc => (
                          <DocCard key={doc.id} doc={doc} onPreview={openPreview}/>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </SectionCard>
      </div>

      {previewDoc && (
        <DocPreviewModal
          doc={{ ...previewDoc, status: previewStatus(previewDoc.status) } as PreviewDoc}
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

// ─── DocCard — single document card in the right pane ────────────────────────
function DocCard({ doc, onPreview }: { doc: Doc; onPreview: (d: Doc) => void }) {
  const sm = statusMeta(doc.status);
  const isMissing = doc.status === "Missing";
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: `1px solid ${hover ? `${N}40` : BDL}`,
        borderRadius: 8,
        padding: "10px 12px",
        background: isMissing ? "#FFFBFB" : hover ? "#FAFBFD" : "white",
        boxShadow: hover ? "0 1px 4px rgba(15,23,42,0.06)" : "none",
        transition: "all 0.15s ease",
      }}>
      <div className="flex items-start gap-2.5">
        <span className="inline-flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32, borderRadius: 6, background: "#F4F6FA" }}>
          {fileIcon(doc.type)}
        </span>

        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              {!isMissing ? (
                <button
                  onClick={() => onPreview(doc)}
                  className="text-left hover:underline truncate w-full"
                  style={{
                    fontSize: "0.78rem", fontWeight: 600, color: N,
                    background: "none", border: "none", padding: 0,
                    cursor: "pointer", fontFamily: font,
                  }}>
                  {doc.name}
                </button>
              ) : (
                <span className="truncate block"
                  style={{ fontSize: "0.78rem", fontWeight: 600, color: TT }}>
                  {doc.name}
                </span>
              )}
              <div className="flex items-center gap-2 mt-0.5 flex-wrap"
                style={{ fontSize: "0.66rem", color: TT }}>
                <span style={{ fontWeight: 700 }}>{doc.type}</span>
                {doc.size && <><span>·</span><span style={{ fontVariantNumeric: "tabular-nums" }}>{doc.size}</span></>}
                {doc.uploaded && <><span>·</span><span>{doc.uploaded}</span></>}
                {doc.uploadedBy && <><span>·</span><span>{doc.uploadedBy}</span></>}
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 shrink-0"
              style={{ background: sm.bg, padding: "2px 8px", borderRadius: 4 }}>
              <span style={{ color: sm.color, display: "inline-flex" }}>{sm.icon}</span>
              <span style={{ fontSize: "0.64rem", fontWeight: 700, color: sm.color }}>
                {sm.label}
              </span>
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              {doc.required && (
                <span style={{
                  fontSize: "0.56rem", fontWeight: 800, color: N,
                  background: `${N}10`, padding: "1px 6px", borderRadius: 3,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                }}>
                  Required
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5">
              {!isMissing ? (
                <>
                  <button
                    onClick={() => onPreview(doc)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 transition-colors hover:bg-slate-50"
                    style={{
                      border: `1px solid ${BDL}`, background: "white",
                      borderRadius: 5, cursor: "pointer", fontFamily: font,
                    }}
                    title="Preview document">
                    <Eye size={11} color={N}/>
                    <span style={{ fontSize: "0.66rem", fontWeight: 700, color: N }}>Preview</span>
                  </button>
                  <button
                    className="inline-flex items-center justify-center p-1.5 transition-colors hover:bg-slate-50"
                    style={{
                      border: `1px solid ${BDL}`, borderRadius: 5,
                      background: "white", cursor: "pointer",
                    }}
                    title="Download">
                    <Download size={11} color={TM}/>
                  </button>
                </>
              ) : (
                <DangerButton>
                  <span style={{ fontSize: "0.66rem", fontWeight: 700 }}>Request</span>
                  <ChevronRight size={11}/>
                </DangerButton>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
