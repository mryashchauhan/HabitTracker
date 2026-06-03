import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
  Platform,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInDown,
} from 'react-native-reanimated';
import { Plus, Flame, CheckCircle } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import LottieView from 'lottie-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { HabitCard } from '../components/HabitCard';
import { formatDate, isScheduledOnDate } from '../utils/dateUtils';
import { getTodayCompletionStats } from '../utils/streakUtils';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

function SectionLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10, marginTop: 6 }}>
      <Text
        style={{
          color: colors.textMuted,
          fontSize: Typography.size.label,
          fontFamily: Typography.fontFamily.semiBold,
          letterSpacing: Typography.tracking.section,
          textTransform: 'uppercase',
        }}
      >
        {label}
      </Text>
      <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.05)' }} />
    </View>
  );
}

export function TodayScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { habits, logs, getLogForDay } = useHabits();
  const today = formatDate(new Date());
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);

  const { total, completed, percentage } = useMemo(
    () => getTodayCompletionStats(habits, logs, today),
    [habits, logs, today]
  );

  const scheduledHabits = useMemo(
    () =>
      habits
        .filter((h) => !h.isArchived && isScheduledOnDate(h, today))
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.sortOrder - b.sortOrder;
        }),
    [habits, today]
  );

  const allDone = completed === total && total > 0;

  // Show celebration when all done
  React.useEffect(() => {
    if (allDone && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
      if (Platform.OS !== 'web') {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
      }
    }
    if (!allDone) {
      setCelebrationShown(false);
    }
  }, [allDone]);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const greetingLottie = useMemo(() => {
    // Falls back gracefully if the JSON file is absent — LottieView handles missing files
    return require('../../assets/animations/morning.json');
  }, []);

  const dayLabel = format(new Date(), 'EEE, MMM d').toUpperCase();

  // Generate 7-day week strip
  const weekDays = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = formatDate(d);
      const label = format(d, 'E')[0]; // single letter M/T/W...
      const isToday = i === 0;
      const completedDay =
        habits.filter(
          (h) =>
            !h.isArchived &&
            isScheduledOnDate(h, dateStr) &&
            logs.some((l) => l.habitId === h.id && l.date === dateStr && l.completed)
        ).length > 0;
      const scheduled = habits.filter(
        (h) => !h.isArchived && isScheduledOnDate(h, dateStr)
      ).length;
      days.push({ dateStr, label, isToday, completedDay, scheduled });
    }
    return days;
  }, [habits, logs]);

  // Section grouping by time (morning/afternoon/evening)
  const grouped = useMemo(() => {
    const morning: typeof scheduledHabits = [];
    const afternoon: typeof scheduledHabits = [];
    const evening: typeof scheduledHabits = [];

    scheduledHabits.forEach((h) => {
      const hour = h.reminder?.hour ?? -1;
      if (hour < 0 || (hour >= 5 && hour < 12)) morning.push(h);
      else if (hour >= 12 && hour < 18) afternoon.push(h);
      else evening.push(h);
    });

    return { morning, afternoon, evening };
  }, [scheduledHabits]);

  const scoreColor =
    percentage >= 1
      ? colors.success
      : percentage >= 0.5
      ? colors.accent
      : colors.textMuted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Celebration overlay */}
      {showCelebration && (
        <Modal transparent visible={showCelebration} animationType="fade">
          <View style={StyleSheet.absoluteFillObject}>
            <LottieView
              source={require('../../assets/animations/celebration.json')}
              autoPlay
              loop={false}
              style={StyleSheet.absoluteFillObject}
              onAnimationFinish={() => setShowCelebration(false)}
            />
          </View>
        </Modal>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 32 }}
      >
        {/* HEADER CARD with gradient feel */}
        <View
          style={{
            backgroundColor: isDark ? colors.surfaceElevated : '#ffffff',
            borderBottomWidth: 1,
            borderBottomColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.05)',
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 20,
          }}
        >
          {/* Top row: Lottie + greeting */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 }}>
            <View style={{ width: 80, height: 80 }}>
              <LottieView
                source={greetingLottie}
                autoPlay
                loop
                style={{ width: 80, height: 80 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.label,
                  fontFamily: Typography.fontFamily.semiBold,
                  letterSpacing: Typography.tracking.section,
                  textTransform: 'uppercase',
                  marginBottom: 4,
                }}
              >
                {dayLabel}
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 28,
                  fontFamily: Typography.fontFamily.display,
                  lineHeight: 34,
                }}
                numberOfLines={2}
              >
                {greeting} 👋
              </Text>
            </View>
            {/* Add habit button */}
            <Pressable
              onPress={() => navigation.navigate('AddHabit')}
              style={({ pressed }) => ({
                width: 38,
                height: 38,
                borderRadius: 19,
                backgroundColor: `${colors.accent}1a`,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Plus size={20} color={colors.accent} weight="bold" />
            </Pressable>
          </View>

          {/* Completion summary row */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? colors.surfaceElevated : 'rgba(0,0,0,0.04)',
              borderRadius: 14,
              paddingVertical: 12,
              paddingHorizontal: 16,
              gap: 12,
            }}
          >
            {allDone ? (
              <>
                <CheckCircle size={28} color={colors.success} weight="fill" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.success,
                      fontSize: Typography.size.cardTitle,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                  >
                    All done — amazing! 🎉
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.regular,
                    }}
                  >
                    {total} of {total} habits complete
                  </Text>
                </View>
              </>
            ) : total === 0 ? (
              <Text style={{ color: colors.textMuted, fontSize: Typography.size.body, fontFamily: Typography.fontFamily.regular, flex: 1 }}>
                Your day is ready. Let's go.
              </Text>
            ) : (
              <>
                <Text
                  style={{
                    color: scoreColor,
                    fontSize: 28,
                    fontFamily: Typography.fontFamily.semiBold,
                    lineHeight: 32,
                  }}
                >
                  {Math.round(percentage * 100)}%
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                  >
                    {completed} of {total} habits done
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: Typography.size.caption,
                      fontFamily: Typography.fontFamily.regular,
                      marginTop: 1,
                    }}
                  >
                    {total - completed} remaining
                  </Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                  <Flame size={16} color={colors.accentGold} weight="fill" />
                  <Text
                    style={{
                      color: colors.accentGold,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                  >
                    {/* Show total streaks > 0 count */}
                    {habits.filter((h) => !h.isArchived).length > 0 ? '🔥' : ''}
                  </Text>
                </View>
              </>
            )}
          </View>
        </View>

        {/* WEEK STRIP */}
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 16,
            paddingVertical: 14,
            gap: 6,
          }}
        >
          {weekDays.map((d) => {
            const allComplete =
              d.scheduled > 0 &&
              d.completedDay;
            return (
              <View
                key={d.dateStr}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  paddingVertical: 8,
                  borderRadius: 12,
                  backgroundColor: d.isToday
                    ? colors.accent
                    : allComplete
                    ? `${colors.success}20`
                    : isDark
                    ? 'rgba(255,255,255,0.04)'
                    : 'rgba(0,0,0,0.04)',
                }}
              >
                <Text
                  style={{
                    color: d.isToday
                      ? colors.textOnAccent
                      : allComplete
                      ? colors.success
                      : colors.textMuted,
                    fontSize: Typography.size.caption,
                    fontFamily: Typography.fontFamily.semiBold,
                    letterSpacing: 0.5,
                  }}
                >
                  {d.label}
                </Text>
                {allComplete && !d.isToday && (
                  <View
                    style={{
                      width: 4,
                      height: 4,
                      borderRadius: 2,
                      backgroundColor: colors.success,
                      marginTop: 3,
                    }}
                  />
                )}
              </View>
            );
          })}
        </View>

        {/* HABIT LIST */}
        <View style={{ paddingHorizontal: 16 }}>
          {scheduledHabits.length === 0 ? (
            <View
              style={{
                backgroundColor: colors.card,
                borderRadius: 20,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: isDark ? 0.3 : 0.06,
                shadowRadius: 12,
                elevation: 8,
              }}
            >
              <LottieView
                source={require('../../assets/animations/empty-state.json')}
                autoPlay
                loop
                style={{ width: 180, height: 180 }}
              />
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 22,
                  fontFamily: Typography.fontFamily.display,
                  marginBottom: 8,
                  textAlign: 'center',
                }}
              >
                Add your first habit.
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.regular,
                  textAlign: 'center',
                  marginBottom: 20,
                }}
              >
                Small steps. Big results.
              </Text>
              <Pressable
                onPress={() => navigation.navigate('AddHabit')}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: 999,
                  paddingVertical: 14,
                  paddingHorizontal: 28,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    color: colors.textOnAccent,
                    fontSize: Typography.size.body,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  + Add Habit
                </Text>
              </Pressable>
            </View>
          ) : (
            <>
              {grouped.morning.length > 0 && (
                <>
                  <SectionLabel label="Morning" />
                  {grouped.morning.map((habit, i) => (
                    <Animated.View
                      key={habit.id}
                      entering={FadeInDown.delay(i * 80).springify()}
                    >
                      <HabitCard
                        habit={habit}
                        log={getLogForDay(habit.id, today)}
                        onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                        date={today}
                        index={i}
                      />
                    </Animated.View>
                  ))}
                </>
              )}

              {grouped.afternoon.length > 0 && (
                <>
                  <SectionLabel label="Afternoon" />
                  {grouped.afternoon.map((habit, i) => (
                    <Animated.View
                      key={habit.id}
                      entering={FadeInDown.delay((grouped.morning.length + i) * 80).springify()}
                    >
                      <HabitCard
                        habit={habit}
                        log={getLogForDay(habit.id, today)}
                        onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                        date={today}
                        index={grouped.morning.length + i}
                      />
                    </Animated.View>
                  ))}
                </>
              )}

              {grouped.evening.length > 0 && (
                <>
                  <SectionLabel label="Evening" />
                  {grouped.evening.map((habit, i) => (
                    <Animated.View
                      key={habit.id}
                      entering={FadeInDown.delay((grouped.morning.length + grouped.afternoon.length + i) * 80).springify()}
                    >
                      <HabitCard
                        habit={habit}
                        log={getLogForDay(habit.id, today)}
                        onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                        date={today}
                        index={grouped.morning.length + grouped.afternoon.length + i}
                      />
                    </Animated.View>
                  ))}
                </>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
