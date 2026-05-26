import { useState, type ReactNode } from "react";
import { Lock } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   SalesforceInputWrapper
   ──────────────────────────────────────────────────────────────────────────────
   Reusable wrapper for fields that are mastered in Salesforce — Member,
   Brokerage, Broker Contact, Quoted Premium, etc. The wrapper makes three
   things visually unambiguous:

     1. The field is READ-ONLY (slate background + disabled cursor + no
        selection highlight).
     2. The data originates in Salesforce (lock icon + corner hint).
     3. Hovering over the lock surfaces a small tooltip — "Synced from
        Salesforce - Read Only" — so a new underwriter can self-explain
        why edits don't take.

   Usage:
     <SalesforceInputWrapper label="Quoted Premium" value="$142,800" />
     <SalesforceInputWrapper label="Brokerage">
       <span>Marsh McLennan</span>
     </SalesforceInputWrapper>

   You can either pass a primitive `value` (renders as a span) or pass any
   `children` (renders the children unchanged — handy for richer content
   like an avatar+name composite).
   ────────────────────────────────────────────────────────────────────────── */

const font = "'Source Sans 3', system-ui, sans-serif";

interface Props {
  /** Uppercase micro-label rendered above the value. */
  label: string;
  /** Simple string value (alternative to `children`). */
  value?: ReactNode;
  /** Override the tooltip copy. */
  tooltip?: string;
  /** Override the Salesforce-origin hint shown in the corner. */
  origin?: string;
  /** Rich content alternative to `value`. */
  children?: ReactNode;
  /** Optional extra className on the outer wrapper. */
  className?: string;
}

export function SalesforceInputWrapper({
  label,
  value,
  tooltip = "Synced from Salesforce — Read Only",
  origin = "Salesforce",
  children,
  className = "",
}: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      // Tailwind-equivalent palette spelled out for src-design surfaces.
      // bg-slate-50 + border-slate-200 + text-slate-500 + cursor-not-allowed
      // + selection:bg-transparent (achieved via inline `userSelect:none`
      // to suppress text selection inside the disabled field).
      className={`relative flex flex-col ${className}`}
      style={{
        background: "#F8FAFC",                 // slate-50
        border: "1px solid #E2E8F0",           // slate-200
        borderRadius: 8,
        padding: "9px 12px",
        cursor: "not-allowed",
        userSelect: "none",
        fontFamily: font,
        color: "#64748B",                      // slate-500
      }}
      aria-readonly="true"
      title={tooltip}
    >
      <div className="flex items-center justify-between gap-2">
        <span
          style={{
            fontSize: "0.58rem", fontWeight: 800,
            color: "#94A3B8",                  // slate-400
            textTransform: "uppercase", letterSpacing: "0.1em",
          }}
        >
          {label}
        </span>

        {/* Lock + origin hint */}
        <span
          className="inline-flex items-center gap-1 relative"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onFocus={() => setShowTooltip(true)}
          onBlur={() => setShowTooltip(false)}
          tabIndex={0}
          aria-describedby={showTooltip ? "sf-lock-tooltip" : undefined}
        >
          <Lock
            // w-3.5 h-3.5 text-slate-400 (per spec).
            color="#94A3B8"
            style={{ width: 14, height: 14 }}
          />
          <span
            style={{
              fontSize: "0.56rem", fontWeight: 700, color: "#94A3B8",
              textTransform: "uppercase", letterSpacing: "0.08em",
            }}
          >
            {origin}
          </span>

          {/* Progressive disclosure tooltip — small card pinned to the right
              corner so it never collides with the next field. */}
          {showTooltip && (
            <span
              id="sf-lock-tooltip"
              role="tooltip"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                right: 0,
                background: "#0F172A",         // slate-900
                color: "white",
                fontSize: "0.66rem", fontWeight: 500,
                lineHeight: 1.4,
                padding: "6px 10px",
                borderRadius: 6,
                whiteSpace: "nowrap",
                boxShadow: "0 4px 12px rgba(15,23,42,0.18)",
                zIndex: 80,
              }}
            >
              {tooltip}
            </span>
          )}
        </span>
      </div>

      {/* Body — children win when provided, otherwise the primitive value. */}
      <div
        style={{
          marginTop: 4,
          fontSize: "0.92rem", fontWeight: 700,
          color: "#475569",                    // slate-600 — slightly darker
          lineHeight: 1.25,
        }}
      >
        {children ?? value}
      </div>
    </div>
  );
}
