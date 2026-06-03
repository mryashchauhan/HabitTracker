import React from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { Typography } from '../../theme/typography';
import { Radius, Spacing } from '../../theme/spacing';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  icon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  loading,
  disabled,
  style,
  fullWidth,
}: ButtonProps) {
  const { colors } = useTheme();

  const bgColor = {
    primary: colors.accent,
    secondary: colors.accentDim,
    ghost: 'transparent',
    danger: colors.errorDim,
  }[variant];

  const textColor = {
    primary: colors.textOnAccent,
    secondary: colors.accent,
    ghost: colors.textSecondary,
    danger: colors.error,
  }[variant];

  const paddingV = { sm: 8, md: 12, lg: 16 }[size];
  const paddingH = { sm: 14, md: 20, lg: 28 }[size];
  const fontSize = { sm: Typography.size.sm, md: Typography.size.base, lg: Typography.size.md }[size];

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: bgColor,
          borderRadius: Radius.full,
          paddingVertical: paddingV,
          paddingHorizontal: paddingH,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
          ...(fullWidth && { width: '100%' }),
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={textColor} />
      ) : (
        <>
          {icon}
          <Text style={{ color: textColor, fontSize, fontFamily: Typography.fontFamily.semiBold }}>
            {label}
          </Text>
        </>
      )}
    </Pressable>
  );
}
