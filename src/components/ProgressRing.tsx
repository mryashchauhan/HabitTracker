import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';

interface ProgressRingProps {
  percentage: number;   // 0–1
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  color?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function ProgressRing({
  percentage,
  size = 160,
  strokeWidth = 12,
  label,
  sublabel,
  color,
}: ProgressRingProps) {
  const { isDark, colors } = useTheme();
  const accent = color ?? colors.accent;
  const radius = (size - strokeWidth * 2.5) / 2; // Adjust radius to accommodate wider glow strokes
  const circumference = 2 * Math.PI * radius;
  const animatedDash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedDash, {
      toValue: circumference * Math.max(0.001, percentage),
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage, circumference]);

  const strokeDashoffset = animatedDash.interpolate({
    inputRange: [0, circumference],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        {/* Track */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isDark ? 'rgba(255,255,255,0.05)' : colors.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* ── Fallback Stacked Glow Effect (cheaper than Skia/DropShadow) ── */}
        {isDark && percentage > 0 && (
          <>
            {/* Outer soft glow */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={accent}
              strokeWidth={strokeWidth * 2.5}
              opacity={0.12}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
            {/* Inner tight glow */}
            <AnimatedCircle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              stroke={accent}
              strokeWidth={strokeWidth * 1.5}
              opacity={0.3}
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              rotation="-90"
              origin={`${size / 2}, ${size / 2}`}
            />
          </>
        )}

        {/* Crisp Progress Top Layer */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={accent}
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      {label && (
        <View style={{ alignItems: 'center' }}>
          <Text
            style={{
              color: accent,
              fontSize: Typography.size['2xl'],
              fontFamily: 'Fraunces_700Bold',
              lineHeight: Typography.size['2xl'] * 1.2,
            }}
          >
            {label}
          </Text>
          {sublabel && (
            <Text
              style={{
                color: '#9F9FA1',
                fontSize: Typography.size.sm,
                fontFamily: 'PlusJakartaSans_500Medium',
                marginTop: 2,
              }}
            >
              {sublabel}
            </Text>
          )}
        </View>
      )}
    </View>
  );
}
