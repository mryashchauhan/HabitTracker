import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Trophy, Medal, Crown, Star, Lightning, Shield } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { calculateStreak } from '../utils/streakUtils';
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import {
  GRADIENT_LIGHT, SCREEN_WASH_DARK, SCREEN_WASH_LOCATIONS, GRADIENT_LOCATIONS, BG_LIGHT, BG_DARK,
} from '../theme/gradients';
import { CategoryIcon } from '../components/IconMapper';
import { GlassCard } from '../components/GlassCard';

import { getCategoryColor } from '../utils/cardStyles';

const NAV_H = FLOATING_NAV_HEIGHT + 24;

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 10;
const CARD_PADDING = 16;
const CARD_SIZE = Math.floor((SCREEN_W - CARD_PADDING * 2 - CARD_GAP) / 2); // 2 columns with gap
const NAV_CLEARANCE = FLOATING_NAV_HEIGHT + 16;

// ── Achievement milestones — Behance 5-color palette ──────────────────────
const MILESTONES = [
  { days: 3,   label: '3 Day Spark',       Icon: Lightning, color: '#F6955D' },  // Atomic Tangerine
  { days: 7,   label: '7 Day Streak',      Icon: Star,      color: '#F6955D' },  // Atomic Tangerine
  { days: 14,  label: '14 Day Fire',       Icon: Medal,     color: '#E31D76' },  // Razzmatazz
  { days: 30,  label: '30 Day Champion',   Icon: Trophy,    color: '#E31D76' },  // Razzmatazz
  { days: 60,  label: '60 Day Legend',     Icon: Crown,     color: '#4852F5' },  // Blue Bolt
  { days: 100, label: '100 Day Master',    Icon: Shield,    color: '#00D82E' },  // Vivid Malachite
];

function AchievementCard({
  milestone,
  unlocked,
  bestStreak,
  isDark,
  index,
}: {
  milestone: typeof MILESTONES[0];
  unlocked: boolean;
  bestStreak: number;
  isDark: boolean;
  index: number;
}) {
  const { Icon, label, color, days } = milestone;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 60).springify()}
      style={{ width: CARD_SIZE }}
    >
      <GlassCard
        style={{
          width: '100%',
          height: CARD_SIZE * 1.14,
        }}
        innerStyle={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: 14,
          paddingHorizontal: 10,
        }}
        accentGlow={unlocked ? color : undefined}
      >
        {/* Trophy icon */}
        <View style={{
          width: 52,
          height: 52,
          borderRadius: 26,
          backgroundColor: unlocked
            ? isDark ? `${color}28` : `${color}18`
            : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
          borderWidth: 1,
          borderColor: unlocked
            ? `${color}60`
            : isDark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 10,
        }}>
          <Icon
            size={28}
            color={unlocked ? color : isDark ? '#A0A0A5' : '#707075'}
            weight={unlocked ? 'fill' : 'bold'}
          />
        </View>

        {/* Status badge */}
        <View style={{
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
          backgroundColor: unlocked
            ? '#F6955D'
            : isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)',
          borderWidth: unlocked ? 0 : 1,
          borderColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)',
          marginBottom: 8,
        }}>
          <Text style={{
            color: unlocked ? '#FFFFFF' : isDark ? '#E5E5E7' : '#4A2810',
            fontSize: 10,
            fontFamily: 'PlusJakartaSans_700Bold',
            letterSpacing: 0.5,
          }}>
            {unlocked ? 'Unlocked' : `${days}d streak`}
          </Text>
        </View>

        {/* Label */}
        <Text style={{
          color: isDark ? '#FFFFFF' : '#2C1306',
          fontSize: 12,
          fontFamily: 'PlusJakartaSans_600SemiBold',
          textAlign: 'center',
          lineHeight: 16,
        }} numberOfLines={2}>
          {label}
        </Text>
      </GlassCard>
    </Animated.View>
  );
}

export function AchievementsScreen() {
  const { isDark, colors } = useTheme();
  const { habits, logs } = useHabits();

  const activeHabits = useMemo(() => habits.filter((h) => !h.isArchived), [habits]);

  // Build achievements data grouped by habit
  const habitAchievements = useMemo(() => {
    return activeHabits.map((habit) => {
      const { current, best } = calculateStreak(habit, logs);
      const achievements = MILESTONES.map((m) => ({
        ...m,
        unlocked: best >= m.days,
      }));
      const unlockedCount = achievements.filter((a) => a.unlocked).length;
      return { habit, bestStreak: best, currentStreak: current, achievements, unlockedCount };
    });
  }, [activeHabits, logs]);

  // Overall stats
  const totalUnlocked = habitAchievements.reduce((sum, h) => sum + h.unlockedCount, 0);
  const totalPossible = habitAchievements.length * MILESTONES.length;

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? BG_DARK : BG_LIGHT }}>
      {/* Orange gradient background */}
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
          contentContainerStyle={{ paddingBottom: FLOATING_NAV_HEIGHT + 140 }}
        >
          {/* Header */}
          <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 28,
              fontFamily: 'PlusJakartaSans_700Bold',
              letterSpacing: -0.5,
              marginBottom: 6,
            }}>
              Trophies
            </Text>
            <Text style={{
              color: 'rgba(255,255,255,0.70)',
              fontSize: 13,
              fontFamily: 'PlusJakartaSans_400Regular',
            }}>
              {totalUnlocked} of {totalPossible} unlocked
            </Text>
          </View>

          {/* Per-habit achievement sections */}
          {habitAchievements.map(({ habit, bestStreak, currentStreak, achievements, unlockedCount }, habitIdx) => {
            const habitAccentColor = getCategoryColor(habit.category, colors);

            return (
              <View key={habit.id} style={{ marginBottom: 28 }}>
                {/* Habit name header — matches Planner tab card style */}
                <View style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 16,
                  marginBottom: 12,
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 12 }}>
                    {/* Icon circle matching TodayHabitCard 44px style with category accent */}
                    <View style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${habitAccentColor}28`,
                      borderWidth: 1,
                      borderColor: `${habitAccentColor}50`,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: 12,
                      flexShrink: 0,
                    }}>
                      <CategoryIcon category={habit.category} emojiFallback={habit.icon} size={22} weight="fill" color={habitAccentColor} />
                    </View>
                    <Text style={{
                      color: isDark ? '#FFFFFF' : '#2C1306',
                      fontSize: 16,
                      fontFamily: 'PlusJakartaSans_700Bold',
                      letterSpacing: -0.3,
                      flex: 1,
                    }}>
                      {habit.name}
                    </Text>
                  </View>

                  {/* Unlocked count badge */}
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 5,
                    backgroundColor: isDark ? 'rgba(246,149,93,0.22)' : 'rgba(248,61,17,0.12)',
                    borderWidth: 1,
                    borderColor: isDark ? 'rgba(246,149,93,0.40)' : 'rgba(248,61,17,0.25)',
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderRadius: 999,
                  }}>
                    <Trophy size={13} color={isDark ? '#F6955D' : '#D83A00'} weight="fill" />
                    <Text style={{
                      color: isDark ? '#F6955D' : '#D83A00',
                      fontSize: 12,
                      fontFamily: 'PlusJakartaSans_700Bold',
                    }}>
                      {unlockedCount}/{MILESTONES.length}
                    </Text>
                  </View>
                </View>

              {/* Achievement cards grid — 2 columns */}
              <View style={{
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: CARD_GAP,
                paddingHorizontal: CARD_PADDING,
              }}>
                {achievements.map((achievement, achIdx) => (
                  <AchievementCard
                    key={`${habit.id}-${achievement.days}`}
                    milestone={achievement}
                    unlocked={achievement.unlocked}
                    bestStreak={bestStreak}
                    isDark={isDark}
                    index={habitIdx * MILESTONES.length + achIdx}
                  />
                ))}
              </View>
            </View>
          );
        })}

          {/* Empty state */}
          {activeHabits.length === 0 && (
            <View style={{ alignItems: 'center', paddingTop: 60, paddingHorizontal: 40 }}>
              <Trophy size={64} color={isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.10)'} weight="regular" />
              <Text style={{
                color: isDark ? '#FFFFFF' : '#2C1306',
                fontSize: 20,
                fontFamily: 'Urbanist_700Bold',
                textAlign: 'center',
                marginTop: 16,
              }}>
                No trophies yet
              </Text>
              <Text style={{
                color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(44,19,6,0.45)',
                fontSize: 14,
                fontFamily: 'Urbanist_400Regular',
                textAlign: 'center',
                marginTop: 6,
              }}>
                Add habits and build streaks to unlock achievements.
              </Text>
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
