import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { typography } from '../../theme/typography';
import { lightColors, darkColors } from '../../theme/colors';

// Placeholder hook for future theme wire-up
const useAppTheme = () => {
  // Hardcoded to light mode for now since this is just a placeholder
  return { colors: lightColors, isDark: false };
};

export interface AppTextProps extends TextProps {
  variant?: keyof typeof typography.sizes;
  font?: keyof typeof typography.fonts;
  color?: string;
  style?: any;
}

export const AppText = ({
  variant = 'body',
  font = 'body',
  color,
  style,
  children,
  ...rest
}: AppTextProps) => {
  const { colors } = useAppTheme();
  
  const defaultColor = color || colors.textPrimary;
  const fontSize = typography.sizes[variant];
  const fontFamily = typography.fonts[font];

  return (
    <Text
      style={[
        {
          color: defaultColor,
          fontSize,
          fontFamily,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </Text>
  );
};
