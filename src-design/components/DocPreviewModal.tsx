import {
  X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight,
  FileText, FileSpreadsheet, CheckCircle2, Clock, AlertCircle,
  Highlighter, Trash2, ChevronDown, ChevronUp, Tag,
} from "lucide-react";
import { createContext, useContext, useState } from "react";

// ─── Public types (exported so DocumentsTab can use them) ─────────────────────

export type HighlightColor = "yellow" | "green" | "blue" | "pink";

export interface HighlightEntry {
  id: string;
  label: string;
  color: HighlightColor;
}

export type DocHighlights = Record<number, HighlightEntry[]>;

type DocStatus = "Verified" | "Pending" | "Missing";

export interface PreviewDoc {
  id: number;
  name: string;
  type: string;
  category: string;
  uploaded: string;
  size: string;
  status: DocStatus;
  required: boolean;
}

// ─── Highlight color palette ──────────────────────────────────────────────────

export const HIGHLIGHT_PALETTE: Record<HighlightColor, {
  bg: string; bgHover: string; border: string; text: string; dot: string; label: string;
}> = {
  yellow: { bg: "#FEF9C3", bgHover: "#FEF08A", border: "#EAB308", text: "#713F12", dot: "#CA8A04", label: "Review"   },
  green:  { bg: "#DCFCE7", bgHover: "#BBF7D0", border: "#22C55E", text: "#14532D", dot: "#16A34A", label: "Approved" },
  blue:   { bg: "#DBEAFE", bgHover: "#BFDBFE", border: "#3B82F6", text: "#1E3A8A", dot: "#2563EB", label: "Note"     },
  pink:   { bg: "#FCE7F3", bgHover: "#FBCFE8", border: "#EC4899", text: "#831843", dot: "#DB2777", label: "Flag"     },
};

// ─── Highlight Context ────────────────────────────────────────────────────────

interface HighlightCtxValue {
  isHighlightMode: boolean;
  activeColor: HighlightColor;
  highlights: HighlightEntry[];
  toggleHighlight: (id: string, label: string) => void;
  getHighlight: (id: string) => HighlightEntry | undefined;
}

const HighlightCtx = createContext<HighlightCtxValue>({
  isHighlightMode: false,
  activeColor: "yellow",
  highlights: [],
  toggleHighlight: () => {},
  getHighlight: () => undefined,
});

const useHighlight = () => useContext(HighlightCtx);

// ─── Section Context (provides section id to child rows) ──────────────────────

const SectionCtx = createContext<string>("");

// ─── Highlightable wrapper ────────────────────────────────────────────────────

function Highlightable({
  hid, label, children, asRow = false,
}: {
  hid: string; label: string; children: React.ReactNode; asRow?: boolean;
}) {
  const [hovered, setHovered] = useState(false);
  const { isHighlightMode, activeColor, toggleHighlight, getHighlight } = useHighlight();
  const entry = getHighlight(hid);
  const palette = HIGHLIGHT_PALETTE[entry?.color ?? activeColor];

  const isActive = !!entry;
  const showHover = isHighlightMode && hovered && !isActive;

  const bg = isActive ? palette.bg : showHover ? palette.bgHover : "transparent";
  const borderLeft = isActive
    ? `3px solid ${palette.border}`
    : isHighlightMode
      ? showHover ? `3px solid ${palette.border}` : "3px solid transparent"
      : "none";

  return (
    <div
      onClick={() => isHighlightMode && toggleHighlight(hid, label)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: bg,
        borderLeft,
        paddingLeft: isHighlightMode || isActive ? 10 : 0,
        borderRadius: asRow ? 4 : 6,
        cursor: isHighlightMode ? "crosshair" : "default",
        transition: "background 0.12s ease, border-left 0.12s ease",
        position: "relative",
      }}
    >
      {isActive && (
        <span
          style={{
            position: "absolute",
            top: 4,
            right: 6,
            fontSize: "0.6rem",
            fontWeight: 700,
            background: palette.border,
            color: "white",
            borderRadius: 20,
            padding: "1px 7px",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
            zIndex: 1,
          }}
        >
          {palette.label}
        </span>
      )}
      {children}
    </div>
  );
}

// ─── Section ──────────────────────────────────────────────────────────────────

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  const { isHighlightMode, activeColor, toggleHighlight, getHighlight } = useHighlight();
  const [hovered, setHovered] = useState(false);
  const entry = getHighlight(id);
  const palette = HIGHLIGHT_PALETTE[entry?.color ?? activeColor];
  const isActive = !!entry;
  const showHover = isHighlightMode && hovered && !isActive;

  return (
    <SectionCtx.Provider value={id}>
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: isActive ? palette.bg : showHover ? palette.bgHover + "66" : "transparent",
          border: isActive
            ? `1.5px solid ${palette.border}55`
            : isHighlightMode
              ? `1.5px dashed ${showHover ? palette.border : "#D1D5DB"}`
              : "1.5px solid transparent",
          borderRadius: 8,
          padding: isHighlightMode || isActive ? "12px 14px" : "0",
          transition: "all 0.12s ease",
          cursor: "default",
        }}
      >
        {/* Section title bar — clickable to highlight whole section */}
        {title && (
          <div
            onClick={() => isHighlightMode && toggleHighlight(id, title)}
            className="flex items-center justify-between"
            style={{
              marginBottom: "0.75rem",
              paddingBottom: "0.5rem",
              borderBottom: `1px solid ${isActive ? palette.border + "44" : "#DCE3EC"}`,
              cursor: isHighlightMode ? "crosshair" : "default",
            }}
          >
            <h3
              style={{
                fontSize: "0.72rem",
                fontWeight: 700,
                color: isActive ? palette.text : "#1A2B5F",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
              }}
            >
              {title}
            </h3>
            {isActive ? (
              <span
                style={{
                  fontSize: "0.62rem",
                  fontWeight: 700,
                  background: palette.border,
                  color: "white",
                  borderRadius: 20,
                  padding: "2px 9px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                }}
              >
                ● {palette.label}
              </span>
            ) : isHighlightMode ? (
              <span style={{ fontSize: "0.62rem", color: "#9CA3AF", fontStyle: "italic" }}>
                click to highlight section
              </span>
            ) : null}
          </div>
        )}
        {children}
      </div>
    </SectionCtx.Provider>
  );
}

// ─── TwoCol ──────────────────────────────────────────────────────────────────

function TwoCol({ rows }: { rows: [string, string][] }) {
  const sectionId = useContext(SectionCtx);
  return (
    <div className="grid grid-cols-1 gap-0.5">
      {rows.map(([label, value], i) => (
        <Highlightable key={i} hid={`${sectionId}-field-${i}`} label={label} asRow>
          <div
            className="flex justify-between items-start gap-4 py-2 px-1"
            style={{ borderBottom: "1px solid #F9FAFB" }}
          >
            <span style={{ fontSize: "0.78rem", color: "#6B7280", flexShrink: 0, minWidth: 180 }}>{label}</span>
            <span style={{ fontSize: "0.8rem", fontWeight: 600, color: "#111827", textAlign: "right" }}>{value}</span>
          </div>
        </Highlightable>
      ))}
    </div>
  );
}

// ─── TablePreview ─────────────────────────────────────────────────────────────

function TablePreview({ headers, rows, totalRow }: {
  headers: string[]; rows: string[][]; totalRow?: string[];
}) {
  const sectionId = useContext(SectionCtx);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const { isHighlightMode, activeColor, toggleHighlight, getHighlight } = useHighlight();

  return (
    <div className="overflow-hidden rounded-lg" style={{ border: "1px solid #DCE3EC" }}>
      <table className="w-full" style={{ borderCollapse: "collapse", fontSize: "0.78rem" }}>
        <thead>
          <tr style={{ background: "#F8F9FB" }}>
            {headers.map((h, i) => (
              <th key={i} className="px-3 py-2.5 text-left" style={{ fontWeight: 600, color: "#6B7280", borderBottom: "1px solid #DCE3EC" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const hid = `${sectionId}-row-${i}`;
            const entry = getHighlight(hid);
            const palette = HIGHLIGHT_PALETTE[entry?.color ?? activeColor];
            const isActive = !!entry;
            const showHover = isHighlightMode && hoveredRow === i && !isActive;
            return (
              <tr
                key={i}
                onClick={() => isHighlightMode && toggleHighlight(hid, row[0])}
                onMouseEnter={() => setHoveredRow(i)}
                onMouseLeave={() => setHoveredRow(null)}
                style={{
                  borderTop: "1px solid #F3F4F6",
                  background: isActive ? palette.bg : showHover ? palette.bgHover : "transparent",
                  cursor: isHighlightMode ? "crosshair" : "default",
                  transition: "background 0.1s ease",
                  borderLeft: isActive ? `3px solid ${palette.border}` : showHover ? `3px solid ${palette.border}` : "3px solid transparent",
                }}
              >
                {row.map((cell, j) => (
                  <td key={j} className="px-3 py-2.5" style={{ color: j === 0 ? "#374151" : "#111827", fontWeight: j === 0 ? 400 : 500, position: "relative" }}>
                    {cell}
                    {isActive && j === row.length - 1 && (
                      <span style={{
                        marginLeft: 6, fontSize: "0.58rem", fontWeight: 700,
                        background: palette.border, color: "white",
                        borderRadius: 20, padding: "1px 6px",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                        verticalAlign: "middle",
                      }}>
                        {palette.label}
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
          {totalRow && (
            <tr style={{ borderTop: "2px solid #DCE3EC", background: "#F8F9FB" }}>
              {totalRow.map((cell, j) => (
                <td key={j} className="px-3 py-2.5" style={{ fontWeight: 700, color: "#1A2B5F" }}>{cell}</td>
              ))}
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ─── ChecklistTable ───────────────────────────────────────────────────────────

function ChecklistTable({ rows }: { rows: [string, boolean][] }) {
  const sectionId = useContext(SectionCtx);
  return (
    <div className="space-y-1">
      {rows.map(([label, checked], i) => (
        <Highlightable key={i} hid={`${sectionId}-check-${i}`} label={label} asRow>
          <div
            className="flex items-center justify-between py-2 px-3 rounded-lg"
            style={{ background: checked ? "#F0FDF4" : "#FFF1F2" }}
          >
            <span style={{ fontSize: "0.8rem", color: "#374151" }}>{label}</span>
            {checked
              ? <CheckCircle2 size={15} color="#16A34A" />
              : <div className="flex items-center gap-1"><AlertCircle size={15} color="#DC2626" /><span style={{ fontSize: "0.72rem", color: "#DC2626", fontWeight: 600 }}>No</span></div>
            }
          </div>
        </Highlightable>
      ))}
    </div>
  );
}

// ─── Helper components ────────────────────────────────────────────────────────

function DocHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex items-start justify-between pb-5" style={{ borderBottom: "2px solid #1A2B5F" }}>
      <div>
        <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.1em" }}>Riverside Unified School District</p>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: "#1A2B5F", marginTop: 4, lineHeight: 1.3 }}>{title}</h2>
        <p style={{ fontSize: "0.78rem", color: "#6B7280", marginTop: 4 }}>{subtitle}</p>
      </div>
      <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, background: "#EFF6FF" }}>
        <span style={{ fontSize: "0.65rem", fontWeight: 800, color: "#1A2B5F", textAlign: "center", lineHeight: 1.2 }}>RUSD</span>
      </div>
    </div>
  );
}

function SignatureLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ borderBottom: "1.5px solid #374151", paddingBottom: 6, marginBottom: 4 }}>
        <span style={{ fontSize: "0.85rem", fontStyle: "italic", color: "#374151" }}>{value}</span>
      </div>
      <span style={{ fontSize: "0.68rem", color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.07em" }}>{label}</span>
    </div>
  );
}

// ─── Page content components ──────────────────────────────────────────────────

function PageApplication2024() {
  return (
    <div className="space-y-6">
      <DocHeader title="STANDARD EDUCATION INSURANCE APPLICATION" subtitle="Policy Year: July 1, 2024 – July 1, 2025" />
      <Section id="s1-named-insured" title="SECTION 1 — NAMED INSURED INFORMATION">
        <TwoCol rows={[
          ["Named Insured", "Riverside Unified School District"],
          ["FEIN", "95-6001672"],
          ["Mailing Address", "3380 14th Street, Riverside, CA 92501"],
          ["State of Domicile", "California"],
          ["Entity Type", "California Public School District (K-12)"],
          ["Total Enrollment", "14,200 Students"],
          ["FTE Employees", "4,200"],
          ["Number of Campuses", "34"],
        ]} />
      </Section>
      <Section id="s1-coverages" title="SECTION 2 — COVERAGES REQUESTED">
        <TablePreview
          headers={["Line of Coverage", "Requested Limit", "Current Deductible"]}
          rows={[
            ["General Liability", "$5,000,000 per occ.", "$50,000 SIR"],
            ["Property – Buildings", "$42,000,000", "$50,000"],
            ["Student Accident", "$500,000", "$0"],
            ["Educators Legal Liability", "$3,000,000", "$50,000"],
          ]}
        />
      </Section>
      <Section id="s1-loss-history" title="SECTION 3 — LOSS HISTORY ATTESTATION">
        <p className="doc-para">The named insured certifies that the attached 5-year loss runs are complete and accurate. No material omissions or misrepresentations have been made.</p>
        <div className="mt-3">
          <TwoCol rows={[
            ["Losses in past 5 years?", "Yes — 9 claims totaling $87,200 incurred"],
            ["Open claims?", "2 — CLM-2021-027 (ELL) and CLM-2019-022 (Student Accident)"],
            ["Litigation pending?", "1 claim pending mediation — CLM-2021-027"],
          ]} />
        </div>
      </Section>
      <Section id="s1-signature" title="SECTION 4 — SIGNATURE & CERTIFICATION">
        <p className="doc-para">I, the undersigned, certify that to the best of my knowledge the statements set forth herein are true.</p>
        <div className="grid grid-cols-2 gap-6 mt-4">
          <SignatureLine label="Authorized Signature" value="Dr. Maria Torres" />
          <SignatureLine label="Title" value="Director of Risk Management" />
          <SignatureLine label="Date" value="March 15, 2024" />
          <SignatureLine label="Broker" value="Gallagher Education / James Whitfield" />
        </div>
      </Section>
    </div>
  );
}

function PageSafetyQuestionnaire() {
  return (
    <div className="space-y-6">
      <DocHeader title="SUPPLEMENTAL SAFETY QUESTIONNAIRE" subtitle="Riverside Unified School District — Submission SUB-7829" />
      <Section id="s2-emergency" title="EMERGENCY PREPAREDNESS">
        <ChecklistTable rows={[
          ["Active shooter response plan on file", true],
          ["Drills conducted at least annually", true],
          ["Crisis management team established", true],
          ["Parent/student reunification protocol", true],
          ["Emergency communication system (mass notification)", true],
        ]} />
      </Section>
      <Section id="s2-physical" title="PHYSICAL SECURITY">
        <ChecklistTable rows={[
          ["24/7 security personnel at all campuses", true],
          ["CCTV coverage at all campuses", false],
          ["CCTV coverage at main campuses only", true],
          ["Electronic visitor check-in system", true],
          ["Perimeter fencing at all campuses", true],
          ["Single point of entry enforced during school hours", true],
        ]} />
        <p className="doc-para mt-3" style={{ color: "#D97706", fontSize: "0.78rem" }}>
          Note: CCTV coverage is partial — 27 of 34 campuses equipped. Remaining 7 scheduled for Q2 2025.
        </p>
      </Section>
      <Section id="s2-risk-mgmt" title="RISK MANAGEMENT PROGRAMS">
        <ChecklistTable rows={[
          ["Formal safety committee meets quarterly", true],
          ["Annual risk assessment conducted", true],
          ["Workers' compensation safety program active", true],
          ["Student supervision policy documented", true],
          ["Background checks for all staff", true],
          ["Playground safety inspections (annual)", false],
          ["Contractor insurance requirements enforced", true],
        ]} />
      </Section>
      <Section id="s2-notes" title="NOTES">
        <p className="doc-para">Playground safety inspections are conducted informally. District is implementing a formal inspection schedule beginning Fall 2024.</p>
      </Section>
    </div>
  );
}

function PageLossRuns() {
  return (
    <div className="space-y-6">
      <DocHeader title="5-YEAR CERTIFIED LOSS RUNS" subtitle="Policy Period: July 1, 2019 – June 30, 2024 · Certified by Zurich Insurance" />
      <Section id="s5-certificate" title="LOSS RUN CERTIFICATE">
        <p className="doc-para">This document certifies the loss run history for Riverside Unified School District (FEIN: 95-6001672) for the five-year period indicated. All figures as of March 1, 2024.</p>
      </Section>
      <Section id="s5-summary" title="YEAR-BY-YEAR SUMMARY">
        <TablePreview
          headers={["Policy Year", "# Claims", "Paid", "Reserve", "Total Incurred", "Loss Ratio"]}
          rows={[
            ["Jul 2019–Jun 2020", "2", "$16,000", "$2,400", "$18,400", "22.4%"],
            ["Jul 2020–Jun 2021", "1", "$9,100", "$0", "$9,100", "10.6%"],
            ["Jul 2021–Jun 2022", "3", "$24,700", "$3,800", "$24,700", "30.1%"],
            ["Jul 2022–Jun 2023", "2", "$14,300", "$2,200", "$16,500", "19.8%"],
            ["Jul 2023–Jun 2024", "1", "$12,400", "$6,100", "$18,500", "21.9%"],
          ]}
          totalRow={["5-Year Total", "9", "$71,700", "$14,500", "$87,200", "21.0% (avg)"]}
        />
      </Section>
      <Section id="s5-open-claims" title="OPEN CLAIMS">
        <TablePreview
          headers={["Claim ID", "Date of Loss", "Type", "Paid", "Reserve", "Status"]}
          rows={[
            ["CLM-2021-027", "May 9, 2021", "ELL – Wrongful Termination", "$4,700", "$3,800", "Open / Mediation"],
            ["CLM-2019-022", "Oct 5, 2019", "Student Accident – Field Trip", "$7,200", "$2,400", "Open"],
          ]}
        />
      </Section>
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p style={{ fontSize: "0.78rem", color: "#6B7280", lineHeight: 1.6 }}>
          Certified by: <strong>Zurich Insurance Group</strong> · Claims Division · March 1, 2024 —
          "The foregoing is a true and accurate record of all losses reported under the above-referenced policies."
        </p>
      </div>
    </div>
  );
}

function PageFinancial() {
  return (
    <div className="space-y-6">
      <DocHeader title="AUDITED FINANCIAL STATEMENT — FY2023" subtitle="Riverside Unified School District · Fiscal Year Ended June 30, 2023" />
      <Section id="s7-auditor" title="INDEPENDENT AUDITOR'S REPORT">
        <p className="doc-para">To the Board of Education of Riverside Unified School District: We have audited the accompanying financial statements as of June 30, 2023. <strong>In our opinion, the financial statements present fairly, in all material respects, the financial position of the District.</strong></p>
      </Section>
      <Section id="s7-net-position" title="STATEMENT OF NET POSITION (Summary)">
        <TablePreview
          headers={["Category", "FY2023", "FY2022"]}
          rows={[
            ["Total Assets", "$892,400,000", "$874,100,000"],
            ["Total Deferred Outflows", "$48,200,000", "$41,300,000"],
            ["Total Liabilities", "$614,700,000", "$598,400,000"],
            ["Total Deferred Inflows", "$31,100,000", "$28,900,000"],
            ["Net Position (Total)", "$294,800,000", "$288,100,000"],
          ]}
        />
      </Section>
      <Section id="s7-revenue" title="REVENUE SUMMARY">
        <TablePreview
          headers={["Revenue Source", "FY2023 Amount"]}
          rows={[
            ["Local Control Funding Formula (LCFF)", "$298,400,000"],
            ["Federal Grants & Entitlements", "$62,100,000"],
            ["State Categorical Funds", "$41,800,000"],
            ["Local Revenue", "$18,200,000"],
            ["Total Revenue", "$420,500,000"],
          ]}
        />
      </Section>
      <Section id="s7-ratios" title="KEY FINANCIAL RATIOS">
        <TwoCol rows={[
          ["Current Ratio", "2.4 : 1"],
          ["Days Cash on Hand", "47 Days"],
          ["Debt Service Coverage", "1.82x"],
          ["Reserve for Economic Uncertainty", "$31,500,000 (7.5% of budget)"],
        ]} />
      </Section>
    </div>
  );
}

function PagePropertySchedule() {
  return (
    <div className="space-y-6">
      <DocHeader title="PROPERTY SCHEDULE & VALUATIONS" subtitle="Effective Date: July 1, 2024 · Riverside Unified School District" />
      <Section id="s11-summary" title="SCHEDULE SUMMARY">
        <TwoCol rows={[
          ["Total Insured Value (TIV)", "$412,000,000"],
          ["Number of Locations", "34"],
          ["Number of Buildings", "142"],
          ["Total Square Footage", "2,140,000 sq ft"],
          ["Valuation Basis", "Replacement Cost Value (RCV)"],
          ["Last Appraisal Date", "August 2023 — Marshall Valuation Service"],
        ]} />
      </Section>
      <Section id="s11-top5" title="TOP 5 LOCATIONS BY VALUE">
        <TablePreview
          headers={["Location", "Year Built", "Sq. Footage", "Construction", "TIV"]}
          rows={[
            ["Lincoln High School", "1972", "148,000", "Masonry/Steel", "$28,400,000"],
            ["Riverside High School", "1965", "132,000", "Masonry/Steel", "$25,100,000"],
            ["Central Administration Bldg.", "1958", "68,000", "Concrete Frame", "$18,700,000"],
            ["Madison Middle School", "1980", "94,000", "Steel Frame", "$16,400,000"],
            ["Jefferson Elementary", "1942", "52,000", "Wood Frame/Brick", "$9,200,000"],
          ]}
        />
      </Section>
      <Section id="s11-construction" title="CONSTRUCTION & HAZARD SUMMARY">
        <TablePreview
          headers={["Category", "Count", "% of Portfolio"]}
          rows={[
            ["Masonry / Steel Frame", "68 bldgs", "47.9%"],
            ["Concrete Frame", "31 bldgs", "21.8%"],
            ["Steel Frame", "24 bldgs", "16.9%"],
            ["Wood Frame", "19 bldgs", "13.4%"],
            ["Sprinklered Buildings", "134 bldgs", "94.4%"],
            ["Flood Zone X (Low Risk)", "142 bldgs", "100%"],
          ]}
        />
      </Section>
    </div>
  );
}

function PageCertificate() {
  return (
    <div className="space-y-6">
      <div className="text-center py-6" style={{ borderBottom: "2px solid #1A2B5F" }}>
        <p style={{ fontSize: "0.75rem", fontWeight: 600, color: "#6B7280", letterSpacing: "0.15em", textTransform: "uppercase" }}>State of California</p>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#1A2B5F", marginTop: 6 }}>CERTIFICATE OF SELF-INSURANCE</h2>
        <p style={{ fontSize: "0.82rem", color: "#6B7280", marginTop: 4 }}>California Government Code § 990.8</p>
      </div>
      <Section id="s14-body" title="">
        <p className="doc-para">This certifies that <strong>Riverside Unified School District</strong>, a California public school district, is authorized to self-insure its liabilities pursuant to California Government Code Section 990.8.</p>
        <div className="mt-4">
          <TwoCol rows={[
            ["Authorized Entity", "Riverside Unified School District"],
            ["FEIN", "95-6001672"],
            ["Self-Insurance Program", "California Schools Risk Management JPA"],
            ["Program Type", "Joint Powers Authority"],
            ["SIR per Occurrence", "$50,000"],
            ["Annual Aggregate Retention", "$150,000"],
            ["Certificate Issue Date", "July 1, 2023"],
            ["Certificate Expiry", "June 30, 2024"],
          ]} />
        </div>
        <div className="mt-8 grid grid-cols-2 gap-8">
          <SignatureLine label="Authorized by" value="California Dept. of Education" />
          <SignatureLine label="Effective Date" value="July 1, 2023" />
        </div>
      </Section>
    </div>
  );
}

function PageGenericPDF({ name }: { name: string }) {
  return (
    <div className="space-y-6">
      <DocHeader title={name.replace(/\.(pdf|xlsx)$/i, "").toUpperCase()} subtitle="Riverside Unified School District · Submission SUB-7829" />
      <Section id="generic-content" title="DOCUMENT CONTENTS">
        <p className="doc-para">This document has been submitted as part of the insurance application package for Riverside Unified School District (SUB-7829) and is under underwriting review.</p>
        <div className="mt-4 space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-4 rounded" style={{ background: "#F3F4F6", width: `${85 - i * 7}%` }} />
          ))}
        </div>
        <div className="mt-6 space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-4 rounded" style={{ background: "#F3F4F6", width: `${90 - i * 5}%` }} />
          ))}
        </div>
      </Section>
    </div>
  );
}

function PreviewContent({ doc }: { doc: PreviewDoc }) {
  if (doc.id === 1)  return <PageApplication2024 />;
  if (doc.id === 2)  return <PageSafetyQuestionnaire />;
  if (doc.id === 5)  return <PageLossRuns />;
  if (doc.id === 7)  return <PageFinancial />;
  if (doc.id === 11) return <PagePropertySchedule />;
  if (doc.id === 14) return <PageCertificate />;
  return <PageGenericPDF name={doc.name} />;
}

// ─── Status helpers ───────────────────────────────────────────────────────────

const statusMeta = (s: DocStatus) => {
  if (s === "Verified") return { color: "#1A5C30", bg: "#E8F5EC", border: "#93C8A0", icon: <CheckCircle2 size={13} color="#2E7D32" /> };
  if (s === "Pending")  return { color: "#8A5C00", bg: "#FFF8E6", border: "#F0D88A", icon: <Clock size={13} color="#B45309" /> };
  return { color: "#7A1F1F", bg: "#FBEAEA", border: "#E8A8A8", icon: <AlertCircle size={13} color="#B91C1C" /> };
};

const categoryColors: Record<string, { bg: string; text: string }> = {
  Application: { bg: "#E8F0F9", text: "#00427A" },
  Loss:        { bg: "#FFF8E6", text: "#8A5C00" },
  Financial:   { bg: "#E8F5EC", text: "#1A5C30" },
  Property:    { bg: "#F0EEF8", text: "#4A2D80" },
  Compliance:  { bg: "#F0F3F8", text: "#4A5D6E" },
};

// ─── Highlights Panel ─────────────────────────────────────────────────────────

function HighlightsPanel({
  highlights,
  onRemove,
}: {
  highlights: HighlightEntry[];
  onRemove: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  if (highlights.length === 0) return null;
  return (
    <div
      className="shrink-0"
      style={{ borderTop: "1px solid #DCE3EC", background: "#FAFBFC" }}
    >
      {/* Panel header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Tag size={14} color="#D97706" />
          <span style={{ fontSize: "0.78rem", fontWeight: 700, color: "#374151" }}>
            Highlights
          </span>
          <span
            className="px-2 py-0.5 rounded-full"
            style={{ fontSize: "0.68rem", fontWeight: 700, background: "#FEF9C3", color: "#713F12" }}
          >
            {highlights.length}
          </span>
        </div>
        {open ? <ChevronDown size={14} color="#9CA3AF" /> : <ChevronUp size={14} color="#9CA3AF" />}
      </button>

      {/* Panel body */}
      {open && (
        <div className="px-5 pb-4 space-y-1.5 max-h-44 overflow-y-auto">
          {highlights.map((h) => {
            const p = HIGHLIGHT_PALETTE[h.color];
            return (
              <div
                key={h.id}
                className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg"
                style={{ background: p.bg, border: `1px solid ${p.border}33` }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="shrink-0 rounded-full"
                    style={{ width: 8, height: 8, background: p.dot }}
                  />
                  <span style={{ fontSize: "0.78rem", color: p.text, fontWeight: 500 }} className="truncate">
                    {h.label}
                  </span>
                  <span
                    className="shrink-0 px-2 py-0.5 rounded-full"
                    style={{ fontSize: "0.62rem", fontWeight: 700, background: p.border, color: "white" }}
                  >
                    {p.label}
                  </span>
                </div>
                <button
                  onClick={() => onRemove(h.id)}
                  className="shrink-0 p-1 rounded hover:bg-white/60 transition-colors"
                  title="Remove highlight"
                >
                  <X size={12} color={p.text} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Modal ───────────────────────────────────────────────────────────────

const COLORS: HighlightColor[] = ["yellow", "green", "blue", "pink"];

export function DocPreviewModal({
  doc,
  highlights,
  onHighlightsChange,
  onClose,
  onPrev,
  onNext,
  hasPrev,
  hasNext,
}: {
  doc: PreviewDoc;
  highlights: HighlightEntry[];
  onHighlightsChange: (h: HighlightEntry[]) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [zoom, setZoom] = useState(100);
  const [isHighlightMode, setIsHighlightMode] = useState(false);
  const [activeColor, setActiveColor] = useState<HighlightColor>("yellow");

  const sm = statusMeta(doc.status);
  const cc = categoryColors[doc.category] ?? { bg: "#F0F3F8", text: "#4A5D6E" };

  const toggleHighlight = (id: string, label: string) => {
    const exists = highlights.find((h) => h.id === id);
    if (exists) {
      onHighlightsChange(highlights.filter((h) => h.id !== id));
    } else {
      onHighlightsChange([...highlights, { id, label, color: activeColor }]);
    }
  };

  const getHighlight = (id: string) => highlights.find((h) => h.id === id);

  const removeHighlight = (id: string) => onHighlightsChange(highlights.filter((h) => h.id !== id));

  const clearAll = () => onHighlightsChange([]);

  const highlightCtxValue: HighlightCtxValue = {
    isHighlightMode,
    activeColor,
    highlights,
    toggleHighlight,
    getHighlight,
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: "rgba(0,30,60,0.55)", backdropFilter: "blur(3px)" }}
        onClick={onClose}
      />

      {/* Slide-over panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{ width: "min(800px, 92vw)", background: "white", boxShadow: "-8px 0 48px rgba(0,0,0,0.22)", borderLeft: "3px solid #C9A227" }}
      >
        {/* ── Header ── */}
        <div
          className="flex items-start justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: "1px solid #DCE3EC", background: "#0123D4" }}
        >
          <div className="flex items-start gap-3 min-w-0">
            <div
              className="flex items-center justify-center shrink-0 mt-0.5"
              style={{ width: 38, height: 38, background: "rgba(201,162,39,0.2)", border: "1px solid rgba(201,162,39,0.4)" }}
            >
              {doc.type === "XLSX"
                ? <FileSpreadsheet size={18} color="#C9A227" />
                : <FileText size={18} color="#C9A227" />
              }
            </div>
            <div className="min-w-0">
              <p className="truncate" style={{ fontSize: "0.875rem", fontWeight: 700, color: "white", lineHeight: 1.3 }}>{doc.name}</p>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="px-2 py-0.5" style={{ fontSize: "0.64rem", fontWeight: 700, background: cc.bg, color: cc.text, textTransform: "uppercase", letterSpacing: "0.05em" }}>{doc.category}</span>
                <div className="flex items-center gap-1 px-2 py-0.5" style={{ background: sm.bg, border: `1px solid ${sm.border}` }}>
                  {sm.icon}
                  <span style={{ fontSize: "0.64rem", fontWeight: 700, color: sm.color, textTransform: "uppercase", letterSpacing: "0.05em" }}>{doc.status}</span>
                </div>
                {doc.size && <span style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.5)" }}>{doc.size}</span>}
                {doc.uploaded && <span style={{ fontSize: "0.70rem", color: "rgba(255,255,255,0.5)" }}>Uploaded {doc.uploaded}</span>}
                {highlights.length > 0 && (
                  <span
                    className="flex items-center gap-1 px-2 py-0.5"
                    style={{ fontSize: "0.64rem", fontWeight: 700, background: "#FFF8E6", color: "#8A5C00", border: "1px solid #F0D88A" }}
                  >
                    <Highlighter size={10} />
                    {highlights.length} highlight{highlights.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 transition-colors ml-3 shrink-0">
            <X size={18} color="rgba(255,255,255,0.7)" />
          </button>
        </div>

        {/* ── Toolbar ── */}
        <div
          className="flex items-center gap-3 px-5 py-2.5 shrink-0 flex-wrap"
          style={{ borderBottom: "1px solid #DCE3EC", background: "#F0F3F8" }}
        >
          {/* Prev / Next */}
          <div className="flex items-center gap-1">
            <button
              onClick={onPrev}
              disabled={!hasPrev}
              className="flex items-center gap-1 px-2.5 py-1.5 transition-colors disabled:opacity-30"
              style={{ fontSize: "0.72rem", color: "#4A5D6E", background: "white", border: "1px solid #C4CDD8", borderRadius: 6 }}
            >
              <ChevronLeft size={13} /> Prev
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="flex items-center gap-1 px-2.5 py-1.5 transition-colors disabled:opacity-30"
              style={{ fontSize: "0.72rem", color: "#4A5D6E", background: "white", border: "1px solid #C4CDD8", borderRadius: 6 }}
            >
              Next <ChevronRight size={13} />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "#C4CDD8" }} />

          {/* Highlight mode toggle */}
          <button
            onClick={() => setIsHighlightMode((v) => !v)}
            className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
            style={{
              fontSize: "0.75rem",
              fontWeight: 600,
              background: isHighlightMode ? HIGHLIGHT_PALETTE[activeColor].bg : "white",
              color: isHighlightMode ? HIGHLIGHT_PALETTE[activeColor].text : "#1A2530",
              border: isHighlightMode ? `1.5px solid ${HIGHLIGHT_PALETTE[activeColor].border}` : "1.5px solid #C4CDD8",
              boxShadow: isHighlightMode ? `0 0 0 3px ${HIGHLIGHT_PALETTE[activeColor].border}22` : "none",
              borderRadius: 6,
            }}
          >
            <Highlighter size={13} />
            {isHighlightMode ? "Highlighting On" : "Highlight"}
          </button>

          {/* Color swatches */}
          {isHighlightMode && (
            <div className="flex items-center gap-1.5">
              {COLORS.map((color) => {
                const p = HIGHLIGHT_PALETTE[color];
                const isSelected = activeColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => setActiveColor(color)}
                    title={p.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 transition-all"
                    style={{
                      background: isSelected ? p.bg : "transparent",
                      border: isSelected ? `1.5px solid ${p.border}` : "1.5px solid transparent",
                      outline: isSelected ? `2px solid ${p.border}44` : "none",
                      borderRadius: 6,
                    }}
                  >
                    <span
                      style={{ width: 12, height: 12, background: p.dot, display: "block", flexShrink: 0, borderRadius: "50%" }}
                    />
                    {isSelected && (
                      <span style={{ fontSize: "0.7rem", fontWeight: 700, color: p.text }}>{p.label}</span>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Clear all */}
          {highlights.length > 0 && (
            <button
              onClick={clearAll}
              className="flex items-center gap-1.5 px-2.5 py-1.5 hover:bg-red-50 transition-colors"
              style={{ fontSize: "0.72rem", color: "#B91C1C", border: "1px solid #E8A8A8", borderRadius: 6 }}
            >
              <Trash2 size={12} />
              Clear all
            </button>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Zoom */}
          <div className="flex items-center gap-1.5">
            <button onClick={() => setZoom((z) => Math.max(70, z - 10))} className="p-1.5 hover:bg-gray-200 transition-colors">
              <ZoomOut size={13} color="#4A5D6E" />
            </button>
            <span style={{ fontSize: "0.74rem", color: "#1A2530", fontWeight: 700, minWidth: 38, textAlign: "center" }}>{zoom}%</span>
            <button onClick={() => setZoom((z) => Math.min(150, z + 10))} className="p-1.5 hover:bg-gray-200 transition-colors">
              <ZoomIn size={13} color="#4A5D6E" />
            </button>
          </div>

          {/* Divider */}
          <div style={{ width: 1, height: 22, background: "#C4CDD8" }} />

          {/* Download */}
          <button
            className="flex items-center gap-2 px-3.5 py-2 transition-all hover:brightness-95"
            style={{ background: "#C9A227", color: "white", fontSize: "0.78rem", fontWeight: 700, borderRadius: 6 }}
          >
            <Download size={13} />
            Download
          </button>
        </div>

        {/* Highlight hint bar */}
        {isHighlightMode && (
          <div
            className="flex items-center gap-2 px-6 py-2 shrink-0"
            style={{ background: HIGHLIGHT_PALETTE[activeColor].bg, borderBottom: `1px solid ${HIGHLIGHT_PALETTE[activeColor].border}44` }}
          >
            <Highlighter size={13} color={HIGHLIGHT_PALETTE[activeColor].dot} />
            <span style={{ fontSize: "0.75rem", color: HIGHLIGHT_PALETTE[activeColor].text, fontWeight: 500 }}>
              Click on any section title, field row, or table row to highlight it as <strong>{HIGHLIGHT_PALETTE[activeColor].label}</strong>. Click again to remove.
            </span>
          </div>
        )}

        {/* ── Document canvas ── */}
        <div className="flex-1 overflow-y-auto" style={{ background: "#DCE3EC" }}>
          <div className="py-8 px-6 flex justify-center">
            <div
              style={{
                width: "100%",
                maxWidth: 680,
                background: "white",
                boxShadow: "0 2px 20px rgba(0,0,0,0.15)",
                padding: "52px 56px",
                transform: `scale(${zoom / 100})`,
                transformOrigin: "top center",
                minHeight: 820,
              }}
            >
              <style>{`.doc-para { font-size: 0.82rem; color: #4A5D6E; line-height: 1.75; }`}</style>
              <HighlightCtx.Provider value={highlightCtxValue}>
                <PreviewContent doc={doc} />
              </HighlightCtx.Provider>
            </div>
          </div>
        </div>

        {/* ── Highlights Panel ── */}
        <HighlightsPanel highlights={highlights} onRemove={removeHighlight} />
      </div>
    </>
  );
}