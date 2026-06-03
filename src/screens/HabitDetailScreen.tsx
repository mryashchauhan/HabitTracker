import React, { useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  FadeInDown,
  Easing,
} from 'react-native-reanimated';
import {
  ArrowLeft,
  PencilSimple,
  Archive,
  Flame,
  Trophy,
  CheckCircle,
  Lightning,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { getHabitStats } from '../utils/streakUtils';
import { getLast7Days, formatDate } from '../utils/dateUtils';
import { HeatmapGrid } from '../components/HeatmapGrid';
import { WeeklyChart } from '../components/WeeklyChart';
import { getCategoryColor } from '../utils/cardStyles';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'HabitDetail'>;

// Animated count-up number
function AnimatedNumber({ value, color, suffix = '' }: { value: number; color: string; suffix?: string }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(value, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [value]);

  // We approximate the animated number with a React state approach
  const [display, setDisplay] = React.useState(0);
  useEffect(() => {
    const start = Date.now();
    const duration = 600;
    const frame = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(elapsed / duration, 1);
      setDisplay(Math.round(value * pct));
      if (pct < 1) requestAnimationFrame(frame);
    };
    requestAnimationFrame(frame);
  }, [value]);

  return (
    <Text
      style={{
        color,
        fontSize: 28,
        fontFamily: 'SpaceGrotesk_600SemiBold',
        lineHeight: 32,
      }}
    >
      {display}{suffix}
    </Text>
  );
}

export function HabitDetailScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { colors, isDark } = useTheme();
  const { habits, logs, archiveHabit } = useHabits();

  const habit = useMemo(() => habits.find((h) => h.id === habitId), [habits, habitId]);
  const stats = useMemo(() => (habit ? getHabitStats(habit, logs) : null), [habit, logs]);

  const completedSet = useMemo(() => {
    if (!habit) return new Set<string>();
    return new Set(logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date));
  }, [logs, habit]);

  const last7 = getLast7Days();
  const weekChartData = last7.map((date) => ({
    label: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][new Date(date + 'T00:00:00').getDay()],
    value: completedSet.has(date) ? 1 : 0,
    date,
    completed: completedSet.has(date),
  }));

  const recent7 = [...getLast7Days()].reverse();

  if (!habit) {
    return (
      <SafeAreaView
        style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }}
        edges={['top']}
      >
        <Text style={{ color: colors.textMuted, marginBottom: 16 }}>Habit not found</Text>
        <Pressable onPress={() => navigation.goBack()}>
          <Text style={{ color: colors.accent, fontFamily: Typography.fontFamily.semiBold }}>
            Go Back
          </Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const categoryColor = getCategoryColor(habit.category, colors);

  const handleArchive = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Archive Habit',
        `Archive "${habit.name}"? You can restore it anytime from the Habits screen.`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Archive',
            style: 'destructive',
            onPress: () => {
              if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              }
              archiveHabit(habit.id);
              navigation.goBack();
            },
          },
        ]
      );
    } else {
      archiveHabit(habit.id);
      navigation.goBack();
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 48 }}>

        {/* TOP BAR */}
        <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, gap: 12 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ArrowLeft size={20} color={colors.textPrimary} weight="bold" />
          </Pressable>
          <View style={{ flex: 1 }} />
          <Pressable
            onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
            style={({ pressed }) => ({ padding: 10, opacity: pressed ? 0.7 : 1 })}
          >
            <PencilSimple size={20} color={colors.accent} weight="bold" />
          </Pressable>
        </View>

        {/* HEADER — gradient with category color */}
        <LinearGradient
          colors={[`${categoryColor}40`, colors.bg]}
          style={{
            alignItems: 'center',
            paddingHorizontal: 24,
            paddingTop: 20,
            paddingBottom: 28,
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${categoryColor}25`,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Text style={{ fontSize: 36 }}>{habit.icon}</Text>
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 24,
              fontFamily: Typography.fontFamily.display,
              textAlign: 'center',
              marginBottom: 10,
            }}
          >
            {habit.name}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <View
              style={{
                backgroundColor: `${categoryColor}25`,
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: categoryColor,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.semiBold,
                  textTransform: 'capitalize',
                }}
              >
                {habit.category}
              </Text>
            </View>
            <View
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                borderRadius: 6,
                paddingHorizontal: 10,
                paddingVertical: 4,
              }}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                {habit.frequency.type === 'daily'
                  ? 'Daily'
                  : habit.frequency.type === 'weekdays'
                  ? 'Weekdays'
                  : habit.frequency.type === 'x_per_week'
                  ? `${habit.frequency.timesPerWeek}×/week`
                  : 'Custom'}
              </Text>
            </View>
          </View>
          {habit.notes && (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.small,
                fontFamily: Typography.fontFamily.regular,
                textAlign: 'center',
                marginTop: 12,
                fontStyle: 'italic',
                maxWidth: 280,
              }}
            >
              "{habit.notes}"
            </Text>
          )}
        </LinearGradient>

        {/* STATS ROW */}
        {stats && (
          <Animated.View entering={FadeInDown.delay(100).springify()}>
            <View
              style={{
                flexDirection: 'row',
                gap: 10,
                paddingHorizontal: 20,
                marginBottom: 16,
              }}
            >
              {[
                {
                  label: 'STREAK',
                  value: stats.currentStreak,
                  suffix: '',
                  icon: Flame,
                  color: colors.accentGold,
                },
                {
                  label: 'BEST',
                  value: stats.bestStreak,
                  suffix: '',
                  icon: Trophy,
                  color: '#ffd700',
                },
                {
                  label: 'DONE',
                  value: Math.round(stats.completionRate * 100),
                  suffix: '%',
                  icon: CheckCircle,
                  color: colors.success,
                },
              ].map((s) => (
                <View
                  key={s.label}
                  style={{
                    flex: 1,
                    backgroundColor: colors.card,
                    borderRadius: 16,
                    padding: 14,
                    alignItems: 'center',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                    borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: isDark ? 0.28 : 0.06,
                    shadowRadius: 10,
                    elevation: 6,
                  }}
                >
                  <s.icon size={18} color={s.color} weight="fill" style={{ marginBottom: 6 }} />
                  <AnimatedNumber value={s.value} color={colors.textPrimary} suffix={s.suffix} />
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: Typography.size.caption,
                      fontFamily: Typography.fontFamily.semiBold,
                      letterSpacing: 1.5,
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    {s.label}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* HEATMAP */}
        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 14,
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.28 : 0.06,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.label,
                fontFamily: Typography.fontFamily.semiBold,
                letterSpacing: Typography.tracking.section,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Last 12 Weeks
            </Text>
            <HeatmapGrid
              completedDates={completedSet}
              color={categoryColor}
              onDayPress={() => navigation.navigate('Calendar', { habitId: habit.id })}
            />
          </View>
        </Animated.View>

        {/* WEEKLY CHART */}
        <Animated.View entering={FadeInDown.delay(220).springify()}>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 14,
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.28 : 0.06,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.label,
                fontFamily: Typography.fontFamily.semiBold,
                letterSpacing: Typography.tracking.section,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Last 7 Days
            </Text>
            <WeeklyChart data={weekChartData} color={categoryColor} />
          </View>
        </Animated.View>

        {/* RECENT ACTIVITY */}
        <Animated.View entering={FadeInDown.delay(280).springify()}>
          <View
            style={{
              marginHorizontal: 20,
              marginBottom: 24,
              backgroundColor: colors.card,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
              borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: isDark ? 0.28 : 0.06,
              shadowRadius: 12,
              elevation: 8,
            }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.label,
                fontFamily: Typography.fontFamily.semiBold,
                letterSpacing: Typography.tracking.section,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}
            >
              Recent Activity
            </Text>
            {recent7.map((date, i) => {
              const log = logs.find((l) => l.habitId === habit.id && l.date === date);
              const isCompleted = log?.completed;
              const isSkipped = log?.skipped;
              const isMissed = !log && date < formatDate(new Date());

              const statusColor = isCompleted
                ? colors.success
                : isSkipped
                ? colors.warning
                : isMissed
                ? colors.textFaint
                : colors.textMuted;

              const statusLabel = isCompleted
                ? 'Done'
                : isSkipped
                ? 'Skipped'
                : isMissed
                ? 'Missed'
                : 'Pending';

              return (
                <Pressable
                  key={date}
                  onPress={() => navigation.navigate('Calendar', { habitId: habit.id })}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    paddingVertical: 10,
                    borderBottomWidth: i < recent7.length - 1 ? 1 : 0,
                    borderBottomColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)',
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: isCompleted
                        ? `${colors.success}20`
                        : isSkipped
                        ? `${colors.warning}18`
                        : isMissed
                        ? 'rgba(255,255,255,0.04)'
                        : 'rgba(255,255,255,0.03)',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {isCompleted && <CheckCircle size={14} color={colors.success} weight="fill" />}
                    {isSkipped && (
                      <Text style={{ color: colors.warning, fontSize: 10, fontFamily: Typography.fontFamily.semiBold }}>—</Text>
                    )}
                    {isMissed && (
                      <Text style={{ color: colors.textFaint, fontSize: 10 }}>×</Text>
                    )}
                  </View>
                  <Text
                    style={{
                      flex: 1,
                      color: colors.textSecondary,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.medium,
                    }}
                  >
                    {format(new Date(date + 'T00:00:00'), 'EEE, MMM d')}
                  </Text>
                  <View
                    style={{
                      backgroundColor: isCompleted
                        ? `${colors.success}18`
                        : isSkipped
                        ? `${colors.warning}18`
                        : isMissed
                        ? 'rgba(255,255,255,0.05)'
                        : 'transparent',
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                    }}
                  >
                    <Text
                      style={{
                        color: statusColor,
                        fontSize: Typography.size.caption,
                        fontFamily: Typography.fontFamily.semiBold,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                      }}
                    >
                      {statusLabel}
                    </Text>
                  </View>
                </Pressable>
              );
            })}

            <Pressable
              onPress={() => navigation.navigate('Calendar', { habitId: habit.id })}
              style={{ marginTop: 12, alignItems: 'center' }}
            >
              <Text
                style={{
                  color: colors.accent,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                View full history →
              </Text>
            </Pressable>
          </View>
        </Animated.View>

        {/* BOTTOM ACTIONS */}
        <View style={{ paddingHorizontal: 20, flexDirection: 'row', gap: 12 }}>
          <Pressable
            onPress={() => navigation.navigate('EditHabit', { habitId: habit.id })}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 14,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Edit Habit
            </Text>
          </Pressable>
          <Pressable
            onPress={handleArchive}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 14,
              borderRadius: 999,
              borderWidth: 1.5,
              borderColor: `${colors.error}40`,
              alignItems: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text
              style={{
                color: colors.error,
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Archive
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
