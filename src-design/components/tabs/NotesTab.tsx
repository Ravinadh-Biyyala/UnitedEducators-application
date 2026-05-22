import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Search, Pin, Plus, X } from "lucide-react";
import { useSubmissionWorkspaceOptional } from "../../context/SubmissionWorkspaceContext";

/* ── Design tokens ────────────────────────────────────────────────────────── */
const N   = "#0123D4";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#5F7080";
const TH  = "#F0F3F8";

/* ── Types ────────────────────────────────────────────────────────────────── */
interface NoteEntry {
  id: string;
  author: string;
  initials: string;
  avatarColor: string;
  timeAgo: string;
  pinned: boolean;
  mine: boolean;
  tags: string[];
  content: string;
}

/* ── Tag colour map ───────────────────────────────────────────────────────── */
const TAG_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "Renewal":      { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
  "Risk control": { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8" },
  "Loss run":     { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0" },
  "Approval":     { bg: "#E8F5EC", text: "#1A5C30", border: "#93C8A0" },
  "Decline":      { bg: "#FBEAEA", text: "#7A1F1F", border: "#E8A8A8" },
  "Claims":       { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" },
  "Subjectivity": { bg: "#F0EEF8", text: "#4A2D80", border: "#C3B8E8" },
  "Quote":        { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
  "Strategy":     { bg: "#E8F0F9", text: "#00427A", border: "#9ABCD6" },
  "New business": { bg: "#FFF8E6", text: "#8A5C00", border: "#F0D88A" },
};
const fallbackTag = { bg: "#F0F3F8", text: "#4A5D6E", border: "#C4CDD8" };

const QUICK_TAGS = ["Renewal", "New business", "Loss run", "Risk control", "Subjectivity", "Quote"];

/* ── Seed data ────────────────────────────────────────────────────────────── */
const SEED_NOTES: NoteEntry[] = [
  {
    id: "N-1042", author: "Maya Khanna",   initials: "MK", avatarColor: N,
    timeAgo: "2h ago",    pinned: true,  mine: true,
    tags: ["Renewal", "Risk control"],
    content: "Spoke with Tessa at Marsh — client willing to accept $50K SIR if we hold rate flat. Need to confirm with risk control on athletic facility subjectivity before quoting. Two open BI claims weighing heavily on the decision.",
  },
  {
    id: "N-1041", author: "Maya Khanna",   initials: "MK", avatarColor: N,
    timeAgo: "5h ago",    pinned: false, mine: true,
    tags: ["Loss run"],
    content: "Reviewed 2021–2025 loss run. Both open claims at athletic facility — recommend tying renewal to slip-and-fall remediation plan. Flagging for facilities sub-limit conversation.",
  },
  {
    id: "N-1039", author: "Leo Tran",       initials: "LT", avatarColor: "#1A7A4A",
    timeAgo: "Yesterday", pinned: false, mine: false,
    tags: ["Approval"],
    content: "Approved rate change request (REF-039). Document the SIR uplift rationale before binding. Set a reminder to revisit the schedule mod at +12 months.",
  },
  {
    id: "N-1036", author: "Anika Shah",     initials: "AS", avatarColor: "#B45309",
    timeAgo: "2 days ago", pinned: true,  mine: false,
    tags: ["Claims"],
    content: "Both open GL claims (CL-22841, CL-22899) tied to bleachers reconfiguration project. Reserve adequacy reviewed with claims — comfortable at current levels through bind.",
  },
  {
    id: "N-1033", author: "Devon Carter",   initials: "DC", avatarColor: "#7B2FBE",
    timeAgo: "3 days ago", pinned: false, mine: false,
    tags: ["Subjectivity"],
    content: "Cyber supplemental still outstanding. Sent reminder to broker; will follow up Monday if no response by EOD.",
  },
  {
    id: "N-1028", author: "Maya Khanna",   initials: "MK", avatarColor: N,
    timeAgo: "4 days ago", pinned: false, mine: true,
    tags: ["Quote", "Strategy"],
    content: "Three options drafted: hold-flat (CGL-1), +5% with $25K SIR (CGL-2, recommended), and +12% with $10K SIR (CGL-3). Recommendation goes to broker after Cyber supplemental clears.",
  },
];

/* ── Component ────────────────────────────────────────────────────────────── */
export function NotesTab() {
  const location = useLocation();
  const workspace = useSubmissionWorkspaceOptional();
  const freshFromInbox = (location.state as { freshFromInbox?: boolean } | null)?.freshFromInbox === true;
  const [notes, setNotes]         = useState<NoteEntry[]>(freshFromInbox ? [] : SEED_NOTES);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"All" | "Mine" | "Pinned">("All");
  const [showModal, setShowModal] = useState(false);
  const [viewingNoteId, setViewingNoteId] = useState<string | null>(null);

  // Drain any notes pushed from other tabs (e.g. UW Review approve modal).
  // Runs on mount and whenever the pending-note queue grows.
  useEffect(() => {
    if (!workspace || workspace.pendingNotes.length === 0) return;
    const drained = workspace.drainPendingNotes();
    if (drained.length === 0) return;
    setNotes(prev => {
      const baseId = 1000 + prev.length;
      const converted: NoteEntry[] = drained.map((p, i) => ({
        id:          `N-${baseId + i + 1}`,
        author:      p.author,
        initials:    p.initials,
        avatarColor: p.avatarColor,
        timeAgo:     "Just now",
        pinned:      false,
        mine:        true,
        tags:        p.tags,
        content:     p.content,
      }));
      return [...converted.reverse(), ...prev];
    });
  }, [workspace, workspace?.pendingNotes.length]);

  /* modal state */
  const [mNote,    setMNote]    = useState("");
  const [mTags,    setMTags]    = useState<string[]>([]);
  const [mTagInput,setMTagInput]= useState("");
  const tagInputRef             = useRef<HTMLInputElement>(null);

  const allCount    = notes.length;
  const mineCount   = notes.filter(n => n.mine).length;
  const pinnedCount = notes.filter(n => n.pinned).length;

  /* filter + search, then float pinned notes to the top (stable: preserves
     recency order within pinned and unpinned groups) */
  const visible = notes
    .filter(n => {
      const matchesFilter =
        filter === "All"    ? true :
        filter === "Mine"   ? n.mine :
        n.pinned;
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        n.author.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(t => t.toLowerCase().includes(q));
      return matchesFilter && matchesSearch;
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned));

  /* pin/unpin a note */
  const togglePin = (id: string) =>
    setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));

  /* tag input helpers */
  const addTag = (tag: string) => {
    const t = tag.trim();
    if (t && !mTags.includes(t)) setMTags(prev => [...prev, t]);
    setMTagInput("");
  };
  const removeTag = (tag: string) => setMTags(prev => prev.filter(t => t !== tag));

  /* submit new note */
  const handleAddNote = () => {
    if (!mNote.trim()) return;
    const newEntry: NoteEntry = {
      id:          `N-${1000 + notes.length + 1}`,
      author:      "John Michaels",
      initials:    "JM",
      avatarColor: N,
      timeAgo:     "Just now",
      pinned:      false,
      mine:        true,
      tags:        mTags,
      content:     mNote.trim(),
    };
    setNotes(prev => [newEntry, ...prev]);
    setMNote(""); setMTags([]); setMTagInput("");
    setShowModal(false);
  };

  /* close on backdrop */
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) setShowModal(false);
  };

  return (
    <>
      {/* ── Main panel ─────────────────────────────────────────────────── */}
      <div style={{
        background: "white",
        border: `1px solid ${BDL}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}>

        {/* Toolbar */}
        <div className="px-5 py-3 flex flex-wrap items-center gap-3"
          style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2"
            style={{ background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
            <Search size={13} color={TT} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search notes on this submission…"
              className="flex-1 outline-none bg-transparent"
              style={{ fontSize: "0.82rem", color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
            />
          </div>

          {/* Filter pills */}
          <div className="flex items-center gap-1">
            {([
              { key: "All",    count: allCount    },
              { key: "Mine",   count: mineCount   },
              { key: "Pinned", count: pinnedCount },
            ] as { key: "All"|"Mine"|"Pinned"; count: number }[]).map(f => {
              const active = filter === f.key;
              return (
                <button key={f.key} onClick={() => setFilter(f.key)}
                  className="flex items-center gap-1.5 px-3 py-1.5 transition-all"
                  style={{
                    fontSize: "0.75rem", fontWeight: active ? 700 : 500,
                    background: active ? N : "white",
                    color: active ? "white" : TM,
                    border: `1px solid ${active ? N : BD}`,
                    borderRadius: 6,
                  }}>
                  {f.key}
                  <span style={{
                    fontSize: "0.65rem", fontWeight: 700,
                    background: active ? "rgba(255,255,255,0.25)" : TH,
                    color: active ? "white" : TT,
                    padding: "0 5px", borderRadius: 20,
                    minWidth: 18, textAlign: "center", display: "inline-block",
                  }}>{f.count}</span>
                </button>
              );
            })}
          </div>

          {/* New note */}
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 hover:brightness-95 transition-all ml-auto"
            style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
            <Plus size={13} /> New note
          </button>
        </div>

        {/* Notes list */}
        {visible.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p style={{ fontSize: "0.84rem", color: TT }}>
              {notes.length === 0
                ? "No notes yet. Add the first note for this submission."
                : "No notes match your search or filter."}
            </p>
          </div>
        ) : (
          <div>
            {visible.map((note, idx) => {
              return (
                <div key={note.id}
                  onClick={() => setViewingNoteId(note.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setViewingNoteId(note.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={`Open note ${note.id}`}
                  className="px-5 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer"
                  style={{ borderBottom: idx < visible.length - 1 ? `1px solid ${BDL}` : "none", outline: "none" }}>

                  {/* Row 1: avatar + meta + note ID */}
                  <div className="flex items-start justify-between gap-4 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      {/* Avatar */}
                      <div className="flex items-center justify-center shrink-0"
                        style={{
                          width: 30, height: 30,
                          borderRadius: "50%",
                          background: note.avatarColor,
                          color: "white",
                          fontSize: "0.64rem", fontWeight: 800,
                          letterSpacing: "0.02em",
                          flexShrink: 0,
                        }}>
                        {note.initials}
                      </div>

                      {/* Author · time · tags */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>{note.author}</span>
                        <span style={{ fontSize: "0.72rem", color: TT }}>·</span>
                        <span style={{ fontSize: "0.72rem", color: TT }}>{note.timeAgo}</span>
                        {note.tags.map(tag => {
                          const tc = TAG_COLORS[tag] ?? fallbackTag;
                          return (
                            <span key={tag}
                              style={{ fontSize: "0.65rem", fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, padding: "1px 8px", borderRadius: 9999 }}>
                              {tag}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Note ID + Pin toggle */}
                    <div className="flex items-center gap-2 shrink-0" style={{ marginTop: 2 }}>
                      <button
                        onClick={(e) => { e.stopPropagation(); togglePin(note.id); }}
                        title={note.pinned ? "Click to unpin" : "Click to pin"}
                        aria-pressed={note.pinned}
                        className="flex items-center gap-1 px-2 py-1 transition-all hover:brightness-97"
                        style={{
                          fontSize: "0.66rem", fontWeight: 700,
                          background: note.pinned ? "#FFF8E6" : "white",
                          color: note.pinned ? "#8A5C00" : TM,
                          border: `1px solid ${note.pinned ? "#F0D88A" : BD}`,
                          borderRadius: 9999,
                          cursor: "pointer",
                          fontFamily: "'Source Sans 3', system-ui, sans-serif",
                        }}>
                        <Pin size={11} color={note.pinned ? "#C9A227" : TT}
                          style={{ fill: note.pinned ? "#C9A227" : "none" }}/>
                        {note.pinned ? "Pinned" : "Pin"}
                      </button>
                      <span style={{ fontSize: "0.68rem", fontWeight: 600, color: TT, whiteSpace: "nowrap" }}>
                        {note.id}
                      </span>
                    </div>
                  </div>

                  {/* Row 2: content preview — clamped to 2 lines; full text in the popup */}
                  <p style={{
                    fontSize: "0.82rem",
                    color: TM,
                    lineHeight: 1.5,
                    paddingLeft: 40,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {note.content}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── New Note Modal ──────────────────────────────────────────────── */}
      {showModal && (
        <div
          onClick={handleBackdrop}
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(15, 25, 40, 0.55)" }}>

          <div className="w-full mx-4"
            style={{
              maxWidth: 680,
              background: "white",
              border: `1px solid ${BD}`,
              borderRadius: 8,
              boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
            }}>

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderBottom: `1px solid ${BDL}` }}>
              <div className="flex items-center gap-3">
                <h2 style={{ fontSize: "1.05rem", fontWeight: 800, color: TD }}>New note</h2>
                <span style={{ fontSize: "0.78rem", color: TT }}>
                  · {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
              <button onClick={() => setShowModal(false)}
                className="flex items-center justify-center hover:bg-slate-100 transition-colors"
                style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
                <X size={16} />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-5">

              {/* Account + Submission row — locked to current submission context */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Account</label>
                  <input
                    readOnly
                    value="Brookfield Day School"
                    aria-readonly="true"
                    tabIndex={-1}
                    className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                    style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: TH }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Submission</label>
                  <input
                    readOnly
                    value="SUB-10428"
                    aria-readonly="true"
                    tabIndex={-1}
                    className="w-full px-3 py-2.5 outline-none cursor-not-allowed"
                    style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TM, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: TH }}
                  />
                </div>
              </div>

              {/* Note textarea */}
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Note</label>
                <textarea
                  value={mNote}
                  onChange={e => setMNote(e.target.value)}
                  placeholder="What did you learn, decide, or need to follow up on?"
                  rows={5}
                  className="w-full outline-none resize-y px-3 py-3"
                  style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, borderRadius: 6, color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: "white", boxSizing: "border-box" }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Tags</label>

                {/* Tag input */}
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 mb-2"
                  style={{ border: `1px solid ${BD}`, borderRadius: 6, background: "white", minHeight: 40, cursor: "text" }}
                  onClick={() => tagInputRef.current?.focus()}>
                  {mTags.map(tag => {
                    const tc = TAG_COLORS[tag] ?? fallbackTag;
                    return (
                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5"
                        style={{ fontSize: "0.68rem", fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, borderRadius: 9999 }}>
                        {tag}
                        <button onClick={() => removeTag(tag)} style={{ color: tc.text, display: "flex", alignItems: "center", borderRadius: 6 }}>
                          <X size={9} />
                        </button>
                      </span>
                    );
                  })}
                  <input
                    ref={tagInputRef}
                    value={mTagInput}
                    onChange={e => setMTagInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(mTagInput); } }}
                    placeholder={mTags.length === 0 ? "Add tag and press Enter" : ""}
                    className="outline-none flex-1 min-w-[120px] bg-transparent"
                    style={{ fontSize: "0.82rem", color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif" }}
                  />
                </div>

                {/* Quick-add tags */}
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_TAGS.filter(t => !mTags.includes(t)).map(tag => (
                    <button key={tag} onClick={() => addTag(tag)}
                      className="flex items-center gap-1 px-2.5 py-1 hover:brightness-97 transition-all"
                      style={{ fontSize: "0.70rem", fontWeight: 600, background: TH, color: TM, border: `1px solid ${BD}`, borderRadius: 6 }}>
                      <Plus size={9} />
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-between px-6 py-4"
              style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
              <p style={{ fontSize: "0.72rem", color: TT }}>
                Notes are visible to your team and added to the account audit trail.
              </p>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowModal(false)}
                  className="px-4 py-2 hover:brightness-97 transition-all"
                  style={{ fontSize: "0.80rem", fontWeight: 600, color: TM, background: "white", border: `1px solid ${BD}`, borderRadius: 6 }}>
                  Cancel
                </button>
                <button
                  onClick={handleAddNote}
                  disabled={!mNote.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 transition-all hover:brightness-95 disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: N, color: "white", fontSize: "0.80rem", fontWeight: 700, borderRadius: 6 }}>
                  <Plus size={13} /> Add note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── View Note Modal ─────────────────────────────────────────────── */}
      {viewingNoteId && (() => {
        const note = notes.find(n => n.id === viewingNoteId);
        if (!note) return null;
        return (
          <NoteViewModal
            note={note}
            onClose={() => setViewingNoteId(null)}
            onTogglePin={() => togglePin(note.id)}
          />
        );
      })()}
    </>
  );
}

/* ── View Note Modal ─────────────────────────────────────────────────────────
   Read-only view of a single note. Opens when a user clicks a row in the
   notes list — useful for long notes that exceed the 2-line list preview. */
function NoteViewModal({
  note, onClose, onTogglePin,
}: {
  note: NoteEntry;
  onClose: () => void;
  onTogglePin: () => void;
}) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(15, 25, 40, 0.55)" }}>

      <div className="w-full mx-4"
        style={{
          maxWidth: 640,
          background: "white",
          border: `1px solid ${BD}`,
          boxShadow: "0 20px 60px rgba(0,0,0,0.20)",
          borderRadius: 10,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          maxHeight: "85vh",
        }}>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 px-6 py-4"
          style={{ borderBottom: `1px solid ${BDL}` }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex items-center justify-center shrink-0"
              style={{
                width: 32, height: 32, borderRadius: "50%",
                background: note.avatarColor, color: "white",
                fontSize: "0.66rem", fontWeight: 800, letterSpacing: "0.02em",
              }}>
              {note.initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: TD }}>{note.author}</span>
                <span style={{ fontSize: "0.72rem", color: TT }}>·</span>
                <span style={{ fontSize: "0.72rem", color: TT }}>{note.timeAgo}</span>
                <span style={{ fontSize: "0.72rem", color: TT }}>·</span>
                <span style={{ fontSize: "0.72rem", fontWeight: 700, color: TT }}>{note.id}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose}
            className="flex items-center justify-center hover:bg-slate-100 transition-colors shrink-0"
            style={{ width: 28, height: 28, color: TT, borderRadius: 6 }}>
            <X size={16} />
          </button>
        </div>

        {/* Tags */}
        {note.tags.length > 0 && (
          <div className="flex items-center gap-1.5 flex-wrap px-6 pt-4">
            {note.tags.map(tag => {
              const tc = TAG_COLORS[tag] ?? fallbackTag;
              return (
                <span key={tag}
                  style={{
                    fontSize: "0.68rem", fontWeight: 700,
                    background: tc.bg, color: tc.text,
                    border: `1px solid ${tc.border}`,
                    padding: "2px 9px", borderRadius: 9999,
                  }}>
                  {tag}
                </span>
              );
            })}
          </div>
        )}

        {/* Body — full note content, scrollable for long notes */}
        <div className="px-6 py-4 overflow-y-auto flex-1">
          <p style={{
            fontSize: "0.92rem",
            color: TD,
            lineHeight: 1.6,
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
          }}>
            {note.content}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2.5 px-6 py-4"
          style={{ borderTop: `1px solid ${BDL}`, background: TH }}>
          <button
            onClick={onTogglePin}
            title={note.pinned ? "Click to unpin" : "Click to pin"}
            aria-pressed={note.pinned}
            className="flex items-center gap-1.5 px-3 py-2 transition-all hover:brightness-97"
            style={{
              fontSize: "0.74rem", fontWeight: 700,
              background: note.pinned ? "#FFF8E6" : "white",
              color: note.pinned ? "#8A5C00" : TM,
              border: `1px solid ${note.pinned ? "#F0D88A" : BD}`,
              borderRadius: 6, cursor: "pointer",
            }}>
            <Pin size={12} color={note.pinned ? "#C9A227" : TT}
              style={{ fill: note.pinned ? "#C9A227" : "none" }} />
            {note.pinned ? "Pinned" : "Pin"}
          </button>

          <button onClick={onClose}
            className="px-4 py-2 hover:brightness-95 transition-all"
            style={{
              fontSize: "0.80rem", fontWeight: 700,
              background: N, color: "white", borderRadius: 6,
            }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
