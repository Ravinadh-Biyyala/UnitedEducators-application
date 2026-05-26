import { Lock, FileText } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   OfficialJournal
   ──────────────────────────────────────────────────────────────────────────────
   Read-only, timestamped, append-only feed of locked underwriting rationale.
   Pairs with `<WorkingScratchpad />` — anything an underwriter commits from
   the scratchpad becomes a journal entry here, and is immutable afterward.

   This is the "audit record" half of the Notes split: every entry has a
   timestamp, an author, and a lock icon to make it visually obvious that
   the row cannot be edited inline.
   ────────────────────────────────────────────────────────────────────────── */

const N   = "#0123D4";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

export interface JournalEntry {
  id: string;
  /** Display label or initials of the underwriter who committed the entry. */
  author: string;
  initials: string;
  /** Avatar tint — caller picks; default brand if absent. */
  avatarColor?: string;
  /** ISO timestamp or pretty pre-formatted string ("2026-05-23 14:08 PT"). */
  timestamp: string;
  content: string;
}

interface Props {
  entries: JournalEntry[];
  /** Optional title override (defaults to "Official Journal"). */
  title?: string;
}

export function OfficialJournal({ entries, title = "Official Journal" }: Props) {
  return (
    <section
      aria-label="Official journal"
      style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 8,
        fontFamily: font,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-2.5"
        style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}
      >
        <div className="flex items-center gap-2">
          <Lock size={13} color={TM} />
          <span
            style={{
              fontSize: "0.66rem", fontWeight: 800, color: TT,
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}
          >
            {title}
          </span>
          <span
            style={{
              fontSize: "0.62rem", color: TT, fontStyle: "italic",
            }}
          >
            · read-only · append-only audit trail
          </span>
        </div>
        <span style={{ fontSize: "0.66rem", color: TT, fontWeight: 600 }}>
          {entries.length} entr{entries.length === 1 ? "y" : "ies"}
        </span>
      </div>

      {/* Feed */}
      {entries.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2" style={{ padding: "32px 16px" }}>
          <FileText size={22} color="#CBD5E1" />
          <p style={{ fontSize: "0.78rem", color: TM, fontWeight: 600 }}>No journal entries yet</p>
          <p style={{ fontSize: "0.7rem", color: TT, textAlign: "center", maxWidth: 320 }}>
            Use the scratchpad above to draft rationale, then commit it here to lock it into the file.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3" style={{ padding: 14 }}>
          {entries.map((entry, idx) => (
            <article
              key={entry.id}
              className="flex gap-3"
              style={{
                padding: "12px 14px",
                background: "#FAFBFD",
                border: `1px solid ${BDL}`,
                borderRadius: 8,
                // Subtle left-stripe in the brand tone so each entry reads as a
                // discrete locked record.
                borderLeft: `3px solid ${N}`,
              }}
            >
              <div
                className="flex items-center justify-center shrink-0 rounded-full"
                style={{
                  width: 28, height: 28,
                  background: entry.avatarColor ?? `${N}10`,
                  color: entry.avatarColor ? "white" : N,
                  fontSize: "0.66rem", fontWeight: 800,
                }}
                aria-hidden
              >
                {entry.initials}
              </div>
              <div className="flex-1 min-w-0">
                <header className="flex items-center gap-2 flex-wrap">
                  <span style={{ fontSize: "0.82rem", fontWeight: 700, color: TD }}>
                    {entry.author}
                  </span>
                  <span style={{ fontSize: "0.66rem", color: TT, fontWeight: 500 }}>
                    · {entry.timestamp}
                  </span>
                  <span
                    className="inline-flex items-center gap-1 ml-auto"
                    title="Locked record — cannot be edited"
                    style={{
                      fontSize: "0.58rem", fontWeight: 800, color: "#475569",
                      background: "#F1F5F9", border: "1px solid #E2E8F0",
                      padding: "1px 7px", borderRadius: 9999,
                      textTransform: "uppercase", letterSpacing: "0.08em",
                    }}
                  >
                    <Lock size={9} /> Locked
                  </span>
                </header>
                <p
                  style={{
                    fontSize: 14, lineHeight: "20px", color: TD,
                    marginTop: 6, whiteSpace: "pre-wrap",
                  }}
                >
                  {entry.content}
                </p>
                {/* Position indicator — gives the eye an ordinal anchor in long feeds. */}
                <div
                  style={{
                    marginTop: 8, fontSize: "0.6rem", color: TT,
                    fontVariantNumeric: "tabular-nums",
                  }}
                >
                  #{String(entries.length - idx).padStart(3, "0")}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
