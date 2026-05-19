// Companion chat module — POSTs to the standalone Express server
// (server/src/routes/companion.ts) which proxies OpenAI server-side so the
// API key never ships to the browser. If the server is unreachable, we fall
// back to a deterministic local heuristic responder so the UI never breaks.

export type ChatMsg = { role: "user" | "assistant" | "system"; content: string };

// Verbatim from the reference companion.ts endpoint. Still exported so the
// local fallback (and any future callers) can reuse the same prompt.
export const COMPANION_SYSTEM_PROMPT = [
  "You are the Companion — a senior underwriting copilot embedded in the United Educators (UE) Underwriter Workbench. UE writes specialty liability and property for K–12, higher-ed, and youth-serving organizations.",
  "Act like an experienced UE senior underwriter who pairs with the user on every step of the workflow: intake & triage, appetite check, document comprehension, exposure modeling, pricing (limit / SIR / factor / commission), companion product cross-sell, peer review, REFERRAL to senior authority, quote letter, broker negotiation, bind, and post-bind endorsements.",
  "You understand: UE's appetite (K-12, IHE, camps, youth orgs); standard forms (Educators Legal Liability, GL, Property, Auto, Cyber, EPL, Crime, Workers Comp); 5-yr loss ratio context; Schedule of Locations; sprinkler/COPE credits; SIR vs deductible; manual rate bands (~0.85×–1.30× is standard, >1.20× usually needs RM sign-off, >1.30× or limits >$10M need senior referral); broker tiers (Marsh/Aon/WTW = Tier 1).",
  "Referral triggers you should proactively flag: (a) any coverage factor > 1.20×, (b) cyber sublimit > $1M on K-12, (c) total quoted premium > $750K, (d) loss ratio > 75%, (e) open claim with reserves > $250K, (f) limits above standard authority, (g) non-standard endorsement requested. When you spot one, name the trigger and offer to route it to the Director of UW (Robert Chen) with a one-line rationale.",
  "Tone: crisp, warm, executive — Apple product copy meets a senior UW colleague. Default to 1–3 sentences. When the user asks for detail (\"why\", \"walk me through\", \"explain\"), expand with concrete numbers and named trade-offs. Never use filler like \"As an AI…\" or generic disclaimers.",
  "Always be useful. If the question is ambiguous, make the most reasonable senior-UW interpretation and answer it, then offer one clarifying follow-up.",
  "Grounding rules: never invent submission IDs, dollar amounts, broker names, or task titles that aren't in the provided facts. If a fact isn't there, say what's missing and offer the action that would produce it.",
].join("\n\n");

export type CompanionChatArgs = {
  page?: { title?: string; subtitle?: string; routeKey?: string };
  facts?: string;
  messages: ChatMsg[];
};

const DEFAULT_API_URL = "http://localhost:8787/api/companion/chat";

function getApiUrl(): string {
  const url = (import.meta as any)?.env?.VITE_COMPANION_API_URL as string | undefined;
  return (url && url.trim()) || DEFAULT_API_URL;
}

export async function companionChat(args: CompanionChatArgs): Promise<{ text: string }> {
  const url = getApiUrl();

  // ── Path 1: real server-backed model ───────────────────────────────────
  try {
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        page: args.page,
        facts: args.facts,
        messages: args.messages,
      }),
    });
    if (resp.ok) {
      const json = await resp.json();
      const text = (json?.text ?? "").trim();
      if (text) return { text };
    } else {
      // eslint-disable-next-line no-console
      console.warn(`[companion] server responded ${resp.status}; falling back to local responder`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("[companion] server unreachable; falling back to local responder", err);
  }

  // ── Path 2: deterministic local responder ──────────────────────────────
  return { text: localResponder(args) };
}

// ── Local heuristic responder ──────────────────────────────────────────────
function localResponder(args: CompanionChatArgs): string {
  const last = [...args.messages].reverse().find(m => m.role === "user");
  const q = (last?.content ?? "").trim();
  const ql = q.toLowerCase();
  const facts = args.facts ?? "";
  const pageTitle = args.page?.title ?? "this page";

  // Referral-trigger keyword detection (mirrors the system prompt rules).
  const refer = detectReferralTrigger(ql, facts);
  if (refer) return refer;

  if (!q) {
    return `I'm tracking ${pageTitle}. Ask for a summary, a chart, or who to chase next — I'll pull the answer from what's on screen.`;
  }

  // Common conversational openers.
  if (/^(hi|hello|hey)\b/.test(ql)) {
    return `Hi — I'm watching ${pageTitle}. Want a summary, the urgent items, or a chart?`;
  }
  if (/^(thanks|thank you|ty|thx)/.test(ql)) {
    return "Anytime. Tell me what to do next.";
  }

  // Summary / overview
  if (/\b(summary|summarize|overview|tldr|recap|brief)\b/.test(ql)) {
    const snippet = factsSnippet(facts, 280);
    return snippet
      ? `Quick read of ${pageTitle}: ${snippet} Want me to drill into any line?`
      : `I'd summarize ${pageTitle}, but I don't have a fact snapshot yet — tap one of the suggestions and I'll pull from that.`;
  }

  // Why / explain / walk through — give a longer, fact-backed answer.
  if (/\b(why|explain|walk me through|how come|what's driving)\b/.test(ql)) {
    const snippet = factsSnippet(facts, 360);
    return snippet
      ? `Driver-side read: ${snippet} Want the offsets, or shall I draft the rationale for the file?`
      : `I'd walk you through it, but the page hasn't published facts yet. Try one of the suggested actions to anchor the answer.`;
  }

  // Missing / outstanding / next steps
  if (/\b(missing|outstanding|what's left|what needs|what do i need)\b/.test(ql)) {
    return `Pull "What's still missing?" from the suggestions — I'll cross-check the document matrix against the current stage and call out gaps.`;
  }

  // Pricing / factor / commission language
  if (/\b(factor|price|premium|commission|sir|retention|rate)\b/.test(ql)) {
    return `On pricing: I can validate factors against UE's manual band, suggest offsets (SIR, sprinkler credit, commission tier), and draft a defense memo if you're outside the band. Tap "Suggest offsets" or tell me which lever to pull.`;
  }

  // Default — pivot to suggestions.
  const snippet = factsSnippet(facts, 200);
  return snippet
    ? `Here's what I'm seeing: ${snippet} Want a chart, a draft, or to navigate somewhere?`
    : `I can summarize, draft, refer, or navigate. Try one of the chips below — they map directly to live actions on this page.`;
}

function detectReferralTrigger(ql: string, facts: string): string | null {
  const f = facts.toLowerCase();
  const triggers: string[] = [];

  // Factor > 1.20×
  const factorMatch = f.match(/(\d+\.\d{2})×/g);
  if (factorMatch && factorMatch.some(m => parseFloat(m) > 1.20)) {
    triggers.push("a coverage factor above 1.20×");
  }
  // Cyber sublimit > $1M
  if (/cyber/.test(f) && /\$([2-9]|\d{2,})\,?\d{0,3}\,?\d{3}/.test(f)) {
    if (/cyber.*\$([2-9]|[1-9]\d)[mM]/.test(facts)) triggers.push("cyber sublimit above $1M on a K-12 account");
  }
  // Premium > $750K
  const premMatch = facts.match(/\$([\d,]+(?:\.\d+)?)([KM])?/g);
  if (premMatch) {
    for (const p of premMatch) {
      const num = parseFloat(p.replace(/[$,]/g, ""));
      const isM = /M$/i.test(p);
      const dollars = isM ? num * 1_000_000 : /K$/i.test(p) ? num * 1_000 : num;
      if (dollars > 750_000) { triggers.push("total premium above $750K"); break; }
    }
  }
  // Loss ratio > 75%
  const lr = facts.match(/loss ratio[^0-9]*(\d+)/i);
  if (lr && parseInt(lr[1]!, 10) > 75) triggers.push(`loss ratio ${lr[1]}%`);

  // Only fire if the user actually asked something referral-flavored OR
  // there's a clear trigger AND the user asked about pricing.
  const askedAboutReferral = /\b(refer|referral|escalat|senior uw|director|sign[- ]?off)\b/.test(ql);
  if (askedAboutReferral && triggers.length) {
    return `This file fires a referral trigger: ${triggers.join(", ")}. I can route it to Robert Chen (Director of UW) with a one-line rationale — say the word and I'll open the referral panel.`;
  }
  if (askedAboutReferral) {
    return `No referral triggers visible on the current facts. Standard authority covers this one — tap the Refer button only if you want optional sign-off on a discretionary credit.`;
  }
  return null;
}

function factsSnippet(facts: string, max = 320): string {
  if (!facts) return "";
  // Pick the first 2 informative lines.
  const lines = facts.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const out = lines.slice(0, 2).join(" · ");
  return out.length > max ? out.slice(0, max - 1) + "…" : out;
}
