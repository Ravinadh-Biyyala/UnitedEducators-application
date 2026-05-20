import { useState, useRef } from "react";
import { Search, Pin, Plus, X } from "lucide-react";

/* ── Design tokens ────────────────────────────────────────────────────────── */
const N   = "#0123D4";
const BD  = "#C4CDD8";
const BDL = "#DCE3EC";
const TD  = "#1A2530";
const TM  = "#4A5D6E";
const TT  = "#7A8FA3";
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
  const [notes, setNotes]         = useState<NoteEntry[]>(SEED_NOTES);
  const [search, setSearch]       = useState("");
  const [filter, setFilter]       = useState<"All" | "Mine" | "Pinned">("All");
  const [showModal, setShowModal] = useState(false);

  /* modal state */
  const [mNote,    setMNote]    = useState("");
  const [mTags,    setMTags]    = useState<string[]>([]);
  const [mTagInput,setMTagInput]= useState("");
  const tagInputRef             = useRef<HTMLInputElement>(null);

  const allCount    = notes.length;
  const mineCount   = notes.filter(n => n.mine).length;
  const pinnedCount = notes.filter(n => n.pinned).length;

  /* filter + search */
  const visible = notes.filter(n => {
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
  });

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
        borderTop: `3px solid ${N}`,
        borderRadius: 8,
        overflow: "hidden",
        boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
      }}>

        {/* Toolbar */}
        <div className="px-5 py-3 flex flex-wrap items-center gap-3"
          style={{ borderBottom: `1px solid ${BDL}`, background: "#FAFBFD" }}>

          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-2"
            style={{ background: "white", border: `1px solid ${BD}` }}>
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
            <p style={{ fontSize: "0.84rem", color: TT }}>No notes match your search or filter.</p>
          </div>
        ) : (
          <div>
            {visible.map((note, idx) => {
              return (
                <div key={note.id}
                  className="px-5 py-5 hover:bg-slate-50/50 transition-colors"
                  style={{ borderBottom: idx < visible.length - 1 ? `1px solid ${BDL}` : "none" }}>

                  {/* Row 1: avatar + meta + note ID */}
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar */}
                      <div className="flex items-center justify-center shrink-0"
                        style={{
                          width: 36, height: 36,
                          borderRadius: "50%",
                          background: note.avatarColor,
                          color: "white",
                          fontSize: "0.68rem", fontWeight: 800,
                          letterSpacing: "0.02em",
                          flexShrink: 0,
                        }}>
                        {note.initials}
                      </div>

                      {/* Author · time · pinned */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span style={{ fontSize: "0.875rem", fontWeight: 700, color: TD }}>{note.author}</span>
                        <span style={{ fontSize: "0.72rem", color: TT }}>·</span>
                        <span style={{ fontSize: "0.72rem", color: TT }}>{note.timeAgo}</span>
                        {note.pinned && (
                          <span className="flex items-center gap-1 px-2 py-0.5"
                            style={{ fontSize: "0.60rem", fontWeight: 700, background: "#FFF8E6", color: "#8A5C00", border: "1px solid #F0D88A" }}>
                            <Pin size={9} color="#C9A227" />
                            Pinned
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Note ID */}
                    <span style={{ fontSize: "0.68rem", fontWeight: 600, color: TT, whiteSpace: "nowrap", marginTop: 2 }}>
                      {note.id}
                    </span>
                  </div>

                  {/* Row 2: tags */}
                  {note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2.5 pl-12">
                      {note.tags.map(tag => {
                        const tc = TAG_COLORS[tag] ?? fallbackTag;
                        return (
                          <span key={tag}
                            style={{ fontSize: "0.65rem", fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}`, padding: "1px 8px" }}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                  )}

                  {/* Row 3: content */}
                  <p className="pl-12"
                    style={{ fontSize: "0.84rem", color: TM, lineHeight: 1.65 }}>
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

              {/* Account + Submission row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Account</label>
                    <span style={{ fontSize: "0.65rem", color: TT }}>optional</span>
                  </div>
                  <input
                    defaultValue="Brookfield Day School"
                    className="w-full px-3 py-2.5 outline-none"
                    style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: "white" }}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em" }}>Submission</label>
                    <span style={{ fontSize: "0.65rem", color: TT }}>optional</span>
                  </div>
                  <input
                    defaultValue="SUB-10428"
                    className="w-full px-3 py-2.5 outline-none"
                    style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: "white" }}
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
                  style={{ fontSize: "0.84rem", border: `1px solid ${BD}`, color: TD, fontFamily: "'Source Sans 3', system-ui, sans-serif", background: "white", boxSizing: "border-box" }}
                />
              </div>

              {/* Tags */}
              <div>
                <label style={{ fontSize: "0.65rem", fontWeight: 700, color: TT, textTransform: "uppercase", letterSpacing: "0.09em", display: "block", marginBottom: 6 }}>Tags</label>

                {/* Tag input */}
                <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 mb-2"
                  style={{ border: `1px solid ${BD}`, background: "white", minHeight: 40, cursor: "text" }}
                  onClick={() => tagInputRef.current?.focus()}>
                  {mTags.map(tag => {
                    const tc = TAG_COLORS[tag] ?? fallbackTag;
                    return (
                      <span key={tag} className="flex items-center gap-1 px-2 py-0.5"
                        style={{ fontSize: "0.68rem", fontWeight: 700, background: tc.bg, color: tc.text, border: `1px solid ${tc.border}` }}>
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
    </>
  );
}
