import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from 'react-native';
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
import { getCategoryColor } from '../utils/cardStyles';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Habits'>,
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
    <Animated.View entering={FadeInDown.delay(index * 60).springify()}>
      <Pressable
        onPress={onPress}
        onLongPress={() => {
          setShowActions(!showActions);
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }}
        style={{
          backgroundColor: isDark ? colors.card : '#ffffff',
          borderRadius: 20,
          borderWidth: 1,
          borderColor: showActions
            ? colors.accent
            : isDark
            ? 'rgba(255,255,255,0.06)'
            : 'rgba(0,0,0,0.06)',
          borderTopColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
          marginBottom: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: isDark ? 0.28 : 0.06,
          shadowRadius: 12,
          elevation: 8,
          overflow: 'hidden',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
          {/* Icon */}
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: `${categoryColor}1a`,
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 22 }}>{habit.icon}</Text>
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
                <Flame size={13} color={colors.accentGold} weight="fill" />
                <Text
                  style={{
                    color: colors.accentGold,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  {streak}
                </Text>
              </View>
            )}
            <CaretRight size={16} color={colors.textMuted} weight="regular" />
          </View>
        </View>

        {/* Action bar (revealed on long-press) */}
        {showActions && (
          <View
            style={{
              flexDirection: 'row',
              borderTopWidth: 1,
              borderTopColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
              backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
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
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={{ paddingHorizontal: 20, paddingTop: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <View>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: Typography.size.title,
                  fontFamily: Typography.fontFamily.display,
                  letterSpacing: -0.5,
                }}
              >
                My Habits
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
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

          {/* Category filter chips */}
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

          {/* Long-press hint */}
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
            </View>
          ) : (
            <>
              {/* Pinned section */}
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

              {/* Active section */}
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

          {/* Archived section */}
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
                  <View
                    key={h.id}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      backgroundColor: colors.card,
                      borderRadius: 16,
                      padding: 16,
                      marginBottom: 12,
                      borderWidth: 1,
                      borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{h.icon}</Text>
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
                  </View>
                ))}
            </View>
          )}

          {/* Bottom padding */}
          <View style={{ height: 24 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
