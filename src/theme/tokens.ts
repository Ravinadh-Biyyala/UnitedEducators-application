/**
 * Design tokens. Single source of truth.
 * Tailwind config and any future UI library theme should both read from here.
 */
export const colors = {
  brand: {
    primary: '#0a2a6c',  // gradient deep navy (login panel)
    accent:  '#C9A227',  // gold (fill_LYIISI)
    vivid:   '#0123D4',  // interactive brand blue (fill_0AVDLG) — active nav, AI button
  },
  neutral: {
    900: '#1A2530',  // primary text (fill_URG5VV)
    700: '#4A5D6E',  // secondary text, inactive nav labels (fill_6RIG81)
    500: '#7A8FA3',  // muted icons, placeholder (fill_L53JAX)
    300: '#C4CDD8',  // input/button borders (fill_MJ50ID)
    200: '#DCE3EC',  // dividers, sidebar border (fill_X10TJE)
    100: '#EEF1F6',  // app/page background (fill_HZ01TL)
    50:  '#F4F6FA',  // search input background (fill_V8PE7P)
  },
  status: {
    review:   '#f5a623',
    quoted:   '#1f8a4c',
    bound:    '#2563eb',
    declined: '#b91c1c',
  },
  
  // Status — success
  successGreen:       'rgb(46, 125, 50)',
  successGreenText:   'rgb(26, 92, 48)',
  successGreenBg:     'rgb(232, 245, 236)',
  successGreenBorder: 'rgb(147, 200, 160)',

  priority: {
    critical: '#b91c1c',
    high:     '#ea580c',
    medium:   '#f59e0b',
    low:      '#6b7280',
  },
  text: { primary: '#1A2530', secondary: '#4A5D6E', muted: '#7A8FA3' },
  surface: {
    page:    '#EEF1F6',
    card:    '#ffffff',
    input:   '#F4F6FA',
    divider: '#DCE3EC',
    border:  '#C4CDD8',
  },
  form: { label: '#7A8FA3', heading: '#1A2530' },
  semantic: {
    avatarGreen:       '#1A7A4A',  // fill_LGIXK7 — avatar bg, role text green
    notificationRed:   '#B91C1C',  // fill_3MM9WH — badge
  },
  kpi: {
    iconContainerBg:     'rgba(201, 162, 39, 0.08)',
    iconContainerBorder: 'rgba(201, 162, 39, 0.157)',
    iconInReview:   '#C9A227',
    iconQuoted:     '#2E7D32',
    iconBound:      '#005B99',
    iconDaysQuote:  '#0123D4',
    iconHitRatio:   '#2E7D32',
    trendPositive:  '#2E7D32',
  },

 // Accent (gold)
  accentGold:       'rgb(201, 162, 39)',
  accentGoldDark:   'rgb(168, 132, 28)', // Phase 11: darker border for active filter tab
  accentGoldText:   'rgb(138, 92, 0)',
  accentGoldBg:     'rgb(255, 248, 230)',
  accentGoldBorder: 'rgb(240, 216, 138)',

  
    // Status — warning (amber for slow days-to-quote, overdue tasks)
  warningAmber:       'rgb(180, 83, 9)', // Phase 9: confirmed exact value from Figma
  warningAmberBg:     'rgb(255, 253, 244)',
  warningAmberBorder: 'rgb(180, 83, 9)',

  // ── Dashboard / table semantic aliases ──────────────────────────────────
  bgSurface:       '#FFFFFF',   // card backgrounds
  bgMuted:         '#EEF1F6',   // header/footer bar bg (neutral.100)
  bgMuted2:        '#F4F6FA',   // alternate muted bg (neutral.50)
  borderDefault:   '#DCE3EC',   // subtle row / section dividers (neutral.200)
  borderStrong:    '#C4CDD8',   // card borders, button borders (neutral.300)
  textHeading:     '#1A2530',   // primary heading text (neutral.900)
  textBody:        '#4A5D6E',   // body / label text (neutral.700)
  textMuted:       '#7A8FA3',   // secondary / placeholder text (neutral.500)
  brandBlue:       '#0123D4',   // interactive brand blue (brand.vivid)
  brandBlueDeep:   '#0a2a6c',   // deep navy (brand.primary)
  dangerRedBg:     '#FEF2F2',   // docs-warning pill background
  dangerRedBorder: '#FECACA',   // docs-warning pill border
  dangerRedText:   '#B91C1C',   // docs-warning pill text (semantic.notificationRed)
  dangerRed:       '#B91C1C',   // solid red fill — CountBadge bg, overdue date/icon
  infoBlueBg:      '#EFF6FF',   // light blue — task SUB-id pill background

  // ── Submissions route aliases (Phase S1) ────────────────────────────────
  // Slate / neutral aliases exposed as flat keys for the submissions route
  // tokens. These map onto existing semantic colors above; they exist so
  // Phase S1 token blocks read naturally (colors.slate600 etc.) without
  // forcing every consumer through the nested `neutral.*` namespace.
  white:        '#FFFFFF',
  slate100:     '#F0F3F8',   // filter bar bg (rgb 240, 243, 248)
  slate200:     '#DCE3EC',   // group / divider border (= borderDefault, neutral.200)
  slate300:     '#C4CDD8',   // input / button border (= borderStrong, neutral.300)
  slate500:     '#7A8FA3',   // muted label text (= textMuted, neutral.500)
  slate600:     '#4A5D6E',   // body / inactive nav label (= textBody, neutral.700)
  brandGold:    '#C9A227',   // tab underline + accent (= accentGold)
  amber600:     '#E07800',   // status row stripe — In Review / Pending Info (rgb 224,120,0)
  amber700:     '#B45309',   // overdue / warning text (= warningAmber)
  green700:     '#2E7D32',   // bound / appetite green (= successGreen)
  red700:       '#B91C1C',   // declined / quoted stripe (= dangerRed)

  // ── New Submission route additions (Phase N2) ───────────────────────────
  brandGoldDark:        '#A8841C',                    // header gold-pill border
  brandBlueAlpha03:     'rgba(1, 35, 212, 0.03)',     // selected card bg, helper-text bg
  brandBlueAlpha08:     'rgba(1, 35, 212, 0.08)',     // selected icon-box bg
  brandBlueAlpha13:     'rgba(1, 35, 212, 0.13)',     // helper-text border
  brandBlueAlpha25:     'rgba(1, 35, 212, 0.25)',     // selected icon-box border
  slate500Alpha06:      'rgba(122, 143, 163, 0.06)',  // current stage row bg
  slate500Alpha07:      'rgba(122, 143, 163, 0.07)',  // current stage pill bg
  slate500Alpha14:      'rgba(122, 143, 163, 0.14)',  // current stage row border
  slate500Alpha19:      'rgba(122, 143, 163, 0.19)',  // current stage pill border
  greenLightBg:         '#E8F5EC',                    // completed-field box bg
  greenLightBorder:     '#93C8A0',                    // completed-field box border

  // ── New Submission route additions (Phase N3) ───────────────────────────
  textHeadingAlpha50:   'rgba(26, 37, 48, 0.5)',      // input "auto-filled" placeholder text
  greenAssigned:        '#1A7A4A',                    // UW Team helper "X assigned" text + check
  warningAlertBg:       '#FFF8E6',                    // Alert (warning variant) bg
  warningAlertBorder:   '#F0D88A',                    // Alert (warning variant) border
  warningAlertIcon:     '#8A5C00',                    // Alert (warning variant) AlertTriangle icon
  warningAlertText:     '#7A4800',                    // Alert (warning variant) text
} as const;

export const gradients = {
  brandPanel: 'linear-gradient(160deg, #010F78 8.49%, #0118A0 45.85%, #0123D4 91.51%)',
} as const;

export const spacing = {
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
} as const;

export const radii = { sm: '4px', md: '8px', lg: '12px' } as const;

export const fonts = {
  sans: "'Source Sans 3', sans-serif",
  mono: "'Cousine', 'Courier New', monospace",
} as const;

export const dims = {
  tableCols: {
    id:       58,
    member:  146,
    type:     75,
    assignee: 91,
    premium:  82,
    status:  114,
    priority: 87,
    effDate:  85,
    chevron:  45,
  },
  submissionsCardWidth:  783,
  portfolioCardHeight:   289,
  rightColWidth:         380,
  pipelineCardWidth:      783,
  pipelineCardHeight:     306,
  teamPerfCardWidth:      783,
  underwriterCardHeight:  313,
  alertsCardHeight:       624,
} as const;

export const teamPerfDims = {
  headerRowHeight:   35,
  rowHeight:         58,
  columnWidth:      124,
  avatarSize:        26,
  avatarGap:         10,
  headerFontSize:     9,
  nameFontSize:      12,
  roleLabelFontSize: 10,
  statFontSize:      14,
  scoreFontSize:     13,
} as const;

export const chartDims = {
  bodyPadding:    '20px 20px 0 20px',
  bodyGap:        16,
  chartHeight:    188,
  legendItemGap:  20,
  tickCount:      5,
  yAxisWidth:     30,
  barGroupGap:    '20%',
  barGap:         3,
} as const;

export const statRowDims = {
  height:      40,
  padding:     '10px 0',
  iconSize:    13,
  gap:         8,
  bodyPadding: '4px 20px 0 20px',
} as const;

export const alertRowDims = {
  height:       89,
  outerPadding: '0 0 1px 2px',
  bodyPadding:  '10px 12px',
  contentGap:   6,
  borderWidth:  3,
} as const;

export const statusStyles = {
  New: {
    bg:     colors.slate100,
    border: colors.slate300,
    dot:    colors.slate500,
    text:   colors.slate600,
  },
  InReview: {
    bg:     '#FFF7E6',
    border: '#F5A623',
    dot:    '#F5A623',
    text:   '#7A4100',
  },
  Quoted: {
    bg:     '#E8F5E9',
    border: '#1F8A4C',
    dot:    '#1F8A4C',
    text:   '#145A32',
  },
  PendingInfo: {
    bg:     '#FEFCE8',
    border: '#EAB308',
    dot:    '#EAB308',
    text:   '#713F12',
  },
  Bound: {
    bg:     '#EFF6FF',
    border: '#2563EB',
    dot:    '#2563EB',
    text:   '#1E40AF',
  },
  Declined: {
    bg:     '#FEF2F2',
    border: '#B91C1C',
    dot:    '#B91C1C',
    text:   '#991B1B',
  },
} as const;

/**
 * Human-readable display labels for SubmissionStatus identifiers.
 *
 * The status union is PascalCase ('InReview', 'PendingInfo') so it
 * round-trips cleanly through URL params, dot-access on token maps,
 * and switch statements. Anywhere status appears in UI text, render
 * `statusLabels[status]` — never the raw value.
 */
export const statusLabels: Record<SubmissionStatus, string> = {
  New:         'New',
  InReview:    'In Review',
  Quoted:      'Quoted',
  Bound:       'Bound',
  Declined:    'Declined',
  PendingInfo: 'Pending Info',
};

export const cardDims = {
  headerHeight:  49,
  footerHeight:  36,
  headerPadding: '12px 20px',
  footerPadding: '10px 20px',
  innerPadding:  '12px 20px',
} as const;

export const taskRowVariants = {
  normal: {
    bg:         colors.bgSurface,
    borderColor: colors.borderDefault,
    titleColor:  colors.textHeading,
  },
  overdue: {
    bg:          colors.warningAmberBg,
    borderColor: colors.warningAmberBorder,
    titleColor:  colors.accentGoldText,
  },
} as const;

export const priorityStyles = {
  Critical: {
    bg:     '#FEF2F2',
    border: '#B91C1C',
    text:   '#991B1B',
  },
  High: {
    bg:     '#FFF4ED',
    border: '#EA580C',
    text:   '#9A3412',
  },
  Medium: {
    bg:     '#FFFBEB',
    border: '#F59E0B',
    text:   '#92400E',
  },
  Low: {
    bg:     '#F3F4F6',
    border: '#6B7280',
    text:   '#374151',
  },
} as const;
export const portfolioStatStyles = {
  totalSubmissionsMtd: { icon: 'Inbox',       iconColor: colors.brandBlue },
  quotedPipeline:      { icon: 'DollarSign',  iconColor: colors.successGreen },
  boundYtd:            { icon: 'ShieldCheck', iconColor: colors.brandBlueDeep },
  avgAppetiteScore:    { icon: 'Award',       iconColor: colors.accentGold },
  submissionsInSla:    { icon: 'SlaCheck',    iconColor: colors.successGreen },
  docsIncomplete:      { icon: 'AlertCircle', iconColor: colors.warningAmberBorder },
} as const;
 
// ─── Types ─────────────────────────────────────────────────────────────────
 
export type SubmissionStatus = keyof typeof statusStyles;
export type SubmissionPriority = keyof typeof priorityStyles;
export type TaskRowVariant = keyof typeof taskRowVariants;
export type PortfolioStatKey = keyof typeof portfolioStatStyles;


export const pipelineSeriesStyles = {
  submitted: { color: colors.brandBlue,     label: 'Submitted' },
  quoted:    { color: colors.brandBlueDeep, label: 'Quoted' },
  bound:     { color: colors.successGreen,  label: 'Bound' },
} as const;
 

// ─── Underwriter role styles (Phase 9) ─────────────────────────────────────
 
/**
 * Avatar styling is driven by the underwriter's role — `lead` gets the
 * gold treatment with white initials, `standard` gets a muted grey
 * square with body-color initials.
 *
 * Adding a new role:
 *   1. Add a key here with avatarBg + avatarText
 *   2. Add the key to the `UnderwriterRole` union via this map's keyof
 *
 * Component code does NOT branch on role — it looks up
 * `underwriterRoleStyles[underwriter.role]` and applies.
 */
export const underwriterRoleStyles = {
  lead:     { avatarBg: colors.accentGold,     avatarText: colors.bgSurface }, // gold bg, white initials
  standard: { avatarBg: colors.borderDefault,  avatarText: colors.textBody  }, // muted grey bg, body-text initials
} as const;
 
// ─── Team Performance stat-column styles (Phase 9) ─────────────────────────
 
/**
 * Maps each stat column to its number color. Mirrors the Pipeline series
 * coloring for visual consistency: Submitted=brandBlue, Quoted=blueDeep,
 * Bound=green. The Phase 9 table reuses the same semantic mapping.
 *
 * Note: only the In Review / Quoted / Bound columns are colored. Hit
 * Ratio and Days to Quote use their own logic (always-heading and
 * threshold-driven respectively).
 */
export const teamPerfStatStyles = {
  inReview: { color: colors.brandBlue },
  quoted:   { color: colors.brandBlueDeep },
  bound:    { color: colors.successGreen },
} as const;
 

export type PipelineSeriesKey = keyof typeof pipelineSeriesStyles;
 
// ─── Days-to-Quote threshold (Phase 9) ─────────────────────────────────────
 
/**
 * Confirmed from Figma: values < 4.0 render green, ≥ 4.0 render amber.
 * The Figma data verifies the cutoff: 3.8d and 3.2d are green, 4.5d and
 * 4.9d are amber.
 *
 * Changing this threshold is a one-line edit; the component reads the
 * constant and never embeds the number.
 */
export const daysToQuoteThreshold = {
  fastUnder: 4.0,
  fastColor: colors.successGreen,
  slowColor: colors.warningAmber,
} as const;
 
// ─── Types ─────────────────────────────────────────────────────────────────
 
export type UnderwriterRole = keyof typeof underwriterRoleStyles;
export type TeamPerfStatKey = keyof typeof teamPerfStatStyles;


// ─── Alert severity styles (Phase 11) ──────────────────────────────────────
 
/**
 * Maps each alert severity to its row treatment.
 * AlertRow component looks up `alertSeverityStyles[alert.severity]`.
 *
 * Adding a new severity:
 *   1. Add a key here with { bg, border, titleColor }
 *   2. Add the key to AlertSeverity union (auto-derived via keyof typeof)
 *   3. Add data to MOCK_ALERTS
 * Component code does NOT change.
 *
 * Confirmed from Figma JSON (Phase 11):
 *   - critical: red bg, red border  (e.g. Missing Safety Questionnaire)
 *   - warning:  amber bg, amber border (e.g. Open Litigation Flagged)
 *   - info:     blue bg, blue-deep border (e.g. Missing Background Check)
 */
export const alertSeverityStyles = {
  critical: { bg: colors.dangerRedBg,    border: colors.dangerRed,       titleColor: colors.textHeading },
  warning:  { bg: colors.accentGoldBg,   border: colors.warningAmber,    titleColor: colors.textHeading },
  info:     { bg: colors.infoBlueBg,     border: colors.brandBlueDeep,   titleColor: colors.textHeading },
} as const;
 
// ─── Alert filter tab styles (Phase 11) ────────────────────────────────────
 
/**
 * The 3 filter pills (All / Critical / Warning) at the top of the Alerts card.
 *
 * "All" is the default-active label; when active, it uses gold treatment.
 * When inactive, all pills look the same (white bg + grey border + muted text).
 *
 * The two-state map (active/inactive) is intentionally generic so future
 * filter-tab UIs can reuse the styling. The pill's label is provided by
 * the caller — this map is JUST visual.
 */
export const alertFilterStyles = {
  active:   { bg: colors.accentGold,    border: colors.accentGoldDark,   text: colors.textHeading },
  inactive: { bg: colors.bgSurface,     border: colors.borderStrong,     text: colors.textMuted   },
} as const;
 
// ─── Types ─────────────────────────────────────────────────────────────────
 
export type AlertSeverity = keyof typeof alertSeverityStyles;


// ═══════════════════════════════════════════════════════════════════════════
// Submissions route (Phase S1)
// ═══════════════════════════════════════════════════════════════════════════
//
// All values from Figma. The xStyles + DISPLAY_ORDER pattern is load-bearing:
// future S2/S3/S4 phases iterate scopes / statuses / products / filter groups
// via the *_DISPLAY_ORDER constants below — never hardcoded arrays.
//
// Adding a new scope / product / filter group:
//   1. Add the key to the relevant DISPLAY_ORDER (controls visual order)
//   2. Add the key to the relevant labels record (controls display text)
//   3. Update the union type if it's keyed by string literal
// Component code does NOT branch — it maps over DISPLAY_ORDER.

export const submissionsRouteDims = {
  // Header band
  headerBandHeight:    156,
  headerBandPaddingX:  32,
  headerBandPaddingY:  20,

  // Scope tabs row
  scopeTabsHeight:     62,
  scopeTabsPaddingX:   32,
  scopeTabsPaddingY:   12,

  // Layout
  /** @deprecated S3 — filters live in a drawer now; use submissionsFiltersDrawerStyles.widthClamp. Kept for back-compat with S1 references. */
  filtersWidth:        252,
  /** @deprecated S3 — drawer no longer has a vertical right-border on the page. */
  filtersBorderRight:  1,

  // List table area (formerly right of filters; now full width)
  listMinHeight:       600,
} as const;

// S2 patches three S1 values to match live Figma:
//   - labelColor opaque-white → 45%-alpha white (fill_CZ1L58)
//   - valueWeight 700 → 800 ExtraBold (style_4H09MG)
//   - `width: 182` is now a fallback minimum only; at desktop the band
//     divides into 5 equal columns (~253px) via grid-cols-5.
export const submissionsHeaderTileStyles = {
  width:        182,
  height:       61,
  paddingX:     24,
  paddingY:     12,
  gap:          2,
  labelColor:   '#FFFFFF',   // Figma nodes 645-2118/2133: solid white (was 0.45 opacity)
  labelSize:    9.28,        // Figma: 9.28px (was 9)
  labelWeight:  600,
  valueColor:   colors.white,
  valueSize:    17.6,        // Figma: 17.6px (was 18)
  valueWeight:  800,
} as const;

// 5-tile DISPLAY_ORDER for header
export const SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER = [
  'totalSubmissions',
  'inReview',
  'quoted',
  'boundYtd',
  'boundPremiumYtd',
] as const;

export type SubmissionsHeaderTileKey = typeof SUBMISSIONS_HEADER_TILES_DISPLAY_ORDER[number];

export const submissionsHeaderTileLabels: Record<SubmissionsHeaderTileKey, string> = {
  totalSubmissions: 'Total Submissions',
  inReview:         'In Review',
  quoted:           'Quoted',
  boundYtd:         'Bound (YTD)',
  boundPremiumYtd:  'Bound Premium (YTD)',
};

export const submissionsScopeTabsStyles = {
  height:                  62,
  paddingX:                32,
  tabHeight:               37,
  tabFontSize:             13,
  inactiveColor:           colors.slate600,
  inactiveWeight:          400,
  activeColor:             colors.brandBlue,
  activeWeight:            700,
  activeUnderlineColor:    colors.brandGold,
  activeUnderlineHeight:   2,
  resultsCountColor:       colors.slate600,
  resultsCountSize:        12,
  filtersToggleHeight:       36,
  filtersToggleWidth:        80,
  filtersToggleBg:           colors.white,        // outline style (was brandBlue solid)
  filtersToggleColor:        colors.textBody,     // dark text on white bg
  filtersToggleBorderColor:  colors.borderStrong, // neutral grey border
  filtersToggleBorderWidth:  1,
  filtersToggleSize:         12,
  filtersToggleWeight:       600,
} as const;

// 3-scope DISPLAY_ORDER — type comes from shared/types/submission.ts but the
// theme layer can't import shared (boundary rule), so we restate the union here
// and `satisfies` it on the consumer side at the type layer.
export const SUBMISSIONS_SCOPES_DISPLAY_ORDER = ['mine', 'team', 'all'] as const;

export type SubmissionsScopeKey = typeof SUBMISSIONS_SCOPES_DISPLAY_ORDER[number];

export const submissionsScopeLabels: Record<SubmissionsScopeKey, string> = {
  mine: 'My Queue',
  team: 'My Team',
  all:  'All',  // was 'All Submissions' — Step 8a
};

export const submissionsFiltersStyles = {
  /** @deprecated S3 — filters are in a drawer; chrome width comes from submissionsFiltersDrawerStyles.widthClamp. */
  width:                  252,
  groupBorderColor:       colors.slate200,
  groupHeaderHeight:      40,
  groupHeaderPaddingX:    20,
  groupHeaderFontSize:    10,
  groupHeaderWeight:      700,
  groupHeaderColor:       colors.slate500,
  groupBodyPaddingX:      20,
  filterBarBg:            colors.slate100,
  filterBarHeight:        40,
  resetColor:             colors.red700,
  resetSize:              10,
  resetWeight:            700,
  checkboxSize:           15,
  checkboxBorder:         2,
  checkboxBorderColor:    colors.slate300,
  checkboxLabelGap:       10,
  checkboxLabelSize:      12,
  checkboxLabelColor:     colors.slate600,
  inputHeight:            34,
  inputPaddingLeft:       30,
  inputPaddingRight:      8,
  inputBorderColor:       colors.slate300,
  dotSize:                7,
  rowHeight:              26,
} as const;

// 8 filter groups in display order
export const SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER = [
  'keyword',
  'status',
  'priority',
  'products',
  'jurisdiction',
  'broker',
  'underwriter',
  'submittedDate',
] as const;

export type SubmissionsFilterGroupKey = typeof SUBMISSIONS_FILTER_GROUPS_DISPLAY_ORDER[number];

export const submissionsFilterGroupLabels: Record<SubmissionsFilterGroupKey, string> = {
  keyword:       'Keyword Search',
  status:        'Status',
  priority:      'Priority',
  products:      'Product Lines',
  jurisdiction:  'State / Jurisdiction',
  broker:        'Broker',
  underwriter:   'Assigned Underwriter',
  submittedDate: 'Submission Date',
};

// S4 patches against live Figma node 520-29725 (table region):
//   - rowLeftStripeWidth 2 → 2.4 (Figma stroke 2.4px on row left edge)
//   - colWidths updated to v2 widths summing to ~1266 (full bleed via
//     `-mx-8 -mt-7` on SubmissionsPage). S1 widths summed to 1014;
//     they were sized for a narrower content area.
//   - Added rowBg, rowBorderColor, rowBorderWidth, headerBorderWidth
//     and chevronColor/Size for the row-end open chevron.
export const submissionsListTableDims = {
  rowMinHeight:        80,
  rowPaddingY:         0,
  rowLeftStripeWidth:  2.4,
  rowBg:               colors.white,
  rowBorderColor:      colors.slate200,
  rowBorderWidth:      0.8,
  // Percentage widths — sum to 100%. Member wider to accommodate long names.
  colWidths: {
    memberInstitution: '24%',
    type:               '8%',
    products:          '14%',
    stage:              '9%',
    premium:           '10%',
    underwriter:        '9%',
    appetite:           '7%',
    age:                '5%',
    needBy:             '7%',
    effective:          '7%',
  },
  cellPaddingX:          12,
  cellPaddingY:          16,
  chevronSize:           12,
  chevronColor:          '#C4CDD8',               // Figma fill_ARW4QN — Effective cell icon
  headerHeight:          39,                      // Figma: 38.89px (was 40)
  headerBg:              colors.brandBlue,        // Figma: white text → dark bg (was white)
  headerBorderColor:     'rgba(255, 255, 255, 0.1)',  // matches tile separator
  headerBorderWidth:     0.8,                     // was 1.6
  paginationBorderColor: colors.slate200,         // row-separator below last data row
  paginationBorderWidth: 0.8,
  headerPaddingX:        12,
  headerFontSize:        9.92,                    // Figma: 9.92px (was 10)
  headerFontWeight:      700,
  headerInactiveColor:   'rgba(255, 255, 255, 0.85)',  // Figma fill_7YH12X
  headerActiveColor:     '#FFFFFF',               // active sort column = full white
} as const;

// Status row left-edge stripe colors. Keys must match SubmissionStatus union
// exactly (PascalCase). Component code looks up
// `submissionsRowStatusStripes[row.status]` — no branching.
//
// S4: InReview updated to red700 per Figma (was amber600 in S1). The Figma
// sample shows In Review rows with red stripes; PendingInfo stays amber.
export const submissionsRowStatusStripes: Record<SubmissionStatus, string> = {
  New:         colors.brandBlue,
  InReview:    colors.red700,
  Quoted:      colors.red700,
  Bound:       colors.green700,
  Declined:    colors.red700,
  PendingInfo: colors.amber600,
};

// S4 patches: chip is translucent blue with brand-blue text + a faint
// blue border (NOT solid blue with white text). Icon stroke is slate500
// per Figma (the icon is muted-grey, NOT inherited blue from the text).
export const productChipStyles = {
  height:        20,
  paddingX:      6,
  paddingY:      2,
  gap:           4,
  bg:            'rgba(1, 35, 212, 0.03)',
  textColor:     colors.brandBlue,
  borderColor:   'rgba(1, 35, 212, 0.13)',
  borderWidth:   0.8,
  fontSize:      9,
  fontWeight:    700,
  iconSize:      11,
  iconColor:     colors.slate500,
  rowGap:        4,
} as const;

// 9 product lines in display order — declared as readonly tuple here; the
// consumer `ProductLine` union type lives in shared/types/submission.ts.
export const SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER = [
  'EPL', 'ELL', 'GL', 'ML', 'Cyber', 'Property', 'Crime', 'Auto', 'SA',
] as const;

export type ProductLineKey = typeof SUBMISSIONS_PRODUCT_LINES_DISPLAY_ORDER[number];

export const productLineLabels: Record<ProductLineKey, string> = {
  EPL:      'EPL',
  ELL:      'ELL',
  GL:       'GL',
  ML:       'ML',
  Cyber:    'Cyber',
  Property: 'Property',
  Crime:    'Crime',
  Auto:     'Auto',
  SA:       'SA',
};

// S4: Figma shows a 2-color split (≥ threshold = green, < threshold = amber).
// Threshold and amber colors live alongside the existing green so consumers
// pick fill+label color via a single helper.
export const appetiteBarStyles = {
  width:           116,    // total cell width (track + gap + label)
  trackWidth:      80,
  trackHeight:     5,
  trackBg:         colors.slate200,
  fillBgGreen:     colors.green700,
  fillBgAmber:     colors.amber700,
  labelSize:       11,
  labelWeight:     700,
  labelColorGreen: colors.green700,
  labelColorAmber: colors.amber700,
  greenThreshold:  85,     // percent ≥ 85 → green; < 85 → amber
  gap:             6,
} as const;

// S4 patches:
//   - itemSize 32 → 34 (Figma active button is 34×34)
//   - inactiveBorderColor slate300 → slate200 (#DCE3EC)
//   - countLabelSize split into showingLabelSize (11.84) + pageOfLabelSize (11.2)
//   - Added activeShadow, activeBorderColor, disabledOpacity, prevNextIconSize,
//     prevNextHeight, prevNextPaddingX (Figma values)
export const paginationStyles = {
  height:                67.6,
  paddingX:              24,
  paddingY:              16,
  itemSize:              34,
  gap:                   4,
  inactiveBorderColor:   colors.slate200,
  inactiveBorderWidth:   0.8,
  inactiveColor:         colors.slate500,
  activeBg:              colors.brandBlue,
  activeBorderColor:     colors.brandBlue,
  activeColor:           colors.white,
  activeWeight:          800,                       // Figma ExtraBold
  activeShadow:          '0 2px 8px 0 rgba(1, 35, 212, 0.21)',
  inactiveSize:          12.48,
  inactiveWeight:        400,
  prevNextHeight:        32,
  prevNextPaddingX:      12,
  prevNextSize:          12.16,
  prevNextWeight:        600,                       // SemiBold
  prevNextIconSize:      13,
  disabledOpacity:       0.35,
  countLabelColor:       colors.slate500,
  showingLabelSize:      11.84,
  pageOfLabelSize:       11.2,
  countLabelBoldColor:   colors.textHeading,        // for the bolded numbers inline
  dividerColor:          colors.slate200,
  dividerHeight:         14,
  dividerWidth:          1,
} as const;

export const sortableColumnHeaderStyles = {
  fontSize:       10,
  fontWeight:     700,
  inactiveColor:  'rgba(255, 255, 255, 0.85)',
  activeColor:    '#FFFFFF',
  iconSize:       11,
  gap:            4,
} as const;

// Days-open severity thresholds: <18d normal, 18–20 warning, ≥21 critical.
export const daysOpenThresholds = {
  warning:  18,
  critical: 21,
} as const;

export const daysOpenSeverityStyles = {
  normal:   { color: colors.green700, weight: 700 },
  warning:  { color: colors.amber700, weight: 700 },
  critical: { color: colors.red700,   weight: 700 },
} as const;

export const unassignedStyles = {
  iconColor:  colors.amber700,
  textColor:  colors.amber700,
  textSize:   12,
  textWeight: 600,
  gap:        4,
} as const;

// ─── Submissions header — Phase S2 additions ───────────────────────────────
//
// S1 left these stubbed. Values verified against Figma node 520-29725 (the
// v2 submissions screen). Component code reads everything below; no raw
// colors / pixels live in SubmissionsHeader.tsx.

export const submissionsHeaderTitleStyles = {
  titleSize:      21.6,
  titleWeight:    800,
  titleColor:     colors.white,
  subtitleSize:   12.8,
  subtitleWeight: 400,
  subtitleColor:  'rgba(255, 255, 255, 0.5)',
  rowGap:         4,
} as const;

export const submissionsHeaderButtonStyles = {
  rowGap:                  8,
  iconTextGap:             8,
  iconSize:                13,
  fontSize:                12.48,
  // No borderRadius: Figma node has no `cornerRadius` property → sharp corners (0px).
  // Export — translucent white outline on the blue band
  exportWidth:             90,
  exportHeight:            36,
  exportPaddingX:          16,
  exportPaddingY:          8,
  exportBg:                'rgba(255, 255, 255, 0.12)',
  exportBorderColor:       'rgba(255, 255, 255, 0.25)',
  exportBorderWidth:       0.8,
  exportTextColor:         colors.white,
  exportTextWeight:        600,
  // New Submission — solid gold fill with brand-gold drop shadow
  newSubmissionWidth:      152,
  newSubmissionHeight:     35,
  newSubmissionPaddingX:   20,
  newSubmissionPaddingY:   8,
  newSubmissionBg:         colors.brandGold,
  newSubmissionTextColor:  colors.white,
  newSubmissionTextWeight: 700,
  newSubmissionShadow:     '0 2px 8px 0 rgba(201, 162, 39, 0.35)',
} as const;

export const submissionsHeaderChromeStyles = {
  goldStripHeight:    4,
  goldStripGradient:  'linear-gradient(90deg, rgb(201, 162, 39) 0%, rgb(168, 132, 28) 100%)',
  separatorColor:     'rgba(255, 255, 255, 0.1)',
  separatorWidth:     0.8,
  tilesRowMinHeight:  62,
} as const;

// Each tile key formats its raw number value via this map. `currency` →
// `formatCurrency` (e.g. "$552,200"); `count` → plain `String(value)`.
// Switch to `compact` later if Figma adopts $552K-style display.
export const submissionsHeaderTileFormat: Record<SubmissionsHeaderTileKey, 'count' | 'currency'> = {
  totalSubmissions: 'count',
  inReview:         'count',
  quoted:           'count',
  boundYtd:         'count',
  boundPremiumYtd:  'currency',
};

// ─── Submissions list table cells — Phase S4 ───────────────────────────────
//
// Per-cell typography + chrome for the data rows. Values verified against
// Figma node 520-29725 (cached S2 fetch). Structures kept terse: a single
// flat object per cell rather than nested groups.

export const submissionsListMemberCellStyles = {
  // Institution icon container (translucent blue square, 26×26)
  iconBoxSize:        26,
  iconBoxBg:          'rgba(1, 35, 212, 0.06)',
  iconBoxBorderColor: 'rgba(1, 35, 212, 0.13)',
  iconBoxBorderWidth: 0.8,
  iconSize:           13,
  iconColor:          colors.brandBlue,
  // Member name
  nameSize:           12.8,
  nameWeight:         700,
  nameColor:          colors.brandBlue,
  // Sub-id pill
  subIdPaddingX:      6,
  subIdPaddingY:      2,
  subIdBg:            'rgba(1, 35, 212, 0.06)',
  subIdBorderColor:   'rgba(1, 35, 212, 0.13)',
  subIdBorderWidth:   0.8,
  subIdSize:          9.92,
  subIdWeight:        700,
  subIdColor:         colors.brandBlue,
  // Meta row (state · broker)
  metaSize:           9.92,
  metaWeight:         400,
  metaColor:          colors.slate500,
  metaSeparatorColor: colors.slate200,
  // Layout
  rowGap:             8,         // gap between icon and text column
  columnGap:          4,         // gap between name and sub-id pill
  metaRowGap:         6,         // gap between state / dot / broker
  blockGap:           4,         // gap between name row and meta row
} as const;

export const submissionsListPremiumCellStyles = {
  amountSize:    13.44,
  amountWeight:  700,
  amountColor:   colors.textHeading,
  // The "X enrolled" subtext is in Figma but data shape lacks the field.
  // Subtitle styling kept here for when the field is added later.
  subtitleSize:  9.92,
  subtitleWeight: 400,
  subtitleColor: colors.slate500,
  rowGap:        2,
} as const;

export const submissionsListAssignedCellStyles = {
  avatarSize:       22,
  avatarBg:         colors.brandGold,
  avatarTextColor:  colors.white,
  avatarTextSize:   8.8,
  avatarTextWeight: 800,
  nameSize:         11.52,
  nameWeight:       400,
  nameColor:        colors.slate600,
  rowGap:           8,
} as const;

export const submissionsListDaysCellStyles = {
  daysSize:        12.48,
  daysWeight:      700,
  // Subtitle (relative time) styled here for when lastUpdated lands in
  // the data shape. Currently SubmissionsListTable does not render it.
  subtitleSize:    9.6,
  subtitleWeight:  400,
  subtitleColor:   colors.slate500,
  rowGap:          5,
} as const;

export const submissionsListSubmittedCellStyles = {
  dateSize:    11.2,
  dateWeight:  400,
  dateColor:   colors.slate500,
  gap:         4,
} as const;

// ── Submissions list rework — new cell token groups (Figma node 645-1577) ─

export const submissionsListTypePillStyles = {
  bg:          'rgba(1, 35, 212, 0.06)',
  borderColor: 'rgba(1, 35, 212, 0.14)',
  borderWidth: 0.8,
  textColor:   colors.brandBlue,
  textSize:    9.92,
  textWeight:  700,
  paddingX:    8,
  paddingY:    2,
} as const;

export const submissionsListStagePillStyles = {
  paddingX:       8,
  paddingY:       6,
  dotSize:        6,
  textSize:       10.88,
  textWeight:     700,
  inReviewBg:     '#FFF8E6',
  inReviewBorder: '#F0D88A',
  inReviewDot:    '#C9A227',
  inReviewText:   '#8A5C00',
} as const;

export const submissionsListNeedByCellStyles = {
  size:   10.88,
  weight: 600,
  color:  colors.textHeading,
} as const;

export const submissionsListEffectiveCellStyles = {
  size:         10.88,
  weight:       600,
  color:        colors.textHeading,
  chevronSize:  12,
  chevronColor: '#C4CDD8',
  gap:          4,
} as const;

export const appetiteTextStyles = {
  size:           11.2,
  weight:         700,
  textAlign:      'right' as const,
  colorGreen:     colors.green700,
  colorAmber:     colors.amber700,
  colorRed:       colors.red700,
  greenThreshold: 80,
  amberThreshold: 60,
} as const;

// Per-product lucide-react icon names. Best-guess semantic mapping —
// Figma icon SVGs lack vector path data so glyphs cannot be verified
// from JSON. Update once a visual diff is performed.
export const productLineIcons: Record<ProductLineKey, string> = {
  EPL:      'UserCheck',     // Employment Practices
  ELL:      'GraduationCap', // Educators Legal Liability
  GL:       'Shield',        // General Liability
  ML:       'Briefcase',     // Management Liability
  Cyber:    'Lock',
  Property: 'Building2',
  Crime:    'AlertOctagon',
  Auto:     'Car',
  SA:       'ShieldAlert',   // Sexual Abuse
};

// Helper: map an appetite percent to its (fillBg, labelColor) per token
// thresholds. Lives next to the token group so consumers don't repeat
// the threshold check. Pure function, no React.
export function appetiteVisualForPercent(percent: number): { fill: string; label: string } {
  return percent >= appetiteBarStyles.greenThreshold
    ? { fill: appetiteBarStyles.fillBgGreen, label: appetiteBarStyles.labelColorGreen }
    : { fill: appetiteBarStyles.fillBgAmber, label: appetiteBarStyles.labelColorAmber };
}

// ─── Submissions filters drawer — Phase S3 ─────────────────────────────────
//
// Drawer chrome (header / body / footer / width). Filter group inner styling
// continues to come from `submissionsFiltersStyles` above. The drawer itself
// is built on @radix-ui/react-dialog; values below configure the wrapper
// (`components/common/Drawer`). No drawer-specific Figma node was provided
// for S3 — values derive from existing S1 token decisions plus standard
// dialog conventions. Update if a Figma drawer frame lands later.
export const submissionsFiltersDrawerStyles = {
  // CSS clamp keeps the drawer comfortable across the responsive range
  // (320–480px) without breakpoint switching. Apply via inline style.
  widthClamp:           'clamp(320px, 90vw, 480px)',

  // Header (title + close)
  headerHeight:         56,
  headerPaddingX:       20,
  headerBorderColor:    colors.slate200,
  titleSize:            16,
  titleWeight:          700,
  titleColor:           colors.textHeading,
  closeIconSize:        18,
  closeIconColor:       colors.slate500,

  // Body (scrollable filter groups)
  bodyPaddingX:         0,   // each group manages its own X padding
  bodyPaddingY:         0,

  // Footer (reset + apply)
  footerHeight:         60,
  footerPaddingX:       20,
  footerBorderColor:    colors.slate200,

  // Active-filter count badge on the Filters button
  badgeBg:              colors.brandGold,
  badgeColor:           colors.white,
  badgeSize:            16,
  badgeFontSize:        10,
  badgeFontWeight:      700,
} as const;

// ============================================================
// 13. NEW SUBMISSION ROUTE (Phase N1 foundation; expanded in N2-N4)
// ============================================================

export type SubmissionType = 'NewBusiness' | 'CrossSell' | 'Renewal';

export type SubmissionStage =
  | 'IncompleteSubmission'
  | 'IntakeAndTriage'
  | 'Underwriting'
  | 'Quoting'
  | 'Decision'
  | 'PostBind';

export const newSubmissionRouteDims = {
  pagePaddingX:    32,
  pagePaddingY:    24,
  columnsGap:      24,
  sidebarMinWidth: 280,
  sidebarMaxWidth: 360,
} as const;

export const submissionTypeLabels: Record<SubmissionType, string> = {
  NewBusiness: 'New Business',
  CrossSell:   'Cross-Sell',
  Renewal:     'Renewal',
};

export const SUBMISSION_TYPES_DISPLAY_ORDER: SubmissionType[] = [
  'NewBusiness',
  'CrossSell',
  'Renewal',
];

export const submissionStageLabels: Record<SubmissionStage, string> = {
  IncompleteSubmission: 'Incomplete Submission',
  IntakeAndTriage:      'Intake & Triage',
  Underwriting:         'Underwriting',
  Quoting:              'Quoting',
  Decision:             'Decision',
  PostBind:             'Post-Bind',
};

export const SUBMISSION_STAGES_DISPLAY_ORDER: SubmissionStage[] = [
  'IncompleteSubmission',
  'IntakeAndTriage',
  'Underwriting',
  'Quoting',
  'Decision',
  'PostBind',
];

// ── 13.a Header band (Figma node 520-31558) ──────────────────────────────
// The blue background itself is set on the outer wrapper (page level); this
// block governs the header's inner content (title block, back link, gold
// name pill, breadcrumb separator chevron).
export const newSubmissionHeaderStyles = {
  // Outer band
  paddingX:             32,
  paddingY:             20,
  height:               83.28,
  bg:                   colors.brandBlue,
  accentStripHeight:    3,
  accentStripColor:     colors.brandGold,

  // Back link "← Submissions" (lucide ArrowLeft)
  backLinkIconSize:     14,
  backLinkGap:          7,                              // x=21 - 14 ≈ 7px between icon and text
  backLinkFontSize:     12.48,
  backLinkLineHeight:   18.72,
  backLinkFontWeight:   600,
  backLinkColor:        'rgba(255, 255, 255, 0.6)',     // one-off, see N2 rationale

  // Separator chevron (between back link and title)
  separatorIconSize:    14,

  // Title block
  titleBlockGap:        2,
  titleSize:            19.2,
  titleLineHeight:      23.04,
  titleWeight:          800,
  titleColor:           colors.white,
  subtitleSize:         12.16,
  subtitleLineHeight:   18.24,
  subtitleWeight:       400,
  subtitleColor:        colors.white,

  // Gold "generated name" pill (right side, only visible when name present)
  pillGap:              8,
  pillPaddingX:         16,
  pillPaddingY:         8,
  pillHeight:           34.89,
  pillBg:               colors.brandGold,
  pillBorderColor:      colors.brandGoldDark,
  pillBorderWidth:      0.8,
  pillIconSize:         12,
  pillIconColor:        colors.white,
  pillTextSize:         11.52,
  pillTextLineHeight:   17.28,
  pillTextWeight:       700,
  pillTextColor:        colors.white,
} as const;

// ── 13.b Breadcrumb (Figma node 520-31580) ───────────────────────────────
export const newSubmissionBreadcrumbStyles = {
  paddingX:           32,
  paddingY:           10,
  itemGap:            8,
  bg:                 colors.white,
  borderBottomColor:  colors.slate200,
  borderBottomWidth:  0.8,

  separatorChar:      '/',
  separatorSize:      12,
  separatorWeight:    400,
  separatorColor:     colors.slate300,

  linkSize:           12,
  linkLineHeight:     18,
  linkWeight:         500,
  linkColor:          colors.slate500,

  currentSize:        12,
  currentLineHeight:  18,
  currentWeight:      600,
  currentColor:       colors.brandBlue,
} as const;

// ── 13.c SectionPanel (Figma nodes 520-31595 header + 520-31594 body) ────
// Universal panel chrome (header bar + body container with 2.4px top stroke).
// Reused by Submission Type, Submission Stage, Summary Preview in N2 (and
// Account & Identity, Policy Dates, Broker, Documents, UW Team in N3-N4).
export const sectionPanelStyles = {
  // Outer body container
  bodyBg:               colors.white,
  borderColor:          colors.slate300,
  borderTopWidth:       2.4,
  borderSideWidth:      0.8,
  borderBottomWidth:    0.8,

  // Header bar
  headerBg:             colors.slate100,
  headerBorderBottom:   colors.slate200,
  headerBorderBottomWidth: 0.8,
  headerPaddingX:       20,
  headerPaddingY:       14,
  headerTitleSize:      12.48,
  headerTitleLineHeight: 18.72,
  headerTitleWeight:    800,
  headerTitleLetterSpacing: '0.07em',
  headerTitleColor:     colors.brandBlue,

  // Body inner padding (cards / content)
  bodyPaddingX:         20,
  bodyPaddingTop:       20,
  bodyPaddingBottom:    20,
} as const;

// ── 13.d SubmissionTypeCard (Figma nodes 520-31600 / 520-31613 / 520-31622)
// 3 cards in a row, gap 12. Width fills container; height fixed.
export const submissionTypeCardStyles = {
  rowGap:               12,
  height:               130.91,

  // Card container
  paddingX:             14.8,
  paddingY:             12.8,
  borderWidth:          0.8,
  defaultBg:            colors.white,
  defaultBorder:        colors.slate200,
  selectedBg:           colors.brandBlueAlpha03,
  selectedBorder:       colors.brandBlue,

  // Internal icon-box
  iconBoxSize:          28,
  iconBoxBorderWidth:   0.8,
  defaultIconBoxBg:     colors.slate100,
  defaultIconBoxBorder: colors.slate200,
  defaultIconColor:     colors.slate500,
  selectedIconBoxBg:    colors.brandBlueAlpha08,
  selectedIconBoxBorder: colors.brandBlueAlpha25,
  selectedIconColor:    colors.brandBlue,
  iconSize:             16,

  // Title + description gap from icon box (vertical layout)
  titleMarginTop:       8,         // icon box bottom (12.8+28=40.8) → title top (48.8) → 8
  titleSize:            12.48,
  titleLineHeight:      18.72,
  titleWeight:          700,
  defaultTitleColor:    colors.textHeading,
  selectedTitleColor:   colors.brandBlue,

  descriptionMarginTop: 2,         // title bottom (48.8+18.71=67.51) → desc top (69.51) ≈ 2
  descriptionSize:      10.08,
  descriptionLineHeight: 14.11,
  descriptionWeight:    500,
  descriptionColor:     colors.slate500,

  // "✓ Selected" indicator (selected variant only)
  selectedIndicatorMarginTop: 6,    // desc bottom (69.51+28.2=97.71) → indicator top (103.71) → 6
  selectedIndicatorIconSize:  10,
  selectedIndicatorGap:       4,
  selectedIndicatorTextSize:  9.6,
  selectedIndicatorTextLineHeight: 14.4,
  selectedIndicatorTextWeight: 700,
  selectedIndicatorTextLetterSpacing: '0.06em',
  selectedIndicatorTextColor: colors.brandBlue,
  selectedIndicatorText:      'Selected',
} as const;

export const submissionTypeCardData: Record<SubmissionType, {
  title:       string;
  description: string;
  iconName:    'Plus' | 'Repeat' | 'RefreshCw';
}> = {
  NewBusiness: {
    title:       'New Business',
    description: 'First-time submission from a new member account',
    iconName:    'Plus',
  },
  CrossSell: {
    title:       'Cross-Sell',
    description: 'Additional coverage lines for an existing member',
    iconName:    'Repeat',
  },
  Renewal: {
    title:       'Renewal',
    description: 'Policy renewal for a current member',
    iconName:    'RefreshCw',
  },
};

// ── 13.e StageProgress (Figma node 520-31992) ────────────────────────────
export const stageProgressStyles = {
  // Outer body padding (inside SectionPanel body)
  bodyPaddingX:         20,
  bodyPaddingY:         20,

  // Top row (Current Stage label + Required Fields counter)
  topRowGap:            16,
  labelSize:            9.6,
  labelLineHeight:      14.4,
  labelWeight:          700,
  labelLetterSpacing:   '0.08em',
  labelColor:           colors.slate500,

  // Current Stage pill
  pillMarginTop:        5,
  pillGap:              8,
  pillPaddingX:         12,
  pillPaddingY:         8,
  pillBg:               colors.slate500Alpha07,
  pillBorderColor:      colors.slate500Alpha19,
  pillBorderWidth:      0.8,
  pillDotSize:          7,
  pillDotBorderRadius:  3.5,            // EXPLICIT in Figma JSON (only on inner dot)
  pillDotColor:         colors.slate500,
  pillTextSize:         12.8,
  pillTextLineHeight:   19.2,
  pillTextWeight:       700,
  pillTextColor:        colors.slate500,
  pillIncompleteText:   'Incomplete Submission',  // shown until 4/4 fields done

  // Progress bar
  progressBarMarginTop: 16,             // pill (76.2 from top) → bar at 92.2 → ~16
  progressBarHeight:    5,
  progressBarTrackBg:   colors.slate200,
  progressBarFillColor: colors.brandBlue,

  // Required-field checklist
  checklistMarginTop:   14,             // bar (97.2) → checklist at 111.2 → 14
  checklistRowGap:      6,
  checklistRowItemGap:  8,
  checklistBoxSize:     16,
  checklistBoxBorderWidth: 0.8,
  checklistBoxIncompleteBg:     colors.slate100,
  checklistBoxIncompleteBorder: colors.slate200,
  checklistBoxCompleteBg:       colors.greenLightBg,
  checklistBoxCompleteBorder:   colors.greenLightBorder,
  checklistCheckSize:           9,           // unicode ✓ font size
  checklistCheckLineHeight:     13.5,
  checklistCheckWeight:         800,
  checklistCheckColor:          colors.green700,
  checklistLabelSize:           11.52,
  checklistLabelLineHeight:     17.28,
  checklistLabelWeight:         600,
  checklistLabelColor:          colors.textHeading,

  // Helper text block
  helperMarginTop:      16,             // checklist bottom (198.35) → helper top (214.35) → 16
  helperPaddingX:       12,
  helperPaddingY:       10,
  helperBg:             colors.brandBlueAlpha03,
  helperBorderColor:    colors.brandBlueAlpha13,
  helperBorderWidth:    0.8,
  helperTextSize:       9.92,
  helperTextLineHeight: 14.88,
  helperTextWeight:     600,
  helperTextColor:      colors.brandBlue,

  // Stage timeline
  timelineMarginTop:    16,             // helper bottom (265.73) → timeline top (281.72) → 16
  timelineRowGap:       4,
  timelineRowPaddingX:  8,
  timelineRowPaddingY:  6,
  timelineRowItemGap:   10,
  timelineDotSize:      6,
  timelineDotBorderRadius: 3,           // EXPLICIT in Figma JSON
  timelineCurrentBg:        colors.slate500Alpha06,
  timelineCurrentBorderColor: colors.slate500Alpha14,
  timelineCurrentBorderWidth: 0.8,
  timelineCurrentDotColor:  colors.slate500,
  timelineCurrentLabelSize: 11.2,
  timelineCurrentLabelLineHeight: 16.8,
  timelineCurrentLabelWeight: 700,
  timelineCurrentLabelColor: colors.slate500,
  timelineCurrentRightTextSize: 10.56,
  timelineCurrentRightTextLineHeight: 15.84,
  timelineCurrentRightTextWeight: 600,
  timelineCurrentRightTextColor: colors.slate500,
  timelineCurrentRightText:      'Incomplete Submission',

  timelinePendingDotColor:  colors.slate200,
  timelinePendingLabelSize: 11.2,
  timelinePendingLabelLineHeight: 16.8,
  timelinePendingLabelWeight: 400,
  timelinePendingLabelColor: colors.slate500,

  helperText:
    'Stage is automatically assigned based on form completion. It will advance as the submission moves through the underwriting workflow.',
} as const;

// Stages shown in the timeline (excludes IncompleteSubmission, which is the
// "incomplete" pre-state represented by the pill at top).
export const STAGE_TIMELINE_DISPLAY_ORDER: SubmissionStage[] = [
  'IntakeAndTriage',
  'Underwriting',
  'Quoting',
  'Decision',
  'PostBind',
];

// ── 13.f RequiredFieldsCounter (extracted from inside 520-31992) ─────────
export const requiredFieldsCounterStyles = {
  separatorChar:      '/',
  completedSize:      17.6,
  completedLineHeight: 17.6,
  completedWeight:    800,
  completedColor:     colors.green700,
  totalSize:          11.2,
  totalLineHeight:    11.2,
  totalWeight:        400,
  totalColor:         colors.slate500,
} as const;

// ── 13.g LabelValueRow (Figma node 520-32063 children) ──────────────────
// Generic label/value row used 9× in Summary Preview. Promoted to a common
// atom (option B per N2 Step 1 review) so dashboard StatRow stays untouched.
export const labelValueRowStyles = {
  rowGap:             12,                   // gap between consecutive rows
  labelSize:          10.24,
  labelLineHeight:    15.36,
  labelWeight:        700,
  labelLetterSpacing: '0.07em',
  labelColor:         colors.slate500,

  valueSize:          12,
  valueLineHeight:    18,
  valueWeight:        600,
  valueColor:         colors.textHeading,
} as const;

// ── 13.h Input chrome (Phase N3 — Figma nodes 520-31113 / 520-31154 / 520-31199)
// Universal input chrome shared by Input (tokenized variant), Select trigger,
// MultiSelect trigger, DateInput wrapper, AccountSearchInput trigger.
// Existing dashboard Input keeps a `variant: 'legacy'` utility-class path.
export const inputStyles = {
  height:                  38.8,
  bg:                      colors.white,
  borderColor:             colors.slate300,
  borderWidth:             0.8,
  paddingX:                11,
  paddingY:                9,
  paddingXWithLeftIcon:    34,                       // when an icon prefix is rendered

  // Text inside the input
  textSize:                12.8,
  textWeight:              400,                      // Regular for filled value
  textLineHeight:          19.2,
  textColor:               colors.textHeading,

  // Placeholder
  placeholderSize:         12.8,
  placeholderWeight:       400,
  placeholderLineHeight:   19.2,
  placeholderColor:        colors.slate500,

  // "Auto-filled from contact" disabled-look text (50% opacity heading)
  filledMutedColor:        colors.textHeadingAlpha50,

  // Left-icon prefix
  iconSize:                13,
  iconColor:               colors.slate500,
  leftIconOffsetX:         10,                       // x position from input left edge
  leftIconOffsetY:         12.9,                     // y position from input top edge

  // Right-icon (chevron / clear)
  rightIconOffsetX:        10,
  rightIconOffsetY:        12.9,
} as const;

// ── 13.i FormField label + asterisk + helper (Phase N3) ─────────────────
export const formFieldStyles = {
  // Label row
  labelGap:                6,                        // gap between label text and asterisk
  labelMarginBottom:       6,                        // gap between label row and field
  labelSize:               10.24,
  labelLineHeight:         15.36,
  labelWeight:             700,
  labelLetterSpacing:      '0.07em',
  labelColor:              colors.slate500,

  // Required-field asterisk
  asteriskColor:           colors.red700,
  asteriskSize:            10.24,
  asteriskWeight:          700,

  // Helper text below field
  helperMarginTop:         6,
  helperSize:              9.92,
  helperLineHeight:        14.88,
  helperWeight:            400,
  helperColor:             colors.slate500,          // default neutral helper
  helperColorSuccess:      colors.greenAssigned,     // "X assigned" / "auto-filled below"
  helperIconSize:          10,
  helperIconGap:           4,
} as const;

// ── 13.j Alert (Phase N3 — warning; Phase N5 — error)
// warning: Figma node 520-15260. error: derived from dangerRed token family
// (no separate Figma node; mirrored structure). info/success still omitted.
export const alertStyles = {
  warning: {
    bg:              colors.warningAlertBg,
    border:          colors.warningAlertBorder,
    borderWidth:     0.8,
    iconColor:       colors.warningAlertIcon,
    textColor:       colors.warningAlertText,
    iconSize:        14,
    paddingX:        16.8,
    paddingY:        17.8,
    iconGap:         10,
    titleSize:       11.52,
    titleLineHeight: 17.86,
    titleWeight:     700,
    bodySize:        11.52,
    bodyLineHeight:  17.86,
    bodyWeight:      400,
  },
  error: {
    bg:              colors.dangerRedBg,
    border:          colors.dangerRedBorder,
    borderWidth:     0.8,
    iconColor:       colors.dangerRed,
    textColor:       colors.dangerRedText,
    iconSize:        14,
    paddingX:        16.8,
    paddingY:        17.8,
    iconGap:         10,
    titleSize:       11.52,
    titleLineHeight: 17.86,
    titleWeight:     700,
    bodySize:        11.52,
    bodyLineHeight:  17.86,
    bodyWeight:      400,
    iconName:        'AlertCircle',
  },
} as const;

// ── 13.k Select (Phase N3 — Figma nodes 520-31199 / 520-15099) ──────────
// Trigger reuses inputStyles (chrome + left icon). Dropdown panel is
// derived from trigger styling: white bg, slate300 border, sharp corners,
// no shadow (Property Strictness — no `effects` in Figma JSON).
export const selectStyles = {
  // Right-side chevron-down on the trigger
  chevronSize:             13,
  chevronColor:            colors.slate500,

  // Trigger placeholder reuses inputStyles.placeholder*

  // Dropdown panel
  dropdownBg:              colors.white,
  dropdownBorderColor:     colors.slate300,
  dropdownBorderWidth:     0.8,
  dropdownMaxHeight:       280,
  dropdownPaddingY:        4,                        // small vertical breathing room

  // Option rows
  optionPaddingX:          11,                       // matches input padding
  optionPaddingY:          9,
  optionGap:               2,                        // between primary + secondary lines
  optionRowItemGap:        10,                       // between leading content (avatar/icon) and text block
  optionHoverBg:           colors.slate100,
  optionSelectedBg:        colors.brandBlueAlpha03,

  // Option primary line
  primarySize:             12.8,
  primaryLineHeight:       19.2,
  primaryWeight:           500,
  primaryColor:            colors.textHeading,

  // Option secondary line (e.g. brokerage contact-count, contact email)
  secondarySize:           10.08,
  secondaryLineHeight:     14.11,
  secondaryWeight:         400,
  secondaryColor:          colors.slate500,
} as const;

// ── Sidebar collapse ──────────────────────────────────────────────────────────
export const sidebarStyles = {
  widthExpanded:       '220px',
  widthCollapsed:      '60px',
  transitionDuration:  '200ms',
  transitionEasing:    'ease-out',
  logoHeight:          '76.8px',
  logoGap:             '0.625rem',  // gap between tile and brand text
  logoTileSize:        '2.5rem',    // 40×40 blue square
  logoTileBg:          colors.brandBlue,
  logoTileIconColor:   colors.accentGold,
  logoTileBorderRadius:'0.375rem',
  logoTextColor:       colors.brandBlue,
  logoTextSize:        '0.875rem',  // 14px
  logoTextWeight:      700,
  logoTextLineHeight:  1.2,
  headerPaddingTop:    '0.75rem',   // top inset inside logo block
  toggleButtonSize:    '1.75rem',   // 28px
  toggleIconSize:      14,
  toggleCollapsedBorderColor: colors.slate200,  // border on toggle button when collapsed
  navPaddingLeft:      '1rem',      // expanded item left padding
  navGap:              '0.75rem',   // icon → label gap
  navItemHeight:       '2.75rem',   // 44px
  navIconSize:         16,
  navLabelFontSize:    '0.875rem',  // 14px
  navActiveBorderColor: colors.accentGold,  // gold left border on active nav item
  navActiveBorderWidth: 3,
  roleBadgeBg:         colors.brandBlueAlpha08,
  roleBadgeTextColor:  colors.brandBlue,
  roleBadgeIconColor:  colors.brandBlue,
  roleBadgePaddingX:   '0.75rem',   // 12px
  roleBadgePaddingY:   '0.5rem',    // 8px
  roleBadgeFontSize:   '0.625rem',  // 10px
  roleBadgeFontWeight: 600,
} as const;

// ── 13.l MultiSelect chip + helper + dropdown checkmark (Phase N3) ──────
// Chip styling lives here, NOT in S4 productChipStyles (different context).
export const multiSelectStyles = {
  // Selected-chip pill (rendered inside the trigger)
  chipBg:                  colors.brandBlueAlpha08,
  chipBorderColor:         colors.brandBlueAlpha25,
  chipBorderWidth:         0.8,
  chipPaddingX:            8,
  chipPaddingY:            4,
  chipGap:                 6,                        // gap between chip text and × button
  chipTextSize:            11.2,
  chipTextLineHeight:      16.8,
  chipTextWeight:          600,
  chipTextColor:           colors.brandBlue,
  chipCloseIconSize:       10,
  chipCloseColor:          colors.brandBlue,
  chipsRowGap:             6,                        // gap between chips when wrapping

  // "X selected" helper text below trigger
  helperSize:              10.24,
  helperLineHeight:        15.36,
  helperWeight:            600,
  helperLetterSpacing:     '0.07em',
  helperColor:             colors.slate500,
  helperMarginTop:         6,

  // Dropdown checkmark on selected option (next to label)
  checkSize:               12,
  checkColor:              colors.brandBlue,
} as const;

// ── 13.m DateInput (Phase N3 — Figma node 520-31154) ────────────────────
// Wrapper chrome reuses inputStyles. This block holds DateInput-specific
// surface details (calendar icon prefix).
export const dateInputStyles = {
  iconName:                'Calendar',               // lucide-react Calendar
  iconSize:                13,
  iconLeftOffset:          10,
  iconTopOffset:           12.9,
  // Native <input type="date"> needs left padding to clear the icon
  nativeInputPaddingLeft:  32,
} as const;

// ── 13.n AccountSearchInput (Phase N3 — Figma node 520-31113) ───────────
// Trigger reuses inputStyles. Dropdown reuses selectStyles. This block
// holds search-specific text and the option-row separator.
export const accountSearchInputStyles = {
  placeholder:             'Search accounts by name, city, or type…',
  searchIconName:          'Search',                 // lucide
  searchIconSize:          13,
  clearIconName:           'X',
  clearIconSize:           13,

  // Dropdown option row format: "{name}\n{city} · {state} · {type}"
  optionSeparator:         '·',                      // U+00B7 middle dot
  optionSeparatorColor:    colors.slate300,

  // Below-trigger selected-state secondary line (e.g., "Riverside, CA · K-12 Public District")
  selectedSecondarySize:   10.08,
  selectedSecondaryLineHeight: 14.11,
  selectedSecondaryColor:  colors.slate500,
  selectedSecondaryMarginTop: 6,
} as const;

// ── 13.o FileDropzone + file row (Phase N4 — Figma nodes 520-31261 / 520-15009) ─
export const fileDropzoneStyles = {
  // ── Drop zone chrome (Figma confirmed) ────────────────────────────────────
  dropZoneBg:               '#FAFBFC',
  dropZoneBorderColor:      '#DCE3EC',
  dropZoneBorderWidth:      1.6,
  dropZoneBorderDash:       '3.2px 1.6px',           // strokeDashes [3.2, 1.6]
  dropZonePaddingH:         15.6,
  dropZonePaddingT:         15.6,
  dropZonePaddingB:         1.6,
  dropZoneGap:              4,
  dropZoneIconSize:         14,

  // ── Drop zone text (Figma confirmed) ──────────────────────────────────────
  primaryText:              'Drop files here or click to browse',
  primaryFontWeight:        600,
  primaryFontSize:          12.16,
  primaryLineHeight:        18.24,
  primaryColor:             '#7A8FA3',

  hintText:                 'PDF, DOCX, XLSX, PNG · Max 25 MB per file',
  hintFontWeight:           400,
  hintFontSize:             9.92,
  hintLineHeight:           14.88,
  hintColor:                '#7A8FA3',

  emptyStateText:           'No documents attached yet · Drag & drop or click above to add',
  emptyStateFontWeight:     400,
  emptyStateFontSize:       11.52,
  emptyStateLineHeight:     17.28,
  emptyStateColor:          '#7A8FA3',

  // ── Drag-over state — INVENTED (not in Figma) ─────────────────────────────
  activeBg:                 'rgba(1, 35, 212, 0.03)',
  activeBorderColor:        '#0123D4',               // solid replaces dashed

  // ── Section body layout (Figma confirmed) ─────────────────────────────────
  sectionBodyGap:           12,
  sectionBodyPaddingH:      20,
  sectionBodyPaddingT:      20,

  // ── File list container (Figma confirmed) ─────────────────────────────────
  fileListBorderColor:      '#DCE3EC',
  fileListBorderWidth:      0.8,

  // ── File row (Figma confirmed) ────────────────────────────────────────────
  fileRowPaddingV:          12,
  fileRowPaddingH:          16,
  fileRowGap:               12,
  fileRowBg:                '#FFFFFF',
  fileRowAltBg:             '#FAFBFC',
  fileRowBorderColor:       '#DCE3EC',
  fileRowBorderWidth:       0.8,

  // ── Error row — INVENTED (not in Figma) ───────────────────────────────────
  fileRowErrorBg:           'rgba(185, 28, 28, 0.07)',
  fileRowErrorBorderColor:  'rgba(185, 28, 28, 0.14)',
  fileRowErrorTextColor:    '#B91C1C',

  // ── PDF icon box (Figma confirmed) ────────────────────────────────────────
  pdfIconBoxSize:           36,
  pdfIconBoxBg:             'rgba(185, 28, 28, 0.07)',
  pdfIconBoxBorderColor:    'rgba(185, 28, 28, 0.14)',
  pdfIconBoxBorderWidth:    0.8,
  pdfIconFontWeight:        900,
  pdfIconFontSize:          8.32,
  pdfIconLineHeight:        12.48,
  pdfIconColor:             '#B91C1C',

  // ── File info text (Figma confirmed) ──────────────────────────────────────
  filenameFontWeight:       600,
  filenameFontSize:         12.16,
  filenameLineHeight:       18.24,
  filenameColor:            '#1A2530',

  metaFontWeight:           400,
  metaFontSize:             9.92,
  metaLineHeight:           14.88,
  metaColor:                '#7A8FA3',

  metaSeparator:            '·',                     // U+00B7
  metaSeparatorFontSize:    16,
  metaSeparatorLineHeight:  24,
  metaSeparatorColor:       '#DCE3EC',

  timestampFontSize:        9.6,
  timestampLineHeight:      14.4,

  // ── Document tag pill (Figma confirmed) ───────────────────────────────────
  tagBg:                    'rgba(1, 35, 212, 0.06)',
  tagBorderColor:           'rgba(1, 35, 212, 0.14)',
  tagBorderWidth:           0.8,
  tagFontWeight:            600,
  tagFontSize:              9.92,
  tagLineHeight:            14.88,
  tagColor:                 '#0123D4',

  // ── Actions (Figma confirmed size; icon names inferred from SVG structure) ─
  actionsWidth:             54,
  actionsHeight:            25,
  actionsGap:               4,
  viewIconName:             'Eye',
  removeIconName:           'Trash2',
  retryIconName:            'RotateCcw',             // INVENTED for error state
} as const;

// ── 13.m Actions region (Phase N5 — Figma nodes 520-14570 + 520-14577) ──────
export const actionsRegionStyles = {
  containerPaddingX: 0,
  containerPaddingY: 0,
  itemSpacing:       8,   // gap between Create + Cancel buttons (layout_8XRL5U.gap)
  sectionGap:        20,  // gap between Required banner and buttons group (outer layout gap)
} as const;
