// Lightweight intent detection for the right-rail Companion's free-text input.
// Pages map intents to real answers using their own data.

export type Intent =
  | { kind: "remaining" }                  // "what's left", "open", "still to do"
  | { kind: "done" }                       // "what did I finish", "completed"
  | { kind: "count" }                      // "how many", "count"
  | { kind: "overdue" }                    // "overdue", "late", "slipping", "past sla"
  | { kind: "priority"; level: "Critical" | "High" }
  | { kind: "next" }                       // "what should I do next", "next up"
  | { kind: "search"; term: string }       // "show me brookfield"
  | { kind: "summary" }                    // "summarize", "give me an overview"
  | { kind: "greeting" }                   // hi/hello
  | { kind: "thanks" }                     // thanks/ty
  | { kind: "help" }                       // what can you do
  | { kind: "unknown" };

const has = (t: string, ...words: string[]) => words.some(w => t.includes(w));

export function detectIntent(raw: string): Intent {
  const t = raw.trim().toLowerCase();
  if (!t) return { kind: "unknown" };

  if (/^(hi|hello|hey|yo|hiya|good (morning|afternoon|evening))\b/.test(t)) return { kind: "greeting" };
  if (/^(thanks|thank you|ty|thx|appreciate)/.test(t)) return { kind: "thanks" };
  if (/^help\b|^\?+$/.test(t) || has(t, "what can you do", "help me", "capabilities", "what do you do", "how do you work")) return { kind: "help" };

  if (has(t, "overdue", "late", "past due", "past sla", "slipping", "slipped", "missed")) return { kind: "overdue" };
  if (has(t, "critical", "urgent", "blocker", "blocking")) return { kind: "priority", level: "Critical" };
  if (has(t, "high priority", "high-priority", "high pri")) return { kind: "priority", level: "High" };

  if (has(t, "what's left", "whats left", "what is left", "what are left", "which are left", "which all are left",
              "remaining", "still open", "still to do", "to do", "todo", "open items", "open ones", "outstanding",
              "not done", "not yet done", "not finished", "incomplete", "unfinished", "pending", "left to do")) {
    return { kind: "remaining" };
  }

  if (has(t, "done", "finished", "completed", "closed")) return { kind: "done" };
  if (has(t, "next", "what should i do", "where to start", "what now")) return { kind: "next" };
  if (has(t, "summary", "summarize", "summarise", "overview", "tldr", "tl;dr", "recap")) return { kind: "summary" };

  if (/^how many\b|\bcount\b|\btotal\b|\bnumber of\b/.test(t)) return { kind: "count" };

  const searchMatch = t.match(/(?:show me|find|where is|where's|search(?: for)?|look up|open|about)\s+(.{2,})$/);
  if (searchMatch) return { kind: "search", term: searchMatch[1]!.trim().replace(/[?.!,]+$/, "") };

  const original = raw.trim();
  if (/^[A-Z][\w-]{3,}$/.test(original)) return { kind: "search", term: original.toLowerCase() };

  return { kind: "unknown" };
}

export const FALLBACK_HELP =
  "I can answer things like \"what's left\", \"what's overdue\", \"how many critical\", or \"show me Brookfield\". Or tap one of the actions below.";
