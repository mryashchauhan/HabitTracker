import React, { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle, Pressable } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Radius, Shadow, Spacing } from '../../theme/spacing';

interface CardProps {
  children: ReactNode;
  style?: ViewStyle;
  onPress?: () => void;
  elevated?: boolean;
  noPadding?: boolean;
}

export function Card({ children, style, onPress, elevated, noPadding }: CardProps) {
  const { colors, isDark } = useTheme();

  const baseStyle: ViewStyle = {
    backgroundColor: colors.card,
    borderRadius: Radius.xl,
    padding: noPadding ? 0 : Spacing.base,
    borderWidth: 1,
    borderColor: colors.cardBorder,
    ...(elevated ? (isDark ? Shadow.md : Shadow.sm) : {}),
  };

  if (onPress) {
    return (
      <Pressable
        style={({ pressed }) => [baseStyle, { opacity: pressed ? 0.85 : 1 }, style]}
        onPress={onPress}
      >
        {children}
      </Pressable>
    );
  }

  return <View style={[baseStyle, style]}>{children}</View>;
}
