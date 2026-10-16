import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  Modal,
  Platform,
  StyleSheet,
  Dimensions,
  LayoutChangeEvent,
} from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Plus } from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { format } from 'date-fns';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { TodayHabitCard } from '../components/TodayHabitCard';
import { formatDate, isScheduledOnDate } from '../utils/dateUtils';
import { getTodayCompletionStats } from '../utils/streakUtils';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import {
  GRADIENT_LIGHT, SCREEN_WASH_DARK, SCREEN_WASH_LOCATIONS, GRADIENT_LOCATIONS, BG_LIGHT, BG_DARK,
} from '../theme/gradients';
import { Habit } from '../types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

const NAV_H = FLOATING_NAV_HEIGHT;
const GAP = 10;

type FilterKey = 'all' | 'morning' | 'afternoon' | 'evening';
const FILTER_PILLS: { key: FilterKey; label: string }[] = [
  { key: 'all',       label: 'All'       },
  { key: 'morning',   label: 'Morning'   },
  { key: 'afternoon', label: 'Afternoon' },
  { key: 'evening',   label: 'Evening'   },
];

function DailyProgressBar({
  completed,
  total,
  isDark,
}: {
  completed: number;
  total: number;
  isDark: boolean;
}) {
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  const progressAnim = useSharedValue(0);

  useEffect(() => {
    progressAnim.value = withTiming(percent, { duration: 450 });
  }, [percent]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${progressAnim.value}%`,
  }));

  const isAllDone = completed === total && total > 0;
  
  // High contrast colors adapted for both light and dark mode:
  const barColor = isAllDone
    ? (isDark ? '#00D82E' : '#16A34A')
    : (isDark ? '#F6955D' : '#D83A00');
  
  const statusTextColor = isAllDone
    ? (isDark ? '#00D82E' : '#16A34A')
    : (isDark ? '#F6955D' : '#C73500');

  const titleColor = isDark ? '#FFFFFF' : '#2C1306';

  return (
    <View style={{
      marginTop: 14,
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF',
      borderRadius: 14,
      paddingVertical: 11,
      paddingHorizontal: 15,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.90)',
      shadowColor: isDark ? '#000000' : '#8B2500',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.35 : 0.14,
      shadowRadius: 10,
      elevation: 4,
    }}>
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 13 }}>{isAllDone ? '✨' : '🎯'}</Text>
          <Text style={{
            color: titleColor,
            fontSize: 13,
            fontFamily: 'PlusJakartaSans_700Bold',
            letterSpacing: -0.1,
          }}>
            Daily Progress
          </Text>
        </View>
        <Text style={{
          color: statusTextColor,
          fontSize: 12,
          fontFamily: 'PlusJakartaSans_700Bold',
        }}>
          {completed}/{total} completed ({percent}%)
        </Text>
      </View>

      {/* Progress bar track */}
      <View style={{
        height: 7,
        backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.07)',
        borderRadius: 999,
        overflow: 'hidden',
      }}>
        <Animated.View style={[
          {
            height: '100%',
            backgroundColor: barColor,
            borderRadius: 999,
          },
          animatedStyle,
        ]} />
      </View>
    </View>
  );
}

export function TodayScreen({ navigation }: Props) {
  const { isDark } = useTheme();
  const { habits, logs, getLogForDay } = useHabits();
  const today = formatDate(new Date());
  const todayLabel = format(new Date(), 'EEE, MMM d');

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');

  const [listHeight, setListHeight] = useState(0);
  const handleListLayout = useCallback((e: LayoutChangeEvent) => {
    const h = e.nativeEvent.layout.height;
    if (h > 0) setListHeight(h);
  }, []);

  // Dynamic height cards now, no fixed snapping

  const { total, completed } = useMemo(
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

  React.useEffect(() => {
    if (allDone && !celebrationShown) {
      setShowCelebration(true);
      setCelebrationShown(true);
      if (Platform.OS !== 'web') Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    if (!allDone) setCelebrationShown(false);
  }, [allDone]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }, []);

  const tagline = allDone
    ? 'All done —\ngreat work today!'
    : 'Keep the streak alive,\nspark your daily motivation.';

  const grouped = useMemo(() => {
    const morning: Habit[]   = [];
    const afternoon: Habit[] = [];
    const evening: Habit[]   = [];
    scheduledHabits.forEach((h) => {
      const hour = h.reminder?.hour ?? -1;
      if      (hour < 0 || (hour >= 5  && hour < 12)) morning.push(h);
      else if (hour >= 12 && hour < 18)                afternoon.push(h);
      else                                             evening.push(h);
    });
    return { morning, afternoon, evening };
  }, [scheduledHabits]);

  const filteredHabits = useMemo(() => {
    switch (activeFilter) {
      case 'morning':   return grouped.morning;
      case 'afternoon': return grouped.afternoon;
      case 'evening':   return grouped.evening;
      default:          return scheduledHabits;
    }
  }, [activeFilter, grouped, scheduledHabits]);

  const renderItem = useCallback(({ item }: { item: Habit }) => (
    <TodayHabitCard
      habit={item}
      log={getLogForDay(item.id, today)}
      onPress={() => navigation.navigate('HabitDetail', { habitId: item.id })}
      date={today}
    />
  ), [getLogForDay, today, navigation]);

  const keyExtractor = useCallback((item: Habit) => item.id, []);

  return (
    // Root bg matches the bottom of the gradient — no line possible
    <View style={{ flex: 1, backgroundColor: isDark ? BG_DARK : BG_LIGHT }}>

      {/* Full-screen atmospheric wash (dark plum to black) or light gradient */}
      <LinearGradient
        colors={isDark ? SCREEN_WASH_DARK : GRADIENT_LIGHT}
        locations={isDark ? SCREEN_WASH_LOCATIONS : GRADIENT_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Celebration modal */}
      {showCelebration && (
        <Modal transparent visible animationType="fade">
          <View style={StyleSheet.absoluteFill}>
            <LottieView
              source={require('../../assets/animations/celebration.json')}
              autoPlay loop={false}
              style={StyleSheet.absoluteFill}
              onAnimationFinish={() => setShowCelebration(false)}
            />
          </View>
        </Modal>
      )}

      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>

        {/* ══════════════════════════════════════════════════════════════
            HERO — sits on the vivid orange top portion of the gradient
        ══════════════════════════════════════════════════════════════ */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 }}>

          {/* Row 1: date + action buttons */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{
              color: 'rgba(255,255,255,0.70)',
              fontSize: 13,
              fontFamily: 'PlusJakartaSans_600SemiBold',
              letterSpacing: 0.6,
            }}>
              {todayLabel}
            </Text>

            <Pressable
              onPress={() => navigation.navigate('AddHabit')}
              style={({ pressed }) => ({
                width: 36, height: 36, borderRadius: 18,
                backgroundColor: 'rgba(255,255,255,0.15)',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.30)',
                alignItems: 'center', justifyContent: 'center',
                opacity: pressed ? 0.70 : 1,
              })}
            >
              <Plus size={15} color="#FFFFFF" weight="bold" />
            </Pressable>
          </View>

          {/* Greeting + tagline — compact single block */}
          <Text style={{
            color: 'rgba(255,255,255,0.80)',
            fontSize: 14,
            fontFamily: 'PlusJakartaSans_500Medium',
            marginBottom: 4,
          }}>
            {greeting}
          </Text>
          <Text style={{
            color: '#FFFFFF',
            fontSize: 26,
            fontFamily: 'PlusJakartaSans_700Bold',
            lineHeight: 32,
            letterSpacing: -0.5,
          }}>
            {tagline}
          </Text>

          {total > 0 && (
            <DailyProgressBar
              completed={completed}
              total={total}
              isDark={isDark}
            />
          )}
        </View>

        {/* ══════════════════════════════════════════════════════════════
            CARD LIST — cards float on the warm cream zone of the gradient
        ══════════════════════════════════════════════════════════════ */}
        {filteredHabits.length === 0 ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32 }}>
            <LottieView
              source={require('../../assets/animations/empty-state.json')}
              autoPlay loop style={{ width: 120, height: 120 }}
            />
            <Text style={{
              color: isDark ? '#FFFFFF' : '#3D1A0A',
              fontSize: 20, fontFamily: 'PlusJakartaSans_700Bold',
              textAlign: 'center', marginTop: 12,
            }}>
              No habits today
            </Text>
            <Text style={{
              color: isDark ? '#9F9FA1' : 'rgba(60,30,10,0.55)',
              fontSize: 14, fontFamily: 'PlusJakartaSans_400Regular',
              textAlign: 'center', marginTop: 6, marginBottom: 24,
            }}>
              Add your first habit to get started.
            </Text>
            <Pressable
              onPress={() => navigation.navigate('AddHabit')}
              style={({ pressed }) => ({
                backgroundColor: '#F6955D', borderRadius: 999,
                paddingVertical: 12, paddingHorizontal: 28,
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text style={{ color: '#FFFFFF', fontSize: 15, fontFamily: 'PlusJakartaSans_600SemiBold' }}>
                + Add Habit
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ flex: 1 }} onLayout={handleListLayout}>
            <FlatList
              data={filteredHabits}
              keyExtractor={keyExtractor}
              renderItem={renderItem}
              ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingTop: 8,
                paddingHorizontal: 12,
                paddingBottom: FLOATING_NAV_HEIGHT + 140,
              }}
              bounces={Platform.OS === 'ios'}
              overScrollMode="never"
            />
          </View>
        )}

      </SafeAreaView>
    </View>
  );
}
