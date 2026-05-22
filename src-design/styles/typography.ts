import type { CSSProperties } from "react";

/**
 * Workbench typography scale.
 *
 * Single source of truth for all text styles in src-design surfaces. Every
 * inline `style={{ fontSize, fontWeight, ... }}` declaration should resolve
 * to one of these tokens — no more arbitrary 0.62rem / 0.74rem / 0.84rem
 * sprinkling. CSS custom property equivalents live in theme.css so a future
 * Tailwind utility layer can pick them up.
 *
 * Each token bundles size + weight + line-height (and where relevant,
 * letter-spacing) so applying one token gives consistent hierarchy without
 * a second hardcoded weight prop. Override only when the context demands it.
 *
 * Hierarchy at a glance (small → large):
 *   overline → caption → bodySm → body → bodyLg → h4 → h3 → h2 → h1 → display
 */

export const weight = {
  regular:  400,
  medium:   500,
  semibold: 600,
  bold:     700,
  heavy:    800,
} as const;

// Numeric value type for fontWeight so React's CSSProperties stays happy.
type Weight = typeof weight[keyof typeof weight];

interface Typo {
  fontSize: string;
  fontWeight: Weight;
  lineHeight: number;
  letterSpacing?: string;
  textTransform?: CSSProperties["textTransform"];
}

export const typo: Record<
  | "overline" | "caption" | "bodySm" | "body" | "bodyLg"
  | "h4" | "h3" | "h2" | "h1" | "display",
  Typo
> = {
  // UPPERCASE labels — KPI labels, table column headers, badge text.
  // The small size is compensated by letter-spacing for legibility.
  // lineHeight:1 keeps badges/pills vertically centered; line-height >1 would
  // pad the line box and offset the glyph from the visual middle of a tight
  // padded container. When using as a pill with multi-char text, give the
  // container 1px more padding-right than padding-left to compensate for the
  // trailing letter-spacing on the last character.
  overline: {
    fontSize: "0.6875rem",     // 11px
    fontWeight: weight.bold,
    lineHeight: 1,
    letterSpacing: "0.08em",
    textTransform: "uppercase",
  },
  // Metadata, timestamps, "X of Y" footers, helper text under inputs.
  caption: {
    fontSize: "0.75rem",       // 12px
    fontWeight: weight.medium,
    lineHeight: 1.4,
  },
  // Table cell body, secondary content that needs to be readable but
  // shouldn't compete with primary body text.
  bodySm: {
    fontSize: "0.8125rem",     // 13px
    fontWeight: weight.medium,
    lineHeight: 1.45,
  },
  // Default body text — paragraph copy, primary table-cell content.
  body: {
    fontSize: "0.875rem",      // 14px
    fontWeight: weight.medium,
    lineHeight: 1.5,
  },
  // Emphasized body — list-item titles, important inline strings.
  bodyLg: {
    fontSize: "1rem",          // 16px
    fontWeight: weight.semibold,
    lineHeight: 1.5,
  },
  // Section card headers (inside SectionCard chrome).
  h4: {
    fontSize: "1.0625rem",     // 17px
    fontWeight: weight.bold,
    lineHeight: 1.3,
  },
  // Sub-page titles.
  h3: {
    fontSize: "1.25rem",       // 20px
    fontWeight: weight.bold,
    lineHeight: 1.25,
  },
  // Slim functional page-header titles.
  h2: {
    fontSize: "1.5rem",        // 24px
    fontWeight: weight.heavy,
    lineHeight: 1.2,
  },
  // Hero page titles (gradient hero greeting).
  h1: {
    fontSize: "1.875rem",      // 30px
    fontWeight: weight.heavy,
    lineHeight: 1.15,
    letterSpacing: "-0.01em",
  },
  // Hero numeric values — KPI tile values.
  display: {
    fontSize: "2rem",          // 32px
    fontWeight: weight.heavy,
    lineHeight: 1.1,
    letterSpacing: "-0.01em",
  },
};

/**
 * Convenience helper: merge a typo token with arbitrary CSS overrides.
 * Common when you need to add color / margin / cursor on top of a base style.
 *
 *   <p style={withTypo("body", { color: TM })}>...</p>
 */
export function withTypo(token: keyof typeof typo, overrides: CSSProperties = {}): CSSProperties {
  return { ...typo[token], ...overrides };
}
