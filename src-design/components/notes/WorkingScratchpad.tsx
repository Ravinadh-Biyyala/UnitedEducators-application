import { useState } from "react";
import { Pencil, Save, Trash2 } from "lucide-react";

/* ──────────────────────────────────────────────────────────────────────────────
   WorkingScratchpad
   ──────────────────────────────────────────────────────────────────────────────
   Transient, editable text field for an underwriter's working thoughts. Pairs
   with `<OfficialJournal />` — the scratchpad is where ideas land; the journal
   is the locked, append-only audit record.

   Local state only; nothing here is persisted yet (mirrors the rest of the
   src-design prototypes). A future iteration would wire this to a per-user,
   per-submission draft store.
   ────────────────────────────────────────────────────────────────────────── */

const N   = "#0123D4";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const font = "'Source Sans 3', system-ui, sans-serif";

interface Props {
  /** Initial draft text (kept transient — caller does not persist). */
  initialValue?: string;
  /** Fired when the user explicitly chooses to commit the draft. The caller
   *  is responsible for clearing or persisting; the scratchpad just emits. */
  onCommit?: (text: string) => void;
}

export function WorkingScratchpad({ initialValue = "", onCommit }: Props) {
  const [text, setText] = useState(initialValue);
  const hasContent = text.trim().length > 0;

  return (
    <section
      aria-label="Working scratchpad"
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
          <Pencil size={13} color={TM} />
          <span
            style={{
              fontSize: "0.66rem", fontWeight: 800, color: TT,
              textTransform: "uppercase", letterSpacing: "0.1em",
            }}
          >
            Working Scratchpad
          </span>
          <span
            style={{
              fontSize: "0.62rem", color: TT, fontStyle: "italic",
            }}
          >
            · transient · not part of the official record
          </span>
        </div>
        {hasContent && (
          <button
            type="button"
            onClick={() => setText("")}
            aria-label="Clear scratchpad"
            className="inline-flex items-center gap-1 hover:opacity-70 transition-opacity"
            style={{
              background: "transparent", border: "none", cursor: "pointer",
              fontSize: "0.66rem", color: "#B91C1C", fontWeight: 700,
            }}
          >
            <Trash2 size={11} /> Clear
          </button>
        )}
      </div>

      {/* Editable area */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Jot down thoughts, questions, or anything you don't want to commit to the journal yet…"
        rows={4}
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "none",
          outline: "none",
          resize: "vertical",
          minHeight: 96,
          fontSize: 14,
          lineHeight: "20px",
          fontFamily: font,
          color: TD,
          background: "white",
        }}
      />

      {/* Footer — commit action lifts text into the journal via `onCommit`. */}
      <div
        className="flex items-center justify-between px-4 py-2"
        style={{ borderTop: `1px solid ${BDL}`, background: "#FAFBFD" }}
      >
        <span style={{ fontSize: "0.66rem", color: TT }}>
          {hasContent
            ? `${text.trim().length} character${text.trim().length === 1 ? "" : "s"}`
            : "Scratchpad is empty"}
        </span>
        <button
          type="button"
          disabled={!hasContent}
          onClick={() => { if (hasContent) { onCommit?.(text.trim()); setText(""); } }}
          className="inline-flex items-center gap-1.5 transition-opacity"
          style={{
            background: hasContent ? N : "#E2E8F0",
            color: hasContent ? "white" : "#94A3B8",
            border: "none",
            padding: "6px 12px",
            borderRadius: 6,
            fontSize: "0.72rem", fontWeight: 700,
            cursor: hasContent ? "pointer" : "not-allowed",
          }}
        >
          <Save size={12} /> Commit to journal
        </button>
      </div>
    </section>
  );
}
