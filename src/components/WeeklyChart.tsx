import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';

interface WeekDay {
  label: string;     // e.g. "Mon"
  value: number;     // count or 0/1
  date: string;
  completed: boolean;
}

interface WeeklyChartProps {
  data: WeekDay[];
  color?: string;
  maxValue?: number;
}

function AnimatedBar({
  height,
  color,
  delay,
  completed,
}: {
  height: number;
  color: string;
  delay: number;
  completed: boolean;
}) {
  const { colors, isDark } = useTheme();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: height,
      duration: 500,
      delay,
      useNativeDriver: false,
    }).start();
  }, [height]);

  return (
    <Animated.View
      style={{
        width: '100%',
        height: anim,
        backgroundColor: completed ? 'transparent' : isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
        borderRadius: 6,
        overflow: 'hidden',
        opacity: completed ? 1 : 0.5,
      }}
    >
      {completed && (
        <LinearGradient
          colors={[`${color}FF`, `${color}1A`]}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      )}
    </Animated.View>
  );
}

export function WeeklyChart({ data, color, maxValue }: WeeklyChartProps) {
  const { colors } = useTheme();
  const accentColor = color ?? colors.accent;
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const BAR_MAX_HEIGHT = 80;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: BAR_MAX_HEIGHT + 28 }}>
      {data.map((day, i) => {
        const barHeight = Math.max((day.value / max) * BAR_MAX_HEIGHT, day.value > 0 ? 8 : 3);
        return (
          <View key={i} style={{ flex: 1, alignItems: 'center', justifyContent: 'flex-end' }}>
            <AnimatedBar
              height={barHeight}
              color={accentColor}
              delay={i * 60}
              completed={day.completed}
            />
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.caption,
                fontFamily: Typography.fontFamily.semiBold,
                marginTop: 5,
                letterSpacing: 0.3,
              }}
            >
              {day.label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}
