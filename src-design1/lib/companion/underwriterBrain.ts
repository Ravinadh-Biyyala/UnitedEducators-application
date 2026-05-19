// Underwriter expert system for the Quote Builder Companion.
// Produces account-specific, coverage-line-aware nudges that read like a senior
// UE underwriter — not generic "above book" boilerplate.
//
// Ported from the reference uw-workbench project. Pure TS, no React.

import type { SubmissionProfile } from "./companionTypes";

export type Tone = "blue" | "gold" | "green" | "red" | "violet";

export type AdviceChip = { id: string; label: string; tone?: Tone };

export type Advice = {
  text: string;          // 2–4 sentences, real reasoning
  tone: Tone;            // panel coloring
  chips?: AdviceChip[];  // 1–2 follow-up actions
  severity: 0 | 1 | 2;   // 0 informational, 1 watch, 2 escalate
};

// ── Coverage taxonomy ────────────────────────────────────────────────────
function coverageKey(name: string): "GL" | "Property" | "ELL" | "EPL" | "Cyber" | "StudentAccident" | "Auto" | "Crime" | "Other" {
  const n = name.toLowerCase();
  if (n.includes("general liability") || n === "gl")               return "GL";
  if (n.includes("property") || n.includes("building"))            return "Property";
  if (n.includes("educators legal") || n === "ell")                return "ELL";
  if (n.includes("employment") || n === "epl")                     return "EPL";
  if (n.includes("cyber") || n.includes("privacy"))                return "Cyber";
  if (n.includes("student") || n.includes("accident"))             return "StudentAccident";
  if (n.includes("auto"))                                          return "Auto";
  if (n.includes("crime"))                                         return "Crime";
  return "Other";
}

// Underwriting "book" benchmarks — the manual-rate band where UE doesn't ask questions.
const BAND: Record<ReturnType<typeof coverageKey>, [number, number]> = {
  GL:               [0.92, 1.12],
  Property:         [0.90, 1.15],
  ELL:              [0.95, 1.18],
  EPL:              [0.90, 1.20],
  Cyber:            [0.85, 1.25],
  StudentAccident:  [0.95, 1.10],
  Auto:             [0.90, 1.15],
  Crime:            [0.90, 1.15],
  Other:            [0.90, 1.15],
};

// Coverage-line specific levers a UW would actually pull.
const LEVERS: Record<ReturnType<typeof coverageKey>, string[]> = {
  GL: [
    "raise SIR from $50K → $75K (~5–7% premium relief)",
    "apply Risk-Management credit if all faculty completed UE's slip/fall e-learning",
    "schedule-rate −5% for documented playground inspections last 12 months",
  ],
  Property: [
    "claim the 5% sprinklered credit — 94% coverage qualifies",
    "raise wind/hail deductible to 2% TIV in coastal counties (CT shoreline applies)",
    "schedule-rate +3% if any roof is over 25 years and not budgeted for replacement",
  ],
  ELL: [
    "apply Title IX credit (3%) — confirm mandatory harassment training is current",
    "schedule-rate −2% for documented background-check policy w/ third-party vendor",
    "manuscript narrowing of 'failure to educate' if recent special-ed disputes exist",
  ],
  EPL: [
    "apply −3% credit if HR uses outsourced employment counsel on terminations",
    "raise retention $25K → $50K to net ~6% relief",
  ],
  Cyber: [
    "verify MFA on email + admin systems for the 10% MFA credit",
    "confirm offline backups tested in last 90 days for ransomware sublimit relief",
    "schedule-rate −5% if member completed UE's cyber tabletop in last year",
  ],
  StudentAccident: [
    "exclude tackle-football participants if not offered (saves ~8%)",
    "tighten benefit period 104 → 52 weeks for non-catastrophic claims",
  ],
  Auto: [
    "raise comp/coll deductible to $2,500 for the 12+ vehicle fleet",
    "apply telematics credit if any GPS/dash-cam program in place",
  ],
  Crime: [
    "confirm dual-control on wires above $25K for the standard credit",
  ],
  Other: [
    "review against UE manual rates and apply documented credits",
  ],
};

const fmt$ = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(2)}M` :
  n >= 1_000 ? `$${(n / 1_000).toFixed(1)}K` : `$${Math.round(n).toLocaleString()}`;

const pick = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)]!;

// ── FACTOR MOVE ──────────────────────────────────────────────────────────
export function adviseFactorMove(args: {
  profile: SubmissionProfile;
  coverageName: string;
  oldFactor: number;
  newFactor: number;
  premium: number;        // current premium for THIS coverage line
  totalPremium: number;
  expiringPremium: number;
}): Advice {
  const { profile, coverageName, oldFactor, newFactor, premium, totalPremium, expiringPremium } = args;
  const key = coverageKey(coverageName);
  const [low, high] = BAND[key];
  const delta = newFactor - oldFactor;
  const dir: "up" | "down" = delta > 0 ? "up" : "down";
  const dollars = Math.round(premium * (newFactor - oldFactor) / oldFactor);
  const lossRatio = parseInt(profile.lossRatio.replace("%", ""));
  const openClaims = profile.claims.filter(c => c.status === "Open").length;
  const lever = pick(LEVERS[key]);

  // ── ABOVE BAND (escalation) ─────────────────────────────────────────
  if (newFactor > high) {
    const above = ((newFactor - high) * 100).toFixed(0);
    let context: string;
    switch (key) {
      case "GL":
        context = `K-12 day-school GL above ${high.toFixed(2)}× usually requires playground/athletics narrative and a current sprinkler inspection. With ${openClaims} open ${openClaims === 1 ? "claim" : "claims"} on file, expect Marsh to remarket if this lands above ${high.toFixed(2)}×.`;
        break;
      case "Property":
        context = `${profile.institutionName.split(" ")[0]}'s TIV with strong sprinkler coverage and masonry construction is a clean COPE — pricing ${above}% above book is hard to defend. Coastal CT wind exposure would be the only justification.`;
        break;
      case "ELL":
        context = `${profile.institutionName.split(" ")[0]} ran few ELL claims last 3 years. Holding ${newFactor.toFixed(2)}× would invite a competing UE-comparable carrier (Wright Specialty, Philadelphia) to undercut by 8–10%.`;
        break;
      case "Cyber":
        context = `If MFA, EDR, and offline backups are confirmed in the application, ${newFactor.toFixed(2)}× is above where I'd land this account. Cyber market has softened ~12% YTD on educational risks with strong controls.`;
        break;
      case "StudentAccident":
        context = `${profile.enrollment} with no tackle football and a clean 5-yr injury history doesn't support ${newFactor.toFixed(2)}×. Risk of a participation-only quote losing the package.`;
        break;
      default:
        context = `${newFactor.toFixed(2)}× sits ${above}% above UE's manual band [${low.toFixed(2)}×–${high.toFixed(2)}×] for this coverage.`;
    }
    return {
      severity: 2,
      tone: "gold",
      text: `${coverageName} factor ${newFactor.toFixed(2)}× — that's ${above}% above the UE manual band [${low.toFixed(2)}×–${high.toFixed(2)}×], adding ~${fmt$(Math.abs(dollars))} to this line. ${context} Want me to ${lever} instead?`,
      chips: [
        { id: "cap-factor", label: `Cap at ${high.toFixed(2)}× & rebalance`, tone: "blue" },
        { id: "draft-rationale", label: "Draft pricing rationale", tone: "gold" },
      ],
    };
  }

  // ── BELOW BAND (concession watch) ───────────────────────────────────
  if (newFactor < low) {
    const below = ((low - newFactor) * 100).toFixed(0);
    let context: string;
    if (lossRatio >= 55) {
      context = `Caution: 5-yr loss ratio is ${profile.lossRatio} with ${openClaims} open ${openClaims === 1 ? "claim" : "claims"}. Pricing this line below ${low.toFixed(2)}× while losses are still developing exposes the renewal to adverse experience true-up.`;
    } else {
      switch (key) {
        case "Property":
          context = `Strong sprinkler coverage and masonry construction support a credit-side rate, but going ${below}% below book is aggressive without an updated COPE survey within 12 months.`;
          break;
        case "ELL":
          context = `Three clean ELL years justifies a credit, but going ${below}% below book typically needs Risk Management to sign off if exposure (enrollment) hasn't dropped.`;
          break;
        default:
          context = `${below}% below book is aggressive for an account with ${profile.member.budget || "—"} operating budget — make sure this is documented in the underwriting file.`;
      }
    }
    return {
      severity: 1,
      tone: "blue",
      text: `${coverageName} at ${newFactor.toFixed(2)}× is ${below}% below the UE manual band [${low.toFixed(2)}×–${high.toFixed(2)}×], saving the member ~${fmt$(Math.abs(dollars))} on this line. ${context}`,
      chips: [
        { id: "draft-rationale", label: "Document the credit", tone: "blue" },
        { id: "request-rm-signoff", label: "Request RM sign-off", tone: "gold" },
      ],
    };
  }

  // ── INSIDE BAND ─────────────────────────────────────────────────────
  const towardEdge = dir === "up" ? high - newFactor : newFactor - low;
  if (towardEdge < 0.03) {
    return {
      severity: 1,
      tone: "gold",
      text: `${coverageName} now ${newFactor.toFixed(2)}× — that's pressing the ${dir === "up" ? "upper" : "lower"} edge of UE's band [${low.toFixed(2)}×–${high.toFixed(2)}×]. One more click and you'll need a defense memo. Premium delta vs. expiring is ${(((totalPremium - expiringPremium) / expiringPremium) * 100).toFixed(1)}%.`,
      chips: [
        { id: "show-band", label: "Show me the band", tone: "blue" },
        { id: "suggest", label: dir === "up" ? "Suggest offsets" : "Lock this in", tone: "gold" },
      ],
    };
  }

  return {
    severity: 0,
    tone: "blue",
    text: dir === "up"
      ? `${coverageName} ${newFactor.toFixed(2)}× — comfortably inside the UE band, ~${fmt$(Math.abs(dollars))} added. Driver: ${lossRatio >= 55 ? `loss ratio ${profile.lossRatio} with ${openClaims} open` : "rate adequacy on the renewal"}.`
      : `${coverageName} eased to ${newFactor.toFixed(2)}× — modest credit (~${fmt$(Math.abs(dollars))}). Defensible on this account; I can ${lever} for a stronger story.`,
    chips: [
      { id: "suggest", label: "Other levers on this line", tone: "blue" },
    ],
  };
}

// ── COMMISSION MOVE ──────────────────────────────────────────────────────
export function adviseCommissionMove(args: {
  profile: SubmissionProfile;
  oldComm: number;
  newComm: number;
  preCommissionTotal: number;
}): Advice {
  const { profile, oldComm, newComm, preCommissionTotal } = args;
  const delta = newComm - oldComm;
  const dollarsToBroker = preCommissionTotal * (newComm / 100);
  const dollarsToMember = preCommissionTotal * (1 + newComm / 100);
  const memberDelta = preCommissionTotal * (delta / 100);

  if (delta < 0) {
    return {
      severity: 1,
      tone: "blue",
      text: `Commission to ${newComm}% — broker take drops to ${fmt$(dollarsToBroker)} (was ${fmt$(preCommissionTotal * (oldComm / 100))}). ${profile.brokerage} books significant volume with UE; cuts below 12.5% on a sub-$200K account typically require Producer Relations sign-off. Member sees premium ${fmt$(Math.abs(memberDelta))} lighter.`,
      chips: [
        { id: "draft-broker-note", label: "Draft note to broker", tone: "blue" },
        { id: "compare-broker-tier", label: "Compare to broker tier", tone: "gold" },
      ],
    };
  }

  if (delta > 0) {
    return {
      severity: 1,
      tone: "gold",
      text: `Commission lifted to ${newComm}% — broker earns ${fmt$(dollarsToBroker)} but member premium climbs ${fmt$(memberDelta)} to ${fmt$(dollarsToMember)}. On a Tier-1 broker like ${profile.brokerage} this is rarely needed to win the placement. Worth it only if you're hedging against remarketing on the loss history.`,
      chips: [
        { id: "suggest", label: "Show fixed-premium alternative", tone: "blue" },
      ],
    };
  }

  return { severity: 0, tone: "blue", text: `Commission at ${newComm}%.`, chips: [] };
}

// ── COMPANION PRODUCT TOGGLE ────────────────────────────────────────────
export function adviseCompanionToggle(args: {
  profile: SubmissionProfile;
  added: boolean;
  code: string;
  totalCompanionsNow: number;
}): Advice {
  const { profile, added, code, totalCompanionsNow } = args;
  const product = profile.companions.find(c => c.code === code);
  const productName = product?.name ?? code;
  const reasoning = product?.reasoning ?? "";
  const arr = 18000;

  if (added) {
    return {
      severity: 0,
      tone: "gold",
      text: `Added ${productName} (${code}) — +${fmt$(arr)} ARR, total companions now ${totalCompanionsNow}. Why it lands here: ${reasoning || `${productName} historically attaches at 60%+ on K-12 private day schools when ${profile.lossRatio} loss ratio is paired with strong COPE.`} I can pull a one-pager justifying it for the proposal.`,
      chips: [
        { id: "draft-rationale", label: `One-pager for ${code}`, tone: "blue" },
        { id: "split", label: "Show new premium split", tone: "gold" },
      ],
    };
  }

  return {
    severity: 1,
    tone: "blue",
    text: `Removed ${productName} — −${fmt$(arr)} ARR. If retention was the concern, a smaller endorsement (sublimit ${fmt$(arr * 0.4)}/yr) often clears the same objection. Want me to draft that alternative?`,
    chips: [
      { id: "suggest", label: "Draft endorsement alternative", tone: "blue" },
    ],
  };
}
