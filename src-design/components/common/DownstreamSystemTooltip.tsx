import { useState, type ReactNode } from "react";
import { Database, ExternalLink } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   DownstreamSystemTooltip
   ──────────────────────────────────────────────────────────────────────────────
   Progressive disclosure hover card that names the downstream system or
   ledger backing a given UI field. Underwriters routinely ask "where does
   this number actually come from?" — this component answers, without
   adding visible chrome until hover.

   Implementation uses a `group relative` Tailwind hover structure so no
   external dependency (Radix, Floating UI) is required for the prototype.
   Drop it around any field-level chip / value:

     <DownstreamSystemTooltip system="GuideWire ClaimCenter" field="Reserve">
       <span>{fmt(reserve)}</span>
     </DownstreamSystemTooltip>

   The tooltip auto-pins beneath the trigger, has a small caret, and shows:
     • Origin system name
     • Optional field-level note ("last synced 2h ago", "ledger ID 7821", …)
     • Optional jump link if a deep-link URL is provided.
   ────────────────────────────────────────────────────────────────────────── */

const font = "'Source Sans 3', system-ui, sans-serif";

interface Props {
  /** Display name of the downstream system or database ledger. */
  system: string;
  /** Optional human-readable field name (helps when multiple fields share a source). */
  field?: string;
  /** Optional supporting note (sync time, internal ledger id, etc.). */
  note?: string;
  /** Optional deep-link to the source record. */
  href?: string;
  /** The trigger element. */
  children: ReactNode;
  /** Force the tooltip to align right (default: left). */
  align?: "left" | "right";
}

export function DownstreamSystemTooltip({
  system,
  field,
  note,
  href,
  children,
  align = "left",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <span
      className="group relative inline-flex items-center"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      style={{
        // dotted underline cues that a hover is available without adding
        // a visible badge to every field that has provenance metadata.
        textDecoration: "underline dotted #94A3B8",
        textUnderlineOffset: 3,
        cursor: "help",
        fontFamily: font,
      }}
      tabIndex={0}
      aria-describedby={open ? "downstream-tooltip" : undefined}
    >
      {children}

      {open && (
        <span
          id="downstream-tooltip"
          role="tooltip"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            ...(align === "right" ? { right: 0 } : { left: 0 }),
            minWidth: 220,
            maxWidth: 320,
            background: "white",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            boxShadow: "0 8px 24px rgba(15,23,42,0.14)",
            padding: 10,
            zIndex: 80,
            cursor: "default",
            textDecoration: "none",
            // small caret pointing up at the trigger
          }}
        >
          {/* Caret */}
          <span
            aria-hidden
            style={{
              position: "absolute", top: -5,
              ...(align === "right" ? { right: 14 } : { left: 14 }),
              width: 10, height: 10,
              background: "white",
              borderTop: "1px solid #E2E8F0",
              borderLeft: "1px solid #E2E8F0",
              transform: "rotate(45deg)",
            }}
          />

          {/* Header */}
          <div className="flex items-center gap-2" style={{ marginBottom: 4 }}>
            <span
              className="inline-flex items-center justify-center shrink-0"
              style={{
                width: 22, height: 22, borderRadius: 5,
                background: "#EFF6FF", color: "#1D4ED8",
              }}
            >
              <Database size={12} />
            </span>
            <div className="flex flex-col">
              <span
                style={{
                  fontSize: "0.56rem", fontWeight: 800, color: "#94A3B8",
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  lineHeight: 1.1,
                }}
              >
                Source of record
              </span>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1A2530", lineHeight: 1.2 }}>
                {system}
              </span>
            </div>
          </div>

          {/* Field name */}
          {field && (
            <div
              style={{
                fontSize: "0.7rem", color: "#475569", marginTop: 2, lineHeight: 1.35,
              }}
            >
              <strong>Field:</strong> {field}
            </div>
          )}

          {/* Free-form note */}
          {note && (
            <div
              style={{
                fontSize: "0.7rem", color: "#64748B", marginTop: 4, lineHeight: 1.4,
              }}
            >
              {note}
            </div>
          )}

          {/* Deep link */}
          {href && (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:underline"
              style={{
                marginTop: 6,
                fontSize: "0.7rem", color: "#0123D4", fontWeight: 700,
              }}
            >
              Open in {system} <ExternalLink size={10} />
            </a>
          )}
        </span>
      )}
    </span>
  );
}
