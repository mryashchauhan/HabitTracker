import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
  StyleSheet,
} from 'react-native';
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
import {
  Plus,
  Flame,
  PushPin,
  Archive,
  PencilSimple,
  CaretRight,
  CaretDown,
  CaretUp,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Category, Habit } from '../types';
import { calculateCurrentStreak } from '../utils/streakUtils';
import { CategoryIcon } from '../components/IconMapper';
import { GlassCard } from '../components/GlassCard';
import { getCategoryColor } from '../utils/cardStyles';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Today'>,
  NativeStackScreenProps<RootStackParamList>
>;

const CATEGORIES: { id: 'all' | Category; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'health', label: 'Health' },
  { id: 'fitness', label: 'Fitness' },
  { id: 'study', label: 'Study' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'mindfulness', label: 'Mind' },
  { id: 'custom', label: 'Custom' },
];

function SectionLabel({ label }: { label: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: Typography.size.label,
        fontFamily: Typography.fontFamily.semiBold,
        letterSpacing: Typography.tracking.section,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 4,
      }}
    >
      {label}
    </Text>
  );
}

function HabitRow({
  habit,
  onPress,
  onEdit,
  onPin,
  onUnpin,
  onArchive,
  index,
}: {
  habit: Habit;
  onPress: () => void;
  onEdit: () => void;
  onPin: () => void;
  onUnpin: () => void;
  onArchive: () => void;
  index: number;
}) {
  const { colors, isDark } = useTheme();
  const { logs } = useHabits();
  const streak = calculateCurrentStreak(habit, logs);
  const [showActions, setShowActions] = useState(false);
  const categoryColor = getCategoryColor(habit.category, colors);

  const frequencyLabel =
    habit.frequency.type === 'daily'
      ? 'Daily'
      : habit.frequency.type === 'weekdays'
      ? 'Weekdays'
      : habit.frequency.type === 'x_per_week'
      ? `${habit.frequency.timesPerWeek}×/week`
      : 'Custom';

  const typeLabel =
    habit.type === 'boolean'
      ? 'Yes/No'
      : habit.type === 'count'
      ? `${habit.targetCount ?? '?'} ×/day`
      : `${Math.round((habit.targetDuration ?? 0) / 60)} min`;

  return (
    <Animated.View entering={FadeInDown.delay(index * 60).springify()} style={{ marginBottom: 10 }}>
      <GlassCard innerStyle={{}}>
        <Pressable
          onPress={onPress}
          onLongPress={() => {
            setShowActions(!showActions);
            if (Platform.OS !== 'web') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            }
          }}
          style={{
            ...(showActions ? { borderWidth: 1, borderColor: categoryColor, borderRadius: CARD_RADIUS } : {}),
            overflow: 'hidden',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
            {/* Icon circle — vibrant category tint */}
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${categoryColor}28`,
                borderWidth: 1,
                borderColor: `${categoryColor}50`,
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <CategoryIcon category={habit.category} emojiFallback={habit.icon} color={categoryColor} size={22} weight="fill" />
            </View>

          {/* Content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
              {habit.isPinned && (
                <PushPin size={11} color={colors.accent} weight="fill" />
              )}
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
                numberOfLines={1}
              >
                {habit.name}
              </Text>
            </View>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.small,
                fontFamily: Typography.fontFamily.regular,
              }}
            >
              {frequencyLabel} · {typeLabel}
            </Text>
          </View>

          {/* Right side */}
          <View style={{ alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
            {streak > 0 && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <Flame size={13} color={categoryColor} weight="fill" />
                <Text
                  style={{
                    color: categoryColor,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  {streak}
                </Text>
              </View>
            )}
            <CaretRight size={16} color={isDark ? 'rgba(255,255,255,0.30)' : colors.textMuted} weight="regular" />
          </View>
        </View>

        {showActions && (
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: isDark ? `${categoryColor}40` : 'rgba(0,0,0,0.06)',
              backgroundColor: isDark ? '#0D0D10' : '#F8F4F0',
            }}
          >
            {[
              {
                icon: PencilSimple,
                label: 'Edit',
                color: colors.textSecondary,
                action: () => { onEdit(); setShowActions(false); },
              },
              {
                icon: PushPin,
                label: habit.isPinned ? 'Unpin' : 'Pin',
                color: colors.accent,
                action: () => { habit.isPinned ? onUnpin() : onPin(); setShowActions(false); },
              },
              {
                icon: Archive,
                label: 'Archive',
                color: colors.error,
                action: () => {
                  onArchive();
                  setShowActions(false);
                  if (Platform.OS !== 'web') {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                  }
                },
              },
            ].map((btn, i) => (
              <Pressable
                key={i}
                onPress={btn.action}
                style={({ pressed }) => ({
                  flex: 1,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 5,
                  paddingVertical: 12,
                  opacity: pressed ? 0.7 : 1,
                })}
              >
                <btn.icon size={15} color={btn.color} weight="bold" />
                <Text
                  style={{
                    color: btn.color,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  {btn.label}
                </Text>
              </Pressable>
            ))}
          </View>
        )}
        </Pressable>
        </GlassCard>
    </Animated.View>
  );
}

export function HabitsScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { habits, archiveHabit, pinHabit, unpinHabit, unarchiveHabit } = useHabits();
  const [activeFilter, setActiveFilter] = useState<'all' | Category>('all');
  const [showArchived, setShowArchived] = useState(false);

  const activeHabits = useMemo(
    () =>
      habits
        .filter((h) => !h.isArchived)
        .filter((h) => activeFilter === 'all' || h.category === activeFilter)
        .sort((a, b) => {
          if (a.isPinned && !b.isPinned) return -1;
          if (!a.isPinned && b.isPinned) return 1;
          return a.sortOrder - b.sortOrder;
        }),
    [habits, activeFilter]
  );

  const archivedHabits = useMemo(() => habits.filter((h) => h.isArchived), [habits]);

  const pinnedHabits = activeHabits.filter((h) => h.isPinned);
  const unpinnedHabits = activeHabits.filter((h) => !h.isPinned);

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
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 240 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View>
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#1C1C1E',
                  fontSize: 28,
                  fontFamily: 'PlusJakartaSans_700Bold',
                  letterSpacing: -0.5,
                }}
              >
                My Habits
              </Text>
              <Text
                style={{
                  color: isDark ? '#9F9FA1' : '#6E6E73',
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.regular,
                  marginTop: 3,
                }}
              >
                {activeHabits.length} active habit{activeHabits.length !== 1 ? 's' : ''}
              </Text>
            </View>
            <Pressable
              onPress={() => navigation.navigate('AddHabit')}
              style={({ pressed }) => ({
                backgroundColor: colors.accent,
                borderRadius: 999,
                paddingHorizontal: 16,
                paddingVertical: 10,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                opacity: pressed ? 0.8 : 1,
                shadowColor: colors.accent,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.35,
                shadowRadius: 8,
                elevation: 6,
              })}
            >
              <Plus size={16} color={colors.textOnAccent} weight="bold" />
              <Text
                style={{
                  color: colors.textOnAccent,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                New
              </Text>
            </Pressable>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8, paddingBottom: 2 }}
            style={{ marginBottom: 18, marginHorizontal: -20, paddingHorizontal: 20 }}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeFilter === cat.id;
              const catColor =
                cat.id === 'all'
                  ? colors.accent
                  : getCategoryColor(cat.id, colors);
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setActiveFilter(cat.id)}
                  style={({ pressed }) => ({
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 999,
                    backgroundColor: isActive
                      ? colors.accent
                      : isDark
                      ? colors.surfaceElevated
                      : '#f5f4f0',
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text
                    style={{
                      color: isActive ? colors.textOnAccent : colors.textMuted,
                      fontSize: Typography.size.small,
                      fontFamily: isActive
                        ? Typography.fontFamily.semiBold
                        : Typography.fontFamily.medium,
                    }}
                  >
                    {cat.label}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <Text
            style={{
              color: colors.textFaint,
              fontSize: Typography.size.caption,
              fontFamily: Typography.fontFamily.regular,
              marginBottom: 14,
            }}
          >
            Hold to pin, edit or archive
          </Text>

          {activeHabits.length === 0 ? (
            <Animated.View entering={FadeInDown.delay(100).springify()} style={{ marginBottom: 10 }}>
              <GlassCard innerStyle={{ padding: 24, alignItems: 'center' }}>
                <LottieView
                  source={require('../../assets/animations/empty-state.json')}
                  autoPlay
                  loop
                  style={{ width: 160, height: 160 }}
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
              </GlassCard>
            </Animated.View>
          ) : (
            <>
              {pinnedHabits.length > 0 && (
                <>
                  <SectionLabel label="Pinned" />
                  {pinnedHabits.map((h, i) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      index={i}
                      onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                      onEdit={() => navigation.navigate('EditHabit', { habitId: h.id })}
                      onPin={() => pinHabit(h.id)}
                      onUnpin={() => unpinHabit(h.id)}
                      onArchive={() => archiveHabit(h.id)}
                    />
                  ))}
                </>
              )}

              {unpinnedHabits.length > 0 && (
                <>
                  {pinnedHabits.length > 0 && <SectionLabel label="Active" />}
                  {unpinnedHabits.map((h, i) => (
                    <HabitRow
                      key={h.id}
                      habit={h}
                      index={pinnedHabits.length + i}
                      onPress={() => navigation.navigate('HabitDetail', { habitId: h.id })}
                      onEdit={() => navigation.navigate('EditHabit', { habitId: h.id })}
                      onPin={() => pinHabit(h.id)}
                      onUnpin={() => unpinHabit(h.id)}
                      onArchive={() => archiveHabit(h.id)}
                    />
                  ))}
                </>
              )}
            </>
          )}

          {archivedHabits.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Pressable
                onPress={() => setShowArchived(!showArchived)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  marginBottom: 10,
                }}
              >
                <Archive size={14} color={colors.textMuted} weight="regular" />
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: Typography.size.label,
                    fontFamily: Typography.fontFamily.semiBold,
                    letterSpacing: Typography.tracking.section,
                    textTransform: 'uppercase',
                    flex: 1,
                  }}
                >
                  Archived ({archivedHabits.length})
                </Text>
                {showArchived ? (
                  <CaretUp size={14} color={colors.textMuted} />
                ) : (
                  <CaretDown size={14} color={colors.textMuted} />
                )}
              </Pressable>

              {showArchived &&
                archivedHabits.map((h) => (
                  <GlassCard key={h.id} style={{ marginBottom: 12 }} innerStyle={{ padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                    <CategoryIcon category={h.category} emojiFallback={h.icon} size={20} color={colors.textSecondary} weight="regular" />
                    <Text
                      style={{
                        flex: 1,
                        color: colors.textSecondary,
                        fontFamily: Typography.fontFamily.medium,
                        fontSize: Typography.size.body,
                      }}
                    >
                      {h.name}
                    </Text>
                    <Pressable
                      onPress={() => unarchiveHabit(h.id)}
                      style={{ paddingHorizontal: 10, paddingVertical: 6 }}
                    >
                      <Text
                        style={{
                          color: colors.accent,
                          fontSize: Typography.size.small,
                          fontFamily: Typography.fontFamily.semiBold,
                        }}
                      >
                        Restore
                      </Text>
                    </Pressable>
                  </GlassCard>
                ))}
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 24 }} />
        </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
