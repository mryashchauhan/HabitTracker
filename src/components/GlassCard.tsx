/**
 * GlassCard — Premium dark material-glass card component.
 *
 * Implements Recipe A:
 * 1. Outer glow/shadow container
 * 2. 1px gradient edge border wrapper (expo-linear-gradient)
 * 3. Inner dark card body with overflow hidden
 * 4. Absolute top highlight gradient (specular sheen)
 * 5. Content layer
 */
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import {
  CARD_BG_LIGHT,
  CARD_SHADOW_DARK, CARD_SHADOW_LIGHT,
  CARD_BORDER_LIGHT,
  CARD_RADIUS,
  CARD_GLASS_SHIMMER_COLORS,
  CARD_EDGE_GRADIENT,
} from '../theme/gradients';

// Slightly lighter than pure black so cards are visible on dark wash background
const CARD_BODY_DARK = '#222226';

// Stronger edge gradient so the 1px border is clearly visible on dark bg
const EDGE: readonly [string, string, ...string[]] = [
  'rgba(255,255,255,0.28)',  // brighter top-left corner
  'rgba(255,255,255,0.04)',  // nearly invisible bottom-right
];

interface GlassCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  innerStyle?: ViewStyle; // style applied to the inner content View
  accentGlow?: string;    // Optional soft color tint for the outer shadow
}

export function GlassCard({ children, style, innerStyle, accentGlow }: GlassCardProps) {
  const { isDark } = useTheme();

  // In light mode, fallback to crisp white card
  if (!isDark) {
    return (
      <View style={[
        {
          backgroundColor: CARD_BG_LIGHT,
          borderRadius: CARD_RADIUS,
          ...CARD_BORDER_LIGHT,
          ...CARD_SHADOW_LIGHT,
        },
        style,
      ]}>
        <View style={[{ flex: 1 }, innerStyle]}>
          {children}
        </View>
      </View>
    );
  }

  const customShadow = accentGlow ? {
    shadowColor: accentGlow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  } : CARD_SHADOW_DARK;

  return (
    <View style={[{ borderRadius: CARD_RADIUS, ...customShadow }, style]}>
      {/* 2. Gradient Edge Border Wrapper — padding:1 = 1px border */}
      <LinearGradient
        colors={EDGE}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: CARD_RADIUS,
          padding: 1,
          flex: 1,
        }}
      >
        {/* 3. Inner dark card body */}
        <View style={{
          backgroundColor: CARD_BODY_DARK,
          borderRadius: CARD_RADIUS - 1,
          overflow: 'hidden',
          flexGrow: 1,
        }}>
          {/* 4. Absolute top specular highlight */}
          <LinearGradient
            colors={CARD_GLASS_SHIMMER_COLORS as unknown as readonly [string, string, ...string[]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />

          {/* 5. Content */}
          <View style={[{ flex: 1 }, innerStyle]}>
            {children}
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
