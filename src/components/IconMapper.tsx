import React from 'react';
import { Text } from 'react-native';
import { 
  Drop, 
  SneakerMove, 
  BookOpen, 
  FlowerLotus, 
  Moon, 
  Bed, 
  Barbell, 
  Lightning, 
  Heartbeat, 
  Prohibit, 
  DeviceMobileSlash,
  Star,
  CheckCircle,
  IconProps
} from 'phosphor-react-native';

interface CategoryIconProps extends IconProps {
  category: string;
  emojiFallback?: string;
}

/**
 * Maps default habit categories/emojis to sleek Phosphor vector icons.
 * This provides the smallest safe migration without mutating the backend data model.
 */
export function CategoryIcon({ category, emojiFallback, size = 20, color = '#FFFFFF', weight = 'regular', ...props }: CategoryIconProps) {
  const normalizedCategory = category.toLowerCase();
  
  // Also support falling back based on emoji string if category is "custom"
  const isMatch = (cat: string, emoji: string) => 
    normalizedCategory === cat || (emojiFallback && emojiFallback.includes(emoji));

  if (isMatch('health', '💧') || isMatch('water', '💧')) {
    return <Drop size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('fitness', '🏃') || isMatch('running', '👟')) {
    return <SneakerMove size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('study', '📚') || isMatch('reading', '📖')) {
    return <BookOpen size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('mindfulness', '🧘') || isMatch('meditation', '🧘‍♂️')) {
    return <FlowerLotus size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('sleep', '😴') || isMatch('sleep', '💤')) {
    return <Moon size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('fitness', '💪') || isMatch('workout', '🏋️')) {
    return <Barbell size={size} color={color} weight={weight} {...props} />;
  }
  if (isMatch('custom', '📵') || isMatch('focus', '📵')) {
    return <DeviceMobileSlash size={size} color={color} weight={weight} {...props} />;
  }

  // Generic fallback if we can't match it
  if (emojiFallback) {
    // We try to return a star, but if we MUST show emoji we could render Text.
    // Given the strict requirement to replace emojis, we default to a generic Phosphor icon.
    return <Star size={size} color={color} weight={weight} {...props} />;
  }
  
  return <CheckCircle size={size} color={color} weight={weight} {...props} />;
}
