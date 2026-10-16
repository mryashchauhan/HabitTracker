// Shared gradient constants for the dark mode redesign.
// Single source of truth — imported by all screens.
// RULE: Never use rgba() for card backgrounds. Cards are always fully opaque.

// ── 8-stop light mode gradient ────────────────────────────────────────────
// Deep burnt orange at top → warm cream at bottom.
export const GRADIENT_LIGHT: readonly [string, string, ...string[]] = [
  '#D83A00',   // 0.00 — Deep burnt orange (status bar)
  '#E85400',   // 0.08 — Rich orange
  '#F47A1E',   // 0.18 — Warm bright orange (hero text area)
  '#F99A4A',   // 0.30 — Soft orange (below hero)
  '#FCC07A',   // 0.42 — Peach-gold (transition start)
  '#FDE0B0',   // 0.55 — Light warm peach
  '#FFF0DC',   // 0.70 — Very light cream-peach
  '#FFF6EE',   // 0.85 — Final warm cream (card zone)
];

// ── 8-stop dark mode gradient ─────────────────────────────────────────────
// CORRECTED: Only a very subtle, dark maroon warmth at the very top.
// The gradient transitions quickly to pure pitch black by ~30% screen height.
// This matches the Behance reference exactly — dark with a warm crown glow.
export const GRADIENT_DARK: readonly [string, string, ...string[]] = [
  '#2A0A08',   // 0.00 — Deep dark maroon (subtle warmth at status bar)
  '#1A0605',   // 0.10 — Fading maroon
  '#0D0302',   // 0.22 — Near-black warm
  '#060101',   // 0.35 — Essentially black
  '#020000',   // 0.50 — True black start
  '#000000',   // 0.65 — Pure pitch black
  '#000000',   // 0.80 — Pure pitch black
  '#000000',   // 1.00 — Pure pitch black base
];

// ── Gradient stop positions ───────────────────────────────────────────────
export const GRADIENT_LOCATIONS: readonly [number, number, ...number[]] = [
  0, 0.10, 0.22, 0.35, 0.50, 0.65, 0.80, 1.0,
];

// ── Primary background (light mode fallback) ────────────────────────────────
export const BG_LIGHT = '#F8F4F0';
export const BG_DARK = '#000000';

// ── Screen atmospheric wash (dark plum/maroon to black) ───────────────────
export const SCREEN_WASH_DARK: readonly [string, string, ...string[]] = [
  '#4A1228',  // rich dark plum/burgundy — more prominent crown
  '#2A0A16',  // warm fade
  '#0E0308',  // near-black
  '#000000',
];
export const SCREEN_WASH_LOCATIONS: readonly [number, number, ...number[]] = [0, 0.28, 0.52, 1];

// ── Card surface colours ──────────────────────────────────────────────────
// Warm ivory (light) / AMOLED near-black neutral dark (dark). FULLY OPAQUE. No rgba().
// CORRECTED: Was '#1A110C' (warm brown). Now '#121214' (neutral dark grey matching reference).
export const CARD_BG_LIGHT = '#FFF9F4';
export const CARD_BG_DARK = '#121214';

// ── Card shadow presets ───────────────────────────────────────────────────
export const CARD_SHADOW_LIGHT = {
  shadowColor: '#C06020',
  shadowOffset: { width: 0, height: 10 },
  shadowOpacity: 0.08,
  shadowRadius: 30,
  elevation: 8,
};

export const CARD_SHADOW_DARK = {
  shadowColor: '#000000',
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.80,
  shadowRadius: 24,
  elevation: 10,
};

// ── Card border presets ───────────────────────────────────────────────────
export const CARD_BORDER_LIGHT = {
  borderWidth: 0.5,
  borderColor: 'rgba(200,140,80,0.08)',
};

export const CARD_BORDER_DARK = {
  borderWidth: 1,
  borderColor: 'transparent', // Handled by gradient wrapper in GlassCard
};

// ── Liquid glass shimmer gradient (top-of-card light reflection) ──────────
// Apply as an absolute top overlay highlight
export const CARD_GLASS_SHIMMER_COLORS: readonly string[] = [
  'rgba(255,255,255,0.06)',  // subtle top edge highlight
  'rgba(255,255,255,0)',     // fades out quickly
];

// ── Gradient Edge Border ──────────────────────────────────────────────────
export const CARD_EDGE_GRADIENT: readonly string[] = [
  'rgba(255,255,255,0.20)', // top left strong
  'rgba(255,255,255,0.02)', // bottom right faint
];

// ── Card corner radius ────────────────────────────────────────────────────
export const CARD_RADIUS = 24;
