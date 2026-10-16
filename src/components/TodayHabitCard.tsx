import React, { useMemo, useRef } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Habit, HabitLog } from '../types';
import { useHabits } from '../context/HabitContext';
import { formatDate } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/cardStyles';
import { CategoryIcon } from './IconMapper';
import { GlassCard } from './GlassCard';

interface TodayHabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onPress?: () => void;
  date?: string;
  index?: number;
}

// ── 7×5 dot grid — category accent filled, neutral empty ─────────────────
function DotGrid({
  habitId,
  logs,
  isDark,
  accentColor,
}: {
  habitId: string;
  logs: HabitLog[];
  isDark: boolean;
  accentColor: string;
}) {
  const COLS = 7;
  const ROWS = 5;
  const TOTAL = COLS * ROWS;

  const cells = useMemo(() => {
    const result: boolean[] = [];
    for (let i = TOTAL - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      result.push(
        logs.some((l) => l.habitId === habitId && l.date === formatDate(d) && l.completed)
      );
    }
    return result;
  }, [habitId, logs]);

  return (
    <View style={{ gap: 2.5 }}>
      {Array.from({ length: ROWS }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap: 2.5 }}>
          {Array.from({ length: COLS }).map((_, col) => {
            const done = cells[row * COLS + col] ?? false;
            return (
              <View
                key={col}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2.5,
                  backgroundColor: done
                    ? accentColor
                    : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(180,120,60,0.10)',
                }}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
}

// ── Card inner content ────────────────────────────────────────────────────
function CardInner({
  habit,
  isCompleted,
  logs,
  isDark,
  accentColor,
}: {
  habit: Habit;
  isCompleted: boolean;
  logs: HabitLog[];
  isDark: boolean;
  accentColor: string;
}) {
  const nameColor = isDark ? '#FFFFFF' : '#2C1306';

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 14,
      width: '100%',
    }}>
      {/* LEFT: icon circle + habit name */}
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingRight: 12 }}>
        {/* Vibrant colored icon circle */}
        <View style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: `${accentColor}28`,
          borderWidth: 1,
          borderColor: `${accentColor}50`,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: 12,
          flexShrink: 0,
        }}>
          <CategoryIcon category={habit.category} emojiFallback={habit.icon} color={accentColor} size={22} weight="fill" />
        </View>

        <Text
          style={{
            color: nameColor,
            fontSize: 15,
            fontFamily: 'PlusJakartaSans_600SemiBold',
            lineHeight: 20,
            letterSpacing: -0.3,
            flex: 1,
          }}
          numberOfLines={2}
        >
          {habit.name}
        </Text>
        {isCompleted && (
          <Text style={{ fontSize: 14, marginLeft: 6 }}>🔥</Text>
        )}
      </View>

      {/* RIGHT: dot grid in category color */}
      <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
        <DotGrid
          habitId={habit.id}
          logs={logs}
          isDark={isDark}
          accentColor={accentColor}
        />
      </View>
    </View>
  );
}

export function TodayHabitCard({
  habit,
  log,
  onPress,
  date,
  index = 0,
}: TodayHabitCardProps) {
  const { isDark, colors } = useTheme();
  const { logs, completeHabit, uncompleteHabit } = useHabits();

  const isCompleted = log?.completed ?? false;
  const accentColor = getCategoryColor(habit.category, colors);

  const scale = useSharedValue(1);
  const handlePressIn = () => { scale.value = withSpring(0.97, { damping: 14, stiffness: 300 }); };
  const handlePressOut = () => { scale.value = withSpring(1.0, { damping: 14, stiffness: 300 }); };
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const lastTapRef = useRef(0);
  const singleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handlePress = () => {
    const now = Date.now();
    const DOUBLE_PRESS_DELAY = 300;
    if (now - lastTapRef.current < DOUBLE_PRESS_DELAY) {
      if (singleTapTimeoutRef.current) clearTimeout(singleTapTimeoutRef.current);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(isCompleted ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Heavy);
      }
      if (date) {
        if (isCompleted) uncompleteHabit(habit.id, date);
        else completeHabit(habit.id, date);
      }
    } else {
      singleTapTimeoutRef.current = setTimeout(() => {
        if (onPress) onPress();
      }, DOUBLE_PRESS_DELAY);
    }
    lastTapRef.current = now;
  };

  return (
    <Animated.View style={[animStyle, { width: '100%', marginBottom: 0 }]}>
      <GlassCard accentGlow={isCompleted ? accentColor : undefined}>
        <Pressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
        >
          <CardInner
            habit={habit}
            isCompleted={isCompleted}
            logs={logs}
            isDark={isDark}
            accentColor={accentColor}
          />
        </Pressable>
      </GlassCard>
    </Animated.View>
  );
}
