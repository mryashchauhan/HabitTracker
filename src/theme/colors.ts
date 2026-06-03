export const DarkColors = {
  // Backgrounds — deep warm near-black with brown undertone
  bg: '#120d07',
  surface: '#1c150f',
  surfaceElevated: '#2a1f14',
  card: '#1c150f',
  cardBorder: 'rgba(255,200,120,0.09)',
  topEdge: 'rgba(255,200,120,0.12)',

  // Accents — warm amber-orange primary, deep burnt secondary
  accent: '#f29a1f',
  accentDim: 'rgba(242,154,31,0.15)',
  accentGlow: 'rgba(242,154,31,0.08)',
  accentDeep: '#c96d05',
  accentGold: '#f5b64c',
  accentGoldDim: 'rgba(245,182,76,0.15)',

  // Text — warm off-white hierarchy
  textPrimary: '#f6efe7',
  textSecondary: '#b7a99a',
  textMuted: '#8d7d70',
  textFaint: '#4a3a2e',
  textOnAccent: '#1c0e00',

  // Semantic — kept functionally correct, slightly warmer tones
  success: '#4fd1a5',
  successDim: 'rgba(79,209,165,0.12)',
  warning: '#f5b64c',
  warningDim: 'rgba(245,182,76,0.12)',
  error: '#ff6b6b',
  errorDim: 'rgba(255,107,107,0.10)',
  missed: '#ff6b6b',
  skipped: '#f5b64c',
  completed: '#4fd1a5',

  // Tab bar — same warm near-black family as bg, thin warm border
  tabBar: '#120d07',
  tabBorder: 'rgba(255,200,120,0.10)',
  tabActive: '#f29a1f',
  tabInactive: '#4a3a2e',

  // Category colors — preserved exactly, user-approved
  health: '#b0f1e6',
  fitness: '#ff7043',
  study: '#72d7f0',
  sleep: '#7c6aff',
  mindfulness: '#4fd1a5',
  custom: '#9e9e9e',

  // Extras for compatibility
  bgSecondary: '#1c150f',
  secondary: '#7c6aff',
  secondaryDim: 'rgba(124,106,255,0.12)',
  tertiary: '#ff7043',
  tertiaryDim: 'rgba(255,112,67,0.12)',
};

export const LightColors = {
  // Backgrounds — unchanged
  bg: '#eeeeeb',
  bgSecondary: '#e5e5e2',
  surface: '#ffffff',
  surfaceElevated: '#f5f4f0',
  surfaceOffset: '#f5f4f0',
  card: '#ffffff',
  cardBorder: 'rgba(0,0,0,0.06)',
  topEdge: 'rgba(0,0,0,0.04)',

  // Accents — unchanged
  accent: '#040415',
  accentDim: 'rgba(4,4,21,0.08)',
  accentDeep: '#040415',
  accentGlow: 'rgba(4,4,21,0.04)',
  accentGold: '#febc57',
  accentGoldDim: 'rgba(254,188,87,0.12)',
  accentMint: '#b0f1e6',

  // Text — unchanged
  textPrimary: '#040415',
  textSecondary: '#4a4a5a',
  textMuted: '#6b6b6b',
  textFaint: '#a0a0a0',
  textOnAccent: '#ffffff',

  // Semantic — unchanged
  success: '#2db87c',
  successDim: 'rgba(45,184,124,0.10)',
  warning: '#e6a020',
  warningDim: 'rgba(230,160,32,0.10)',
  error: '#e74c3c',
  errorDim: 'rgba(231,76,60,0.08)',
  missed: '#e74c3c',
  skipped: '#e6a020',
  completed: '#2db87c',

  // Tab bar — unchanged
  tabBar: '#ffffff',
  tabBorder: 'rgba(0,0,0,0.06)',
  tabActive: '#040415',
  tabInactive: '#a0a0a0',

  // Category colors — unchanged
  health: '#b0f1e6',
  fitness: '#ff7043',
  study: '#72d7f0',
  sleep: '#7c6aff',
  mindfulness: '#4fd1a5',
  custom: '#9e9e9e',

  // Extras for compatibility — unchanged
  secondary: '#7c6aff',
  secondaryDim: 'rgba(124,106,255,0.10)',
  tertiary: '#ff7043',
  tertiaryDim: 'rgba(255,112,67,0.10)',
};

export type ColorScheme = typeof DarkColors;
