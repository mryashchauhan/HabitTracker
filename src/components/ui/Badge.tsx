import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

interface BadgeProps {
  label: string;
  color?: string;
  small?: boolean;
}

export function Badge({ label, color, small }: BadgeProps) {
  const { colors } = useTheme();
  const bg = color ? `${color}22` : colors.accentDim;
  const fg = color ?? colors.accent;

  return (
    <View
      style={{
        backgroundColor: bg,
        borderRadius: Radius.full,
        paddingHorizontal: small ? 8 : 10,
        paddingVertical: small ? 2 : 4,
        alignSelf: 'flex-start',
      }}
    >
      <Text
        style={{
          color: fg,
          fontSize: small ? Typography.size.xs : Typography.size.sm,
          fontFamily: Typography.fontFamily.medium,
          letterSpacing: Typography.tracking.wide,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
    </View>
  );
}
