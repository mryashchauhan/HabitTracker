import React, { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Platform,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  CheckCircle,
  Flame,
  Plus,
  Minus,
  Timer,
  Check,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Habit, HabitLog } from '../types';
import { useHabits } from '../context/HabitContext';
import { calculateCurrentStreak } from '../utils/streakUtils';
import { formatDate } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/cardStyles';

interface HabitCardProps {
  habit: Habit;
  log?: HabitLog;
  onPress?: () => void;
  date?: string;
  index?: number; // for stagger animation
}

export function HabitCard({ habit, log, onPress, date, index = 0 }: HabitCardProps) {
  const { colors, isDark } = useTheme();
  const { completeHabit, uncompleteHabit, logs } = useHabits();
  const [countValue, setCountValue] = useState(log?.value ?? 0);

  const today = date ?? formatDate(new Date());
  const isCompleted = log?.completed ?? false;
  const streak = calculateCurrentStreak(habit, logs);
  const categoryColor = getCategoryColor(habit.category, colors);

  // Press spring animation
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1.0, { damping: 15, stiffness: 300 });
  };

  const handleToggle = () => {
    if (Platform.OS !== 'web') {
      if (isCompleted) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    if (isCompleted) {
      uncompleteHabit(habit.id, today);
    } else {
      completeHabit(habit.id, today);
    }
  };

  const handleIncrement = () => {
    const newVal = countValue + 1;
    setCountValue(newVal);
    completeHabit(habit.id, today, newVal);
    if (Platform.OS !== 'web') {
      const target = habit.targetCount ?? 1;
      if (newVal >= target) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      } else {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handleDecrement = () => {
    const newVal = Math.max(0, countValue - 1);
    setCountValue(newVal);
    if (newVal === 0) {
      uncompleteHabit(habit.id, today);
    } else {
      completeHabit(habit.id, today, newVal);
    }
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const targetDisplay =
    habit.type === 'count'
      ? `${countValue} / ${habit.targetCount} ×`
      : habit.type === 'timed'
      ? log?.value
        ? `${Math.round(log.value / 60)} min`
        : habit.targetDuration
        ? `${Math.round(habit.targetDuration / 60)} min goal`
        : ''
      : '';

  const frequencyLabel =
    habit.frequency.type === 'daily'
      ? 'Daily'
      : habit.frequency.type === 'weekdays'
      ? 'Weekdays'
      : habit.frequency.type === 'x_per_week'
      ? `${habit.frequency.timesPerWeek}×/week`
      : 'Custom';

  const progressPct =
    habit.type === 'count' && habit.targetCount
      ? Math.min(1, countValue / habit.targetCount)
      : isCompleted
      ? 1
      : 0;

  return (
    <Animated.View style={[animStyle, { marginBottom: 10 }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={{
          backgroundColor: isCompleted
            ? `${categoryColor}08`
            : isDark ? colors.card : '#ffffff',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          padding: 16,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.28 : 0.06,
          shadowRadius: 12,
          elevation: 8,
          opacity: isCompleted ? 0.9 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          {/* Category icon container */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 12,
              backgroundColor: `${categoryColor}1a`,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 26 }}>{habit.icon}</Text>
          </View>

          {/* Info column */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <Text
              style={{
                color: isCompleted ? colors.textMuted : colors.textPrimary,
                fontSize: Typography.size.cardTitle,
                fontFamily: Typography.fontFamily.semiBold,
                textDecorationLine: isCompleted && habit.type === 'boolean' ? 'line-through' : 'none',
                marginBottom: 3,
              }}
              numberOfLines={1}
            >
              {habit.name}
            </Text>

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
              {targetDisplay ? (
                <Text
                  style={{
                    color: isCompleted ? categoryColor : colors.textMuted,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.medium,
                  }}
                >
                  {targetDisplay}
                </Text>
              ) : null}
              {/* Category pill */}
              <View
                style={{
                  backgroundColor: `${categoryColor}20`,
                  borderRadius: 4,
                  paddingHorizontal: 6,
                  paddingVertical: 2,
                }}
              >
                <Text
                  style={{
                    color: categoryColor,
                    fontSize: Typography.size.caption,
                    fontFamily: Typography.fontFamily.semiBold,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  {habit.category}
                </Text>
              </View>
              <Text
                style={{
                  color: colors.textFaint,
                  fontSize: Typography.size.caption,
                  fontFamily: Typography.fontFamily.regular,
                }}
              >
                {frequencyLabel}
              </Text>
            </View>
          </View>

          {/* Quick-log action */}
          {habit.type === 'boolean' && (
            <Pressable
              onPress={handleToggle}
              hitSlop={12}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isCompleted ? categoryColor : 'transparent',
                borderWidth: isCompleted ? 0 : 2,
                borderColor: isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {isCompleted && <Check size={20} color="#fff" weight="bold" />}
            </Pressable>
          )}

          {habit.type === 'count' && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Pressable
                onPress={handleDecrement}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Minus size={14} color={colors.textMuted} weight="bold" />
              </Pressable>
              <Text
                style={{
                  color: isCompleted ? categoryColor : colors.textPrimary,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.semiBold,
                  minWidth: 22,
                  textAlign: 'center',
                }}
              >
                {countValue}
              </Text>
              <Pressable
                onPress={handleIncrement}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  backgroundColor: `${categoryColor}25`,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Plus size={14} color={categoryColor} weight="bold" />
              </Pressable>
            </View>
          )}

          {habit.type === 'timed' && (
            <Pressable
              onPress={handleToggle}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                backgroundColor: isCompleted
                  ? `${categoryColor}25`
                  : isDark
                  ? colors.surfaceElevated
                  : '#f5f4f0',
              }}
            >
              {isCompleted ? (
                <CheckCircle size={18} color={categoryColor} weight="bold" />
              ) : (
                <Timer size={18} color={colors.textMuted} weight="regular" />
              )}
            </Pressable>
          )}
        </View>

        {/* Bottom row: progress bar + streak */}
        <View style={{ marginTop: 12, gap: 6 }}>
          {/* Progress bar */}
          <View
            style={{
              height: 3,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            {progressPct > 0 && (
              <View
                style={{
                  width: `${progressPct * 100}%`,
                  height: '100%',
                  backgroundColor: categoryColor,
                  borderRadius: 2,
                }}
              />
            )}
          </View>

          {/* Streak */}
          {streak > 0 && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
              <Flame size={12} color={colors.accentGold} weight="fill" />
              <Text
                style={{
                  color: colors.accentGold,
                  fontSize: Typography.size.label,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                {streak} day streak
              </Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}
