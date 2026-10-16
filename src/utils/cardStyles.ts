// Shared card style factory — ensures all cards follow the design brief anatomy
import { DarkColors } from '../theme/colors';

interface CardStyleOptions {
  isDark: boolean;
  surface?: string;
  categoryColor?: string;  // optional tint from category
  padding?: number;
  radius?: number;
}

export function getCardStyle(opts: CardStyleOptions) {
  const { isDark, surface, categoryColor, padding = 16, radius = 20 } = opts;

  const bg = surface ?? (isDark ? DarkColors.card : '#ffffff');

  return {
    backgroundColor: bg,
    borderRadius: radius,
    padding,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.40 : 0.08,
    shadowRadius: 12,
    elevation: 8,
  };
}

// ── Behance 5-color palette mapped to categories ─────────────────────────────
// These are the EXACT brand colors from the Behance reference design spec.
// Used for: left accent strips, icon circle backgrounds, progress bars, dots.
export function getCategoryColor(category: string, colors: any): string {
  const map: Record<string, string> = {
    fitness:     colors.fitness,
    health:      colors.health,
    study:       colors.study,
    sleep:       colors.sleep,
    mindfulness: colors.mindfulness,
    custom:      colors.custom,
  };
  return map[category.toLowerCase()] ?? colors.accent;
}
