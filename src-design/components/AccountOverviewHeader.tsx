import { useMemo, type ReactNode } from "react";
import {
  History, AlertTriangle, Building2, Trophy, Home,
  Check, Users,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   AccountOverviewHeader
   ──────────────────────────────────────────────────────────────────────────────
   Single unified header for a submission. Replaces what used to be two stacked
   panels (a "global account" strip + a separate hero row) — that pair leaked
   the same metadata twice (Member Since · since 2014, Institution Type · Private
   K-12) and the visual break made the page feel choppy.

   The merged structure is:

     Row 1 · Identity            institution name + SUB chip + M chip
                                 + group pill + stage dropdown slot
     Row 2 · Sub-identity        enrollment · location (small, muted)
     Row 3 · Risk + segmentation Member-since + Continuous-coverage chip
                                 + Institution Type + Athletics + Housing

   The stage dropdown lives in SubmissionDetail (where the stage state is
   owned). It's injected through the `stageSlot` prop so this header stays
   layout-only and doesn't need to import the dropdown.

   The account-wide cascade toggles (Member Benefits + Notifications) used
   to render here as a fourth row, but were merged into the
   "Show/Hide Submission Details" utility strip in SubmissionDetail so the
   page only has one row of chrome between the header and the workspace.
   The `CompactToggle` pill switch is still defined (and exported) below so
   the parent can reuse it.
   ────────────────────────────────────────────────────────────────────────── */

const N   = "#0123D4";
const G   = "#C9A227";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

export interface AccountOverviewData {
  /* ─ Identity ─ */
  institutionName: string;
  subId: string;
  memberNumber: string;
  isGroup?: boolean;
  groupMemberCount?: number;

  /* ─ Sub-identity ─ */
  enrollment: string;
  location: string;

  /* ─ Risk Continuity ─ */
  memberSince: string;
  continuousCoverage: boolean;
  /** Free-text description shown in the warning chip when there's a gap. */
  coverageGap?: string;

  /* ─ Segmentation / High-Risk ─ */
  institutionType: string;
  hasFootball: boolean;
  isBoarding: boolean;
}

interface Props {
  data: AccountOverviewData;
  /** The stage dropdown is owned by SubmissionDetail — injected as a slot. */
  stageSlot?: ReactNode;
}

/* ── Small inline badge primitive ────────────────────────────────────────── */
function Badge({
  icon, label, tone,
}: {
  icon: ReactNode;
  label: string;
  tone: "blue" | "amber" | "violet" | "slate" | "emerald";
}) {
  const palette: Record<typeof tone, { bg: string; color: string; border: string }> = {
    blue:    { bg: "#EFF6FF", color: "#1D4ED8", border: "#DBEAFE" },
    amber:   { bg: "#FEF3C7", color: "#92400E", border: "#FDE68A" },
    violet:  { bg: "#F5F3FF", color: "#5B21B6", border: "#DDD6FE" },
    slate:   { bg: "#F1F5F9", color: "#334155", border: "#E2E8F0" },
    emerald: { bg: "#DCFCE7", color: "#166534", border: "#86EFAC" },
  };
  const p = palette[tone];
  return (
    <span
      className="inline-flex items-center gap-1.5"
      style={{
        background: p.bg, color: p.color, border: `1px solid ${p.border}`,
        fontSize: "0.74rem", fontWeight: 600, lineHeight: 1.2,
        padding: "4px 10px", borderRadius: 9999, whiteSpace: "nowrap",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

/* ── Compact pill switch — used for the cascade toggles ──────────────────── */
export function CompactToggle({
  icon, label, value, onToggle, title,
}: {
  icon: ReactNode;
  label: string;
  value: boolean;
  onToggle: () => void;
  /** Optional native tooltip — useful for explaining cascade behaviour. */
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={value}
      title={title}
      className="inline-flex items-center gap-2 transition-colors hover:bg-white"
      style={{
        background: "white",
        border: `1px solid ${value ? `${N}33` : BDL}`,
        borderRadius: 9999,
        padding: "4px 6px 4px 11px",
        cursor: "pointer",
        fontFamily: font,
        boxShadow: value ? `0 1px 2px ${N}10` : "none",
      }}
    >
      <span style={{ display: "inline-flex", color: value ? N : "#64748B" }}>
        {icon}
      </span>
      <span style={{ fontSize: "0.78rem", fontWeight: 600, color: TD, lineHeight: 1 }}>
        {label}
      </span>
      {/* iOS-style switch track */}
      <span
        aria-hidden
        style={{
          display: "inline-flex", alignItems: "center",
          width: 30, height: 16, borderRadius: 9999,
          background: value ? "#22C55E" : "#CBD5E1",
          padding: 1, transition: "background 0.18s",
          marginLeft: 2,
        }}
      >
        <span
          style={{
            width: 14, height: 14, borderRadius: "50%",
            background: "white",
            transform: value ? "translateX(14px)" : "translateX(0)",
            transition: "transform 0.18s",
            boxShadow: "0 1px 2px rgba(0,0,0,0.18)",
          }}
        />
      </span>
    </button>
  );
}

export function AccountOverviewHeader({ data, stageSlot }: Props) {
  const yearsCovered = useMemo(() => {
    const startYear = parseInt(String(data.memberSince).slice(0, 4), 10);
    if (!startYear || Number.isNaN(startYear)) return null;
    return new Date().getFullYear() - startYear;
  }, [data.memberSince]);

  return (
    <section aria-label="Account overview" style={{ background: "white", fontFamily: font }}>
      {/* ── Main content ──────────────────────────────────────────────── */}
      <div style={{ padding: "16px 20px" }}>

        {/* Row 1 · Identity + Stage ───────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1
                style={{
                  fontSize: "1.25rem", fontWeight: 800, color: TD,
                  lineHeight: 1.2, letterSpacing: "-0.005em",
                }}
              >
                {data.institutionName}
              </h1>
              {/* Submission ID chip — gold */}
              <span
                style={{
                  background: `${G}18`, color: "#8A5C00", border: `1px solid ${G}55`,
                  fontSize: "0.68rem", fontWeight: 800, letterSpacing: "0.1em",
                  padding: "2px 10px", borderRadius: 6,
                  textTransform: "uppercase", whiteSpace: "nowrap",
                }}
              >
                {data.subId}
              </span>
              {/* Member number chip — brand blue */}
              <span
                style={{
                  background: `${N}10`, color: TD, border: `1px solid ${N}25`,
                  fontSize: "0.72rem", fontWeight: 700,
                  padding: "2px 8px", borderRadius: 6, whiteSpace: "nowrap",
                }}
              >
                M {data.memberNumber}
              </span>
              {/* Group pill — only on multi-member submissions */}
              {data.isGroup && (
                <span
                  className="inline-flex items-center gap-1.5"
                  style={{
                    background: "#7B2FBE15", color: "#7B2FBE",
                    border: "1px solid #7B2FBE40",
                    fontSize: "0.66rem", fontWeight: 800,
                    letterSpacing: "0.08em", textTransform: "uppercase",
                    padding: "2px 9px", borderRadius: 6, whiteSpace: "nowrap",
                  }}
                  title={`Group submission · ${data.groupMemberCount ?? 0} members`}
                >
                  <Users size={11} />
                  Group · {data.groupMemberCount ?? "?"}
                </span>
              )}
            </div>

            {/* Row 2 · Sub-identity — quiet, single line. We deliberately
                dropped "Institution Type" and "since YYYY" from this
                line — the Type lives as a badge below, and the year lives
                in the Risk Continuity chip — so each fact only appears
                once on the page. */}
            <p
              style={{
                color: TM, fontSize: "0.82rem", marginTop: 4,
                lineHeight: 1.3, fontWeight: 500,
              }}
            >
              {data.enrollment} · {data.location}
            </p>
          </div>

          {/* Stage dropdown — owned by the parent (it holds the stage state). */}
          {stageSlot && (
            <div className="shrink-0" style={{ minWidth: 240 }}>
              {stageSlot}
            </div>
          )}
        </div>

        {/* Row 3 · Risk Continuity + Segmentation badges ───────────────
            One flex-wrap row of chips so the underwriter can scan the
            whole "what is this member" snapshot in a single glance. */}
        <div className="flex items-center gap-2 flex-wrap" style={{ marginTop: 14 }}>
          {/* Risk continuity — composite chip (icon + member-since + years) */}
          <span
            className="inline-flex items-center gap-1.5"
            style={{
              background: `${N}08`, border: `1px solid ${N}22`,
              padding: "4px 10px", borderRadius: 9999,
              fontSize: "0.74rem", fontWeight: 600, color: TD,
              whiteSpace: "nowrap",
            }}
          >
            <History size={12} color={N} />
            Member since {data.memberSince}
            {yearsCovered != null && (
              <span style={{ color: TM, fontWeight: 500 }}>
                · {yearsCovered} yr{yearsCovered === 1 ? "" : "s"}
              </span>
            )}
          </span>

          {/* Continuous coverage state — green when clean, amber when gap */}
          {data.continuousCoverage ? (
            <Badge
              tone="emerald"
              icon={<Check size={11} strokeWidth={3} />}
              label="Continuous coverage"
            />
          ) : (
            <Badge
              tone="amber"
              icon={<AlertTriangle size={11} />}
              label={`Coverage gap${data.coverageGap ? `: ${data.coverageGap}` : ""}`}
            />
          )}

          {/* Institution type — spec wants this surfaced as a badge. */}
          <Badge
            tone="blue"
            icon={<Building2 size={11} />}
            label={data.institutionType}
          />

          {data.hasFootball && (
            <Badge
              tone="amber"
              icon={<Trophy size={11} />}
              label="Athletics Risk · Football"
            />
          )}

          {data.isBoarding && (
            <Badge
              tone="violet"
              icon={<Home size={11} />}
              label="Housing Risk · Boarding"
            />
          )}
        </div>
      </div>

      {/* Cascade toggles now render on the same line as the
          "Show/Hide Submission Details" row in SubmissionDetail —
          see CompactToggle (exported) + this file's CSS-in-JS pill switch. */}
    </section>
  );
}
