export const DarkColors = {
  // ── Backgrounds — pure AMOLED pitch black ─────────────────────────────
  bg: '#000000',            // TRUE AMOLED BLACK canvas
  surface: '#000000',
  surfaceElevated: '#1C1C1E',
  card: '#121214',          // Neutral dark grey — matches Behance reference exactly
  cardBorder: 'rgba(255,255,255,0.08)',

  // ── Brand Accents — Behance 5-color palette ───────────────────────────
  // Atomic Tangerine (primary warm accent — activity, highlights)
  accent: '#F6955D',
  accentDim: 'rgba(246,149,93,0.20)',
  accentGlow: 'rgba(246,149,93,0.10)',

  // Razzmatazz (secondary vivid magenta — completion, streaks)
  accentAlt: '#E31D76',
  accentAltDim: 'rgba(227,29,118,0.18)',

  // Legacy alias kept for any components that still use accentDeep / accentGold
  accentDeep: '#E31D76',
  accentGold: '#F6955D',
  accentGoldDim: 'rgba(246,149,93,0.15)',

  // ── Text — Behance hierarchy ──────────────────────────────────────────
  textPrimary: '#FFFFFF',          // Pure white primary (H1, H2 headers)
  textSecondary: '#E0E0E0',        // Near-white for body labels
  textMuted: '#9F9FA1',            // Quick Silver — subtext, captions (Behance spec)
  textFaint: 'rgba(255,255,255,0.15)',  // Disabled / ultra-faint
  textOnAccent: '#FFFFFF',

  // ── Semantic status colors ────────────────────────────────────────────
  success: '#00D82E',              // Vivid Malachite (electric green) — Behance spec
  successDim: 'rgba(0,216,46,0.14)',
  warning: '#F6955D',              // Atomic Tangerine
  warningDim: 'rgba(246,149,93,0.14)',
  error: '#E31D76',                // Razzmatazz
  errorDim: 'rgba(227,29,118,0.12)',
  missed: '#E31D76',
  skipped: '#F6955D',
  completed: '#00D82E',

  // ── Tab bar ───────────────────────────────────────────────────────────
  tabBar: '#000000',
  tabBorder: 'rgba(255,255,255,0.10)',
  tabActive: '#F6955D',            // Atomic Tangerine for active tab
  tabInactive: 'rgba(255,255,255,0.38)',

  // ── Category colors — Behance 5-color palette mapped to categories ────
  health: '#00D82E',               // Vivid Malachite — green for health
  fitness: '#F6955D',              // Atomic Tangerine — warm for fitness
  study: '#4852F5',                // Blue Bolt — blue for study
  sleep: '#E31D76',                // Razzmatazz — purple/pink for sleep
  mindfulness: '#4852F5',          // Blue Bolt — calm blue for mindfulness
  custom: '#9F9FA1',               // Quick Silver — neutral for custom

  // ── Extras ────────────────────────────────────────────────────────────
  bgSecondary: '#0A0A0C',
  secondary: '#4852F5',            // Blue Bolt
  secondaryDim: 'rgba(72,82,245,0.15)',
  tertiary: '#E31D76',             // Razzmatazz
  tertiaryDim: 'rgba(227,29,118,0.12)',
  topEdge: 'rgba(246,149,93,0.08)',  // Faint orange top edge glow
};

export const LightColors = {
  // ── Backgrounds — crisp premium white ────────────────────────────────
  bg: '#FFFFFF',
  bgSecondary: '#F5F5F5',
  surface: '#FFFFFF',
  surfaceElevated: '#F8F8F8',
  surfaceOffset: '#F5F5F5',
  card: '#FFFFFF',
  cardBorder: 'rgba(0,0,0,0.07)',
  topEdge: 'rgba(248,61,17,0.10)',

  // ── Accents — warm orange palette (light mode brand) ─────────────────
  accent: '#F83D11',               // Spark red-orange (light mode primary)
  accentDim: 'rgba(248,61,17,0.10)',
  accentDeep: '#EA831D',
  accentGlow: 'rgba(248,61,17,0.06)',
  accentGold: '#FCC197',
  accentGoldDim: 'rgba(252,193,151,0.18)',
  accentMint: '#b0f1e6',
  accentAlt: '#E31D76',
  accentAltDim: 'rgba(227,29,118,0.10)',

  // ── Text — high-contrast dark hierarchy on white ─────────────────────
  textPrimary: '#111111',
  textSecondary: '#555555',
  textMuted: '#888888',
  textFaint: '#CCCCCC',
  textOnAccent: '#FFFFFF',

  // ── Semantic ──────────────────────────────────────────────────────────
  success: '#16A34A',
  successDim: 'rgba(22,163,74,0.10)',
  warning: '#D97706',
  warningDim: 'rgba(217,119,6,0.10)',
  error: '#DC2626',
  errorDim: 'rgba(220,38,38,0.08)',
  missed: '#DC2626',
  skipped: '#D97706',
  completed: '#16A34A',

  // ── Tab bar ───────────────────────────────────────────────────────────
  tabBar: '#FFFFFF',
  tabBorder: 'rgba(248,61,17,0.08)',
  tabActive: '#F83D11',
  tabInactive: 'rgba(0,0,0,0.28)',

  // ── Category colors ───────────────────────────────────────────────────
  health: '#00B84D',               // Softer green for light mode
  fitness: '#F83D11',              // Spark orange-red
  study: '#4852F5',                // Blue Bolt
  sleep: '#A855F7',                // Purple
  mindfulness: '#0EA5E9',          // Sky blue
  custom: '#9e9e9e',

  // ── Extras ────────────────────────────────────────────────────────────
  secondary: '#4852F5',
  secondaryDim: 'rgba(72,82,245,0.10)',
  tertiary: '#E31D76',
  tertiaryDim: 'rgba(227,29,118,0.10)',
};

export type ColorScheme = typeof DarkColors;
