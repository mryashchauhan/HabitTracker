import React, { useMemo, useEffect } from 'react';
import { View, Text, ScrollView, Pressable, Platform, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  GRADIENT_LIGHT, SCREEN_WASH_DARK, SCREEN_WASH_LOCATIONS, GRADIENT_LOCATIONS, BG_LIGHT, BG_DARK,
  CARD_RADIUS,
} from '../theme/gradients';
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
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import { getHabitStats, getOverallConsistencyScore, getTodayCompletionStats } from '../utils/streakUtils';
import { getDaysOfCurrentWeek } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/cardStyles';
import { GlassCard } from '../components/GlassCard';
import { CategoryIcon } from '../components/IconMapper';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Stats'>,
  NativeStackScreenProps<RootStackParamList>
>;

const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const NAV_CLEARANCE = FLOATING_NAV_HEIGHT + 140;

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

  // ── Stats data — logic preserved exactly ────────────────────────────
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

  // cardBase kept as a minimal reference for padding/margin inside GlassCard children
  const cardBase = {
    marginBottom: 12,
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? BG_DARK : BG_LIGHT }}>
      <LinearGradient
        colors={isDark ? SCREEN_WASH_DARK : GRADIENT_LIGHT}
        locations={isDark ? SCREEN_WASH_LOCATIONS : GRADIENT_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 18, paddingBottom: NAV_CLEARANCE }}
        >
        {/* Header */}
        <View style={{ paddingTop: 18, marginBottom: 18 }}>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 26,
            fontFamily: 'PlusJakartaSans_700Bold',
            letterSpacing: -0.5,
          }}>
            Your Stats
          </Text>
          <Text style={{
            color: 'rgba(255,255,255,0.70)',
            fontSize: 13,
            fontFamily: 'PlusJakartaSans_400Regular',
            marginTop: 3,
          }}>
            Last 30 days
          </Text>
        </View>

        {/* Overall score card */}
        <Animated.View entering={FadeInDown.delay(0).springify()} style={cardBase}>
          <GlassCard innerStyle={{ padding: 18, flexDirection: 'row', alignItems: 'center', gap: 18 }}>
            <ProgressRing
              percentage={overallScore / 100}
              size={100}
              strokeWidth={9}
              label={`${overallScore}`}
              sublabel="score"
              color={scoreColor}
            />
            <View style={{ flex: 1 }}>
              <Text style={{
                color: '#9F9FA1',
                fontSize: 10,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                marginBottom: 6,
              }}>
                Consistency Score
              </Text>
              <Text style={{
                color: colors.textPrimary,
                fontSize: 16,
                fontFamily: 'PlusJakartaSans_700Bold',
                marginBottom: 6,
              }}>
                {overallScore >= 80 ? 'Excellent 🔥' : overallScore >= 60 ? 'Good 👍' : overallScore >= 40 ? 'Building 💪' : 'Keep Going 🌱'}
              </Text>
              <Text style={{
                color: '#9F9FA1',
                fontSize: 12,
                fontFamily: 'PlusJakartaSans_400Regular',
              }}>
                Today: {todayStats.completed}/{todayStats.total} done
              </Text>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Best Performer card
          FIX: Removed the heavy color-tinted background overlay that caused
          a visible blur/glow artifact around this card. Now uses the same
          neutral cardBase surface as all other Stats cards.
          The category color is preserved only in the trophy icon and score text.
        */}
        {bestHabit && (
          <Animated.View entering={FadeInDown.delay(80).springify()} style={cardBase}>
            <GlassCard innerStyle={{ padding: 16 }}>
              <Text style={{
                color: '#9F9FA1',
                fontSize: 10,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                marginBottom: 10,
              }}>
                Best Performer
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                {/* Icon circle — category tint only here, not the whole card */}
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${getCategoryColor(bestHabit.habit.category, colors)}28`,
                  borderWidth: 1,
                  borderColor: `${getCategoryColor(bestHabit.habit.category, colors)}50`,
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <CategoryIcon category={bestHabit.habit.category} emojiFallback={bestHabit.habit.icon} color={getCategoryColor(bestHabit.habit.category, colors)} size={22} weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: colors.textPrimary,
                    fontSize: 15,
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                  }} numberOfLines={1}>
                    {bestHabit.habit.name}
                  </Text>
                  <Text style={{
                    color: '#9F9FA1',
                    fontSize: 12,
                    fontFamily: 'PlusJakartaSans_400Regular',
                    marginTop: 2,
                  }}>
                    Highest consistency
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 3 }}>
                  <Trophy size={15} color={colors.warning} weight="fill" />
                  <Text style={{
                    color: getCategoryColor(bestHabit.habit.category, colors),
                    fontSize: 16,
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}>
                    {bestHabit.stats.consistencyScore}%
                  </Text>
                </View>
              </View>
            </GlassCard>
          </Animated.View>
        )}

        {/* Weekly bar chart */}
        <Animated.View entering={FadeInDown.delay(140).springify()} style={cardBase}>
          <GlassCard innerStyle={{ padding: 16 }}>
              <Text style={{
                color: '#9F9FA1',
                fontSize: 10,
                fontFamily: 'PlusJakartaSans_600SemiBold',
                letterSpacing: 1.6,
                textTransform: 'uppercase',
                marginBottom: 14,
              }}> 
                This Week
              </Text>
              <WeeklyChart data={weekChartData} maxValue={maxWeekVal} color={'#F6955D'} />
          </GlassCard>
        </Animated.View>

        {/* Habit breakdown */}
        <Text style={{
          color: '#9F9FA1',
          fontSize: 10,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          letterSpacing: 1.6,
          textTransform: 'uppercase',
          marginBottom: 10,
          marginTop: 6,
        }}>
          All Habits
        </Text>

        {habitStats.map(({ habit, stats }, idx) => {
          const catColor = getCategoryColor(habit.category, colors);
          // consistencyScore is now correctly in 0–100 range after formula fix
          const clampedScore = Math.min(100, Math.max(0, stats.consistencyScore));
          return (
            <Animated.View key={habit.id} entering={FadeInDown.delay(200 + idx * 60).springify()} style={cardBase}>
              <GlassCard
                style={{ marginBottom: 8 }}
                innerStyle={{ padding: 14, flexDirection: 'row', alignItems: 'center', gap: 12 }}
              >
                  {/* Pressable needs to go inside GlassCard's inner View */}
                  <Pressable
                    onPress={() => navigation.navigate('HabitDetail', { habitId: habit.id })}
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      opacity: pressed ? 0.85 : 1,
                    })}
                  >
                {/* Icon */}
                <View style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: `${catColor}28`,
                  borderWidth: 1,
                  borderColor: `${catColor}50`,
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <CategoryIcon category={habit.category} emojiFallback={habit.icon} color={catColor} size={22} weight="fill" />
                </View>

                {/* Content */}
                <View style={{ flex: 1, minWidth: 0 }}>
                  <Text style={{
                    color: colors.textPrimary,
                    fontSize: 14,
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    marginBottom: 7,
                  }} numberOfLines={1}>
                    {habit.name}
                  </Text>
                  {/* Progress bar */}
                  <View style={{
                    height: 4, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    borderRadius: 2, overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: `${clampedScore}%`,
                      backgroundColor: catColor,
                      borderRadius: 2,
                    }} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 }}>
                    <Flame size={10} color={colors.warning} weight="fill" />
                    <Text style={{ color: '#9F9FA1', fontSize: 10, fontFamily: 'PlusJakartaSans_500Medium' }}>
                      {stats.currentStreak} day streak
                    </Text>
                  </View>
                </View>

                {/* Score — clamped to 0–100 */}
                <Text style={{
                  color: catColor,
                  fontSize: 15,
                  fontFamily: 'PlusJakartaSans_700Bold',
                  flexShrink: 0,
                }}>
                  {clampedScore}%
                </Text>
                </Pressable>
              </GlassCard>
            </Animated.View>
          );
        })}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
