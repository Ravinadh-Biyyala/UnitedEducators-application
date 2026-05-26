import { useState } from "react";
import {
  Copy, Check, Mail, Phone, TrendingUp, Calendar,
  FileText, MoreHorizontal, ExternalLink, Award, Building2, Clock,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const N    = "#0123D4";
const BDL  = "#DCE3EC";
const TH   = "#F0F3F8";
const TD   = "#1A2530";
const TM   = "#4A5D6E";
const TT   = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

// Health-dot colors
const OK   = "#15803D";
const WARN = "#D97706";
const BAD  = "#B91C1C";

// ─── CopyButton ────────────────────────────────────────────────────────────────
function CopyButton({ value, hoverReveal = true }: { value: string; hoverReveal?: boolean }) {
  const [copied, setCopied] = useState(false);
  const handle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(value).catch(() => {});
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };
  return (
    <button
      onClick={handle}
      aria-label={copied ? `Copied ${value}` : `Copy ${value}`}
      className={`inline-flex items-center justify-center transition-opacity ${hoverReveal ? "opacity-0 group-hover:opacity-100" : ""}`}
      style={{
        width:22, height:22, marginLeft:6, borderRadius:6,
        background: copied ? "#E8F5EC" : "transparent",
        border:"none", cursor:"pointer", flexShrink:0,
      }}
    >
      {copied
        ? <Check size={12} color={OK} strokeWidth={3}/>
        : <Copy size={12} color={TT}/>}
    </button>
  );
}

// ─── DetailRow ────────────────────────────────────────────────────────────────
function DetailRow({
  label, value, copyValue, last,
}: {
  label: string;
  value: React.ReactNode;
  copyValue?: string;
  last?: boolean;
}) {
  return (
    <div
      className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-slate-50"
      // Fixed row height — without this, an avatar-bearing value (24px tall)
      // makes a DetailRow taller than a plain-text sibling, which means the
      // horizontal hairlines drift between adjacent SectionCard columns
      // (e.g. "Effective" on the left vs "Underwriter" on the right) so the
      // grid stops looking like one consistent table.
      style={{
        borderBottom: last ? "none" : `1px solid ${BDL}`,
        minHeight: 56,
      }}
    >
      <span style={{ fontSize:"0.86rem", color:TT, whiteSpace:"nowrap" }}>
        {label}
      </span>
      <div className="flex items-center min-w-0 justify-end"
        style={{ fontSize:"0.94rem", fontWeight:600, color:TD, textAlign:"right" }}>
        <span className="truncate">{value}</span>
        {copyValue && <CopyButton value={copyValue}/>}
      </div>
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, color = `${N}15`, textColor = N }: {
  name: string; color?: string; textColor?: string;
}) {
  const initials = name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span className="inline-flex items-center justify-center"
      style={{
        width:24, height:24, borderRadius:"50%",
        background:color, color:textColor,
        fontSize:"0.7rem", fontWeight:800,
        marginRight:8, flexShrink:0,
      }}>
      {initials}
    </span>
  );
}

// ─── StatusPill ───────────────────────────────────────────────────────────────
function StatusPill({ label, dotColor, bg, text }: {
  label: string; dotColor: string; bg: string; text: string;
}) {
  return (
    <span className="inline-flex items-center gap-1.5"
      style={{
        background:bg, padding:"3px 10px", borderRadius:9999,
        fontSize:"0.82rem", fontWeight:700, color:text,
      }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:dotColor }}/>
      {label}
    </span>
  );
}

// ─── MiniBar ──────────────────────────────────────────────────────────────────
function MiniBar({ pct, color = N }: { pct: number; color?: string }) {
  return (
    <div style={{
      width:80, height:5, background:BDL, borderRadius:9999, overflow:"hidden",
    }}>
      <div style={{
        width:`${Math.max(0, Math.min(100, pct))}%`, height:"100%",
        background:color, borderRadius:9999,
        transition:"width 0.7s cubic-bezier(0.4,0,0.2,1)",
      }}/>
    </div>
  );
}

// ─── Tag (small inline label, e.g. +7.8%, IN APPETITE) ────────────────────────
function Tag({ children, color, bg }: { children: React.ReactNode; color: string; bg: string }) {
  return (
    <span style={{
      fontSize:"0.72rem", fontWeight:800, color, background:bg,
      padding:"2px 8px", borderRadius:3, letterSpacing:"0.03em",
      textTransform:"uppercase",
    }}>
      {children}
    </span>
  );
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
function SectionCard({
  title, healthDot, action, children,
}: {
  title: string;
  healthDot?: string;
  action?: { icon: React.ReactNode; label: string; href?: string };
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3"
        // Locked header height keeps all SectionCard headers in the same
        // grid row at the same height — even when one title is "MEMBER"
        // and its neighbour is "ROUTING & ASSIGNMENT".
        style={{ borderBottom:`1px solid ${BDL}`, background:"#FAFBFD", minHeight: 52 }}>
        <div className="flex items-center gap-2 min-w-0">
          {healthDot && (
            <span className="rounded-full shrink-0" style={{
              width:8, height:8, background:healthDot,
              boxShadow:`0 0 0 3px ${healthDot}22`,
            }}/>
          )}
          <span style={{
            fontSize:"0.78rem", fontWeight:800, color:TT,
            textTransform:"uppercase", letterSpacing:"0.1em",
            whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis",
          }}>
            {title}
          </span>
        </div>
        {action && (
          <button
            aria-label={action.label}
            className="inline-flex items-center justify-center transition-colors hover:bg-slate-200"
            style={{
              width:26, height:26, borderRadius:6,
              background:"transparent", border:"none", cursor:"pointer", color:TT,
            }}>
            {action.icon}
          </button>
        )}
      </div>
      <div>{children}</div>
    </div>
  );
}

// ─── HeroStat (compact metric chip in main header) ────────────────────────────
function HeroStat({
  label, value, sub, color = TD,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  color?: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2"
      style={{ background:"white", border:`1px solid ${BDL}`, borderRadius:9999 }}>
      <span style={{ fontSize:"0.74rem", color:TT, fontWeight:700,
        textTransform:"uppercase", letterSpacing:"0.06em" }}>
        {label}
      </span>
      <span style={{ fontSize:"0.96rem", fontWeight:800, color }}>{value}</span>
      {sub}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export function SubmissionDetailsCard() {
  return (
    <div style={{
      background:"white",
      border:`1px solid ${BDL}`,
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      fontFamily:font,
    }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap"
        style={{ borderBottom:`1px solid ${BDL}`, background:"#FAFBFD" }}>
        <div className="flex items-center gap-2 group">
          <span className="inline-flex items-center justify-center"
            style={{ width: 30, height: 30, borderRadius: 7, background: `${N}12`, color: N }}>
            <FileText size={16}/>
          </span>
          <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:TD, letterSpacing:"-0.005em" }}>
            Submission Details
          </h3>
          <span style={{
            fontSize:"0.84rem", color:N, fontWeight:700,
            fontFamily:"ui-monospace, SFMono-Regular, Menlo, monospace",
            background:`${N}10`, padding:"3px 10px", borderRadius:9999,
            marginLeft: 4,
          }}>
            SUB-10428
          </span>
          <CopyButton value="SUB-10428" hoverReveal={false}/>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <HeroStat
            label="Need-by"
            value="12d"
            color={BAD}
            sub={<Clock size={14} color={BAD}/>}
          />
          <HeroStat
            label="Approvals"
            value="1/4"
            sub={<MiniBar pct={25} color={N}/>}
          />
          <HeroStat
            label="Risk"
            value="82"
            color={OK}
            sub={<Tag color={OK} bg="#E8F5EC">In appetite</Tag>}
          />
          <button
            className="inline-flex items-center gap-1.5 px-4 py-2 transition-colors hover:brightness-95"
            style={{
              background:N, color:"white", borderRadius:6,
              fontSize:"0.88rem", fontWeight:700, border:"none", cursor:"pointer",
            }}>
            <ExternalLink size={14}/>
            Edit Submission
          </button>
        </div>
      </div>

      {/* ── Row 1 ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderBottom:`1px solid ${BDL}` }}>
        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Identification" healthDot={OK}
            action={{ icon:<MoreHorizontal size={16}/>, label:"Identification options" }}>
            <DetailRow label="Submission ID" copyValue="SUB-10428"
              value={<span style={{ color:N, fontWeight:700 }}>SUB-10428</span>}/>
            <DetailRow label="Type" value="Renewal"/>
            <DetailRow label="Line of business" value="GL · PL · ML"/>
            <DetailRow last label="Products"
              value={<span style={{ fontWeight:700 }}>Educators Legal</span>}/>
          </SectionCard>
        </div>

        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Dates" healthDot={WARN}
            action={{ icon:<Calendar size={15}/>, label:"Open calendar" }}>
            <DetailRow label="Submitted" value="Apr 14, 2026"/>
            <DetailRow label="Effective" value="Jun 1, 2026"/>
            <DetailRow label="Expiration" value="Jun 1, 2027"/>
            <DetailRow last label="Need-by"
              value={<span style={{ color:BAD, fontWeight:700 }}>Apr 28 · 12d</span>}/>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Routing & Assignment" healthDot={WARN}
            action={{ icon:<MoreHorizontal size={16}/>, label:"Routing options" }}>
            <DetailRow label="Stage"
              value={<StatusPill label="Needs review" dotColor={WARN} bg="#FEF3C7" text="#92400E"/>}/>
            <DetailRow label="Underwriter"
              value={<span className="inline-flex items-center"><Avatar name="Maya Khanna"/>Maya Khanna</span>}/>
            <DetailRow label="Underwriter Specialist"
              value={<span className="inline-flex items-center"><Avatar name="Devon Carter" color="#E0E7FF"/>Devon Carter</span>}/>
            <DetailRow last label="Claims analyst"
              value={<span className="inline-flex items-center"><Avatar name="Anika Shah" color="#FEF3C7" textColor="#92400E"/>Anika Shah</span>}/>
          </SectionCard>
        </div>
      </div>

      {/* ── Row 2 ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderBottom:`1px solid ${BDL}` }}>
        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Premium" healthDot={OK}
            action={{ icon:<TrendingUp size={15}/>, label:"Premium history" }}>
            <DetailRow label="Expiring" value="$132,400"/>
            <DetailRow label="Quoted"
              value={
                <span className="inline-flex items-center gap-2">
                  <span style={{ fontWeight:700, color:TD }}>$142,800</span>
                  <Tag color={OK} bg="#E8F5EC">+7.8%</Tag>
                </span>
              }/>
            <DetailRow label="Bound" value={<span style={{ color:TT }}>—</span>}/>
            <DetailRow last label="Indicated change"
              value={
                <span className="inline-flex items-center gap-1">
                  <TrendingUp size={13} color={OK}/>
                  <span style={{ color:OK, fontWeight:700 }}>+7.8%</span>
                </span>
              }/>
          </SectionCard>
        </div>

        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Decision & Authority" healthDot={WARN}
            action={{ icon:<MoreHorizontal size={16}/>, label:"Authority options" }}>
            <DetailRow label="Approvals Open"
              value={
                <span className="inline-flex items-center gap-2">
                  <span style={{ fontWeight:700 }}>1/4</span>
                  <MiniBar pct={25} color={N}/>
                </span>
              }/>
            <DetailRow label="Risk score"
              value={
                <span className="inline-flex items-center gap-2">
                  <span style={{ fontWeight:800, color:OK }}>82</span>
                  <Tag color={OK} bg="#E8F5EC">In appetite</Tag>
                </span>
              }/>
            <DetailRow label="Loss propensity"
              value={<StatusPill label="Medium" dotColor="#B45309" bg="#FFF3CD" text="#7A4200"/>}/>
            <DetailRow last label="SLA status"
              value={<span style={{ color:"#B45309", fontWeight:700 }}>At risk · 7d</span>}/>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Compliance & Documents" healthDot={BAD}
            action={{ icon:<FileText size={15}/>, label:"View documents" }}>
            <DetailRow label="Application"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} color={OK} strokeWidth={3}/>
                  <span style={{ color:OK, fontWeight:700 }}>On file</span>
                </span>
              }/>
            <DetailRow label="Loss runs"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} color={OK} strokeWidth={3}/>
                  <span style={{ color:OK, fontWeight:700 }}>5-yr validated</span>
                </span>
              }/>
            <DetailRow label="Financials"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} color={OK} strokeWidth={3}/>
                  <span style={{ color:OK, fontWeight:700 }}>On file</span>
                </span>
              }/>
            <DetailRow last label="Supplemental Application"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Check size={14} color={OK} strokeWidth={3}/>
                  <span style={{ color:OK, fontWeight:700 }}>On file</span>
                </span>
              }/>
          </SectionCard>
        </div>
      </div>

      {/* ── Row 3 ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3">
        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Member"
            action={{ icon:<ExternalLink size={14}/>, label:"Open member profile" }}>
            <DetailRow label="Name"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Award size={14} color={N}/>
                  <span style={{ fontWeight:700 }}>Brookfield Day School</span>
                </span>
              }/>
            <DetailRow label="Member #" copyValue="473" value="473"/>
            <DetailRow label="Group Name" value="Northeast Independent Schools Group"/>
            <DetailRow label="Group Number" copyValue="GRP-4827" value="GRP-4827"/>
            <DetailRow last label="Type" value="K-12 · Private · Day"/>
          </SectionCard>
        </div>

        <div style={{ borderRight:`1px solid ${BDL}` }}>
          <SectionCard title="Brokerage"
            action={{ icon:<ExternalLink size={14}/>, label:"Open broker profile" }}>
            <DetailRow label="Name"
              value={
                <span className="inline-flex items-center gap-1.5">
                  <Building2 size={14} color={N}/>
                  <span style={{ fontWeight:700 }}>Marsh McLennan</span>
                </span>
              }/>
            <DetailRow label="Parent Name" value="Marsh McLennan Companies"/>
            <DetailRow label="Account ID" copyValue="BRK-1842" value="BRK-1842"/>
            <DetailRow label="Parent Account ID" copyValue="BRK-PAR-0421" value="BRK-PAR-0421"/>
            <DetailRow last label="Office" value="Stamford, CT"/>
          </SectionCard>
        </div>

        <div>
          <SectionCard title="Broker Contact"
            action={{ icon:<Mail size={14}/>, label:"Compose email", href:"mailto:t.owens@mma.com" }}>
            <DetailRow label="Producer"
              value={
                <span className="inline-flex items-center">
                  <Avatar name="Tessa Owens" color="#FEF3C7" textColor="#92400E"/>
                  Tessa Owens
                </span>
              }/>
            <DetailRow label="Role" value="Producer of record"/>
            <DetailRow label="Permission" value="Full · Bind"/>
            <DetailRow label="Email" copyValue="t.owens@mma.com"
              value={
                <a href="mailto:t.owens@mma.com"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color:N, fontWeight:600 }}>
                  <Mail size={13}/>
                  t.owens@mma.com
                </a>
              }/>
            <DetailRow last label="Phone"
              value={
                <a href="tel:2035551142"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1.5 hover:underline"
                  style={{ color:TD, fontWeight:600 }}>
                  <Phone size={13}/>
                  (203) 555-1142
                </a>
              }/>
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
