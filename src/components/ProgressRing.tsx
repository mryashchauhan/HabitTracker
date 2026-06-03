import React, { useEffect, useRef } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';
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
  const { colors } = useTheme();
  const accent = color ?? colors.accent;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedDash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedDash, {
      toValue: circumference * percentage,
      duration: 900,
      useNativeDriver: false,
    }).start();
  }, [percentage]);

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
          stroke={colors.cardBorder}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress */}
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
                color: colors.textMuted,
                fontSize: Typography.size.sm,
                fontFamily: 'SpaceGrotesk_500Medium',
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
