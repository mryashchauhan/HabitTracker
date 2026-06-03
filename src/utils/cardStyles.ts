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

  const bg = categoryColor
    ? `${categoryColor}05`  // rgba 3% category bleed
    : surface ?? (isDark ? DarkColors.card : '#ffffff');

  return {
    backgroundColor: bg,
    borderRadius: radius,
    padding,
    borderWidth: 1,
    borderColor: isDark ? DarkColors.cardBorder : 'rgba(0,0,0,0.06)',
    borderTopColor: isDark ? DarkColors.topEdge : 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.30 : 0.08,
    shadowRadius: 12,
    elevation: 8,
  };
}

export function getCategoryColor(category: string, colors: typeof DarkColors): string {
  const map: Record<string, string> = {
    fitness: '#ff7043',
    health: '#b0f1e6',
    study: '#72d7f0',
    sleep: '#7c6aff',
    mindfulness: '#4fd1a5',
    custom: '#9e9e9e',
  };
  return map[category] ?? colors.accent;
}
