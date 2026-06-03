import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Flame, Trophy, TrendUp } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { ProgressRing } from '../components/ProgressRing';
import { WeeklyChart } from '../components/WeeklyChart';
import { getHabitStats, getOverallConsistencyScore, getTodayCompletionStats } from '../utils/streakUtils';
import { getDaysOfCurrentWeek } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/cardStyles';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Stats'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// Animated count-up
function AnimatedStat({ value, suffix = '' }: { value: number; suffix?: string }) {
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
  return <>{display}{suffix}</>;
}

export function StatsScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { habits, logs } = useHabits();
  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  const overallScore = useMemo(
    () => getOverallConsistencyScore(activeHabits, logs),
    [activeHabits, logs]
  );

  const todayStr = new Date().toISOString().split('T')[0];
  const todayStats = useMemo(
    () => getTodayCompletionStats(activeHabits, logs, todayStr),
    [activeHabits, logs, todayStr]
  );

  const weekDays = getDaysOfCurrentWeek(1);
  const habitStats = useMemo(
    () => activeHabits.map((h) => ({ habit: h, stats: getHabitStats(h, logs) })),
    [activeHabits, logs]
  );

  const bestHabit = useMemo(
    () =>
      habitStats.reduce<typeof habitStats[0] | null>(
        (best, cur) => (cur.stats.consistencyScore > (best?.stats.consistencyScore ?? 0) ? cur : best),
        null
      ),
    [habitStats]
  );

  const weekChartData = weekDays.map((date, i) => {
    const dayCompleted = activeHabits.filter((h) =>
      logs.some((l) => l.habitId === h.id && l.date === date && l.completed)
    ).length;
    return { label: WEEK_LABELS[i], value: dayCompleted, date, completed: dayCompleted > 0 };
  });
  const maxWeekVal = Math.max(...weekChartData.map((d) => d.value), 1);

  const scoreColor =
    overallScore >= 70 ? colors.success : overallScore >= 40 ? colors.warning : colors.error;

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
    borderTopColor: isDark ? colors.topEdge : 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.28 : 0.06,
    shadowRadius: 12,
    elevation: 8,
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}>

        {/* Header */}
        <View style={{ paddingTop: 20, marginBottom: 20 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: Typography.size.title,
              fontFamily: Typography.fontFamily.display,
              letterSpacing: -0.5,
            }}
          >
            Your Stats
          </Text>
          <Text
            style={{
              color: colors.textMuted,
              fontSize: Typography.size.small,
              fontFamily: Typography.fontFamily.regular,
              marginTop: 4,
            }}
          >
            Last 30 days
          </Text>
        </View>

        {/* Overall score card */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={{ marginBottom: 14 }}>
          <View style={[cardStyle, { padding: 20, flexDirection: 'row', alignItems: 'center', gap: 20 }]}>
            <ProgressRing
              percentage={overallScore / 100}
              size={110}
              strokeWidth={10}
              label={`${overallScore}`}
              sublabel="score"
              color={scoreColor}
            />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.label,
                  fontFamily: Typography.fontFamily.semiBold,
                  letterSpacing: Typography.tracking.section,
                  textTransform: 'uppercase',
                  marginBottom: 6,
                }}
              >
                Consistency Score
              </Text>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: Typography.size.cardTitle,
                  fontFamily: Typography.fontFamily.semiBold,
                  marginBottom: 8,
                }}
              >
                {overallScore >= 80
                  ? 'Excellent 🔥'
                  : overallScore >= 60
                  ? 'Good 👍'
                  : overallScore >= 40
                  ? 'Building 💪'
                  : 'Keep Going 🌱'}
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.regular,
                }}
              >
                Today: {todayStats.completed}/{todayStats.total} done
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* Best habit card */}
        {bestHabit && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={{ marginBottom: 14 }}>
            <View
              style={[
                cardStyle,
                {
                  padding: 16,
                  backgroundColor: isDark
                    ? `${getCategoryColor(bestHabit.habit.category, colors)}10`
                    : `${getCategoryColor(bestHabit.habit.category, colors)}08`,
                  borderColor: `${getCategoryColor(bestHabit.habit.category, colors)}25`,
                },
              ]}
            >
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.label,
                  fontFamily: Typography.fontFamily.semiBold,
                  letterSpacing: Typography.tracking.section,
                  textTransform: 'uppercase',
                  marginBottom: 10,
                }}
              >
                Best Performer
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: `${getCategoryColor(bestHabit.habit.category, colors)}20`,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{bestHabit.habit.icon}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size.body,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                    numberOfLines={1}
                  >
                    {bestHabit.habit.name}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.regular,
                      marginTop: 2,
                    }}
                  >
                    Best performer
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Trophy size={16} color={colors.accentGold} weight="fill" />
                  <Text
                    style={{
                      color: getCategoryColor(bestHabit.habit.category, colors),
                      fontSize: Typography.size.cardTitle,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                  >
                    {bestHabit.stats.consistencyScore}%
                  </Text>
                </View>
              </View>
            </View>
          </Animated.View>
        )}

        {/* Weekly bar chart */}
        <Animated.View entering={FadeInDown.delay(140).springify()} style={{ marginBottom: 14 }}>
          <View style={[cardStyle, { padding: 16 }]}>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.label,
                fontFamily: Typography.fontFamily.semiBold,
                letterSpacing: Typography.tracking.section,
                textTransform: 'uppercase',
                marginBottom: 16,
              }}
            >
              This Week
            </Text>
            <WeeklyChart data={weekChartData} maxValue={maxWeekVal} color={colors.accent} />
          </View>
        </Animated.View>

        {/* Habit breakdown */}
        <Text
          style={{
            color: colors.textMuted,
            fontSize: Typography.size.label,
            fontFamily: Typography.fontFamily.semiBold,
            letterSpacing: Typography.tracking.section,
            textTransform: 'uppercase',
            marginBottom: 12,
            marginTop: 8,
          }}
        >
          All Habits
        </Text>

        {habitStats.map(({ habit, stats }, idx) => {
          const catColor = getCategoryColor(habit.category, colors);
          return (
            <Animated.View
              key={habit.id}
              entering={FadeInDown.delay(200 + idx * 60).springify()}
            >
              <Pressable
                onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                style={({ pressed }) => [
                  cardStyle,
                  {
                    padding: 14,
                    marginBottom: 10,
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 12,
                    opacity: pressed ? 0.85 : 1,
                  },
                ]}
              >
                {/* Icon */}
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 21,
                    backgroundColor: `${catColor}1a`,
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
                </View>

                {/* Content */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size.body,
                      fontFamily: Typography.fontFamily.semiBold,
                      marginBottom: 8,
                    }}
                    numberOfLines={1}
                  >
                    {habit.name}
                  </Text>
                  {/* Progress bar */}
                  <View
                    style={{
                      height: 5,
                      backgroundColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.08)',
                      borderRadius: 3,
                      overflow: 'hidden',
                    }}
                  >
                    <View
                      style={{
                        height: '100%',
                        width: `${stats.consistencyScore}%`,
                        backgroundColor: catColor,
                        borderRadius: 3,
                      }}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 5 }}>
                    <Flame size={11} color={colors.accentGold} weight="fill" />
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontSize: Typography.size.caption,
                        fontFamily: Typography.fontFamily.medium,
                      }}
                    >
                      {stats.currentStreak} day streak
                    </Text>
                  </View>
                </View>

                {/* Score */}
                <Text
                  style={{
                    color: catColor,
                    fontSize: Typography.size.cardTitle,
                    fontFamily: Typography.fontFamily.semiBold,
                    flexShrink: 0,
                  }}
                >
                  {stats.consistencyScore}%
                </Text>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
