import React, { useState, useMemo } from 'react';
import { CONTENT_COLUMN } from '../constants/layout';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  ArrowLeft,
  CaretLeft,
  CaretRight,
  CheckCircle,
  MinusCircle,
  XCircle,
} from 'phosphor-react-native';
import { format, getDaysInMonth, startOfMonth, getDay, subMonths, addMonths } from 'date-fns';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { formatDate, isScheduledOnDate } from '../utils/dateUtils';
import { getCategoryColor } from '../utils/cardStyles';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Calendar'>;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function CalendarScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { colors, isDark } = useTheme();
  const { habits, logs, retroLog } = useHabits();

  const habit = useMemo(() => habits.find((h) => h.id === habitId), [habits, habitId]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  const today = formatDate(new Date());

  const completedSet = useMemo(() => {
    if (!habit) return new Set<string>();
    return new Set(logs.filter((l) => l.habitId === habit.id && l.completed).map((l) => l.date));
  }, [logs, habit]);

  const skippedSet = useMemo(() => {
    if (!habit) return new Set<string>();
    return new Set(logs.filter((l) => l.habitId === habit.id && l.skipped).map((l) => l.date));
  }, [logs, habit]);

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }} edges={['top']}>
        <Text style={{ color: colors.textMuted }}>Habit not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontFamily: Typography.fontFamily.semiBold }}>← Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const categoryColor = getCategoryColor(habit.category, colors);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDayOfWeek = getDay(startOfMonth(currentMonth));
  const paddingDays = firstDayOfWeek;

  const calendarCells: (string | null)[] = [
    ...Array(paddingDays).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) =>
      formatDate(new Date(year, month, i + 1))
    ),
  ];
  while (calendarCells.length % 7 !== 0) calendarCells.push(null);

  const handleDayPress = (date: string) => {
    if (date > today) return;
    setSelectedDate(date);
    setShowModal(true);
  };

  const handleMark = (action: 'done' | 'skipped' | 'missed') => {
    if (!selectedDate) return;
    if (action === 'done') {
      retroLog(habit.id, selectedDate, true, false);
    } else if (action === 'skipped') {
      retroLog(habit.id, selectedDate, false, true);
    } else {
      retroLog(habit.id, selectedDate, false, false);
    }
    setShowModal(false);
  };

  const getDayCellStyle = (date: string) => {
    const isToday = date === today;
    const isFuture = date > today;
    const isCompleted = completedSet.has(date);
    const isSkipped = skippedSet.has(date);
    const isMissed = !isCompleted && !isSkipped && !isFuture && date < today && isScheduledOnDate(habit, date);

    let bgColor = 'transparent';
    let borderColor = 'transparent';
    let borderWidth = 0;

    if (isCompleted) {
      bgColor = categoryColor;
    } else if (isSkipped) {
      bgColor = `${colors.warning}30`;
    } else if (isMissed) {
      bgColor = `${colors.error}12`;
    }

    if (isToday && !isCompleted) {
      borderColor = colors.accent;
      borderWidth = 1.5;
    }

    return { bgColor, borderColor, borderWidth, isCompleted, isToday, isFuture };
  };

  const getDayTextColor = (date: string) => {
    if (completedSet.has(date)) return '#111111';
    if (date === today) return colors.accent;
    if (date > today) return colors.textFaint;
    return colors.textSecondary;
  };

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 20,
    paddingHorizontal: 20,
    borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
    borderTopColor: isDark ? colors.topEdge : 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.28 : 0.06,
    shadowRadius: 12,
    elevation: 8,
  };

  const isAtCurrentMonth =
    month === new Date().getMonth() && year === new Date().getFullYear();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, ...CONTENT_COLUMN }} edges={['top']}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 16, marginBottom: 20 }}>
          <Pressable
            onPress={() => navigation.goBack()}
            style={({ pressed }) => ({
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <ArrowLeft size={20} color={colors.textPrimary} weight="bold" />
          </Pressable>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${categoryColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20 }}>{habit.icon}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                color: colors.textPrimary,
                fontSize: Typography.size.sectionHeading,
                fontFamily: Typography.fontFamily.display,
              }}
              numberOfLines={1}
            >
              {habit.name}
            </Text>
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.small,
                fontFamily: Typography.fontFamily.regular,
              }}
            >
              Calendar History
            </Text>
          </View>
        </View>

        {/* Month navigation */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <Pressable
            onPress={() => setCurrentMonth(subMonths(currentMonth, 1))}
            style={({ pressed }) => ({
              padding: 8,
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <CaretLeft size={22} color={colors.textSecondary} weight="bold" />
          </Pressable>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: Typography.size.sectionHeading,
              fontFamily: Typography.fontFamily.semiBold,
            }}
          >
            {format(currentMonth, 'MMMM yyyy')}
          </Text>
          <Pressable
            onPress={() => !isAtCurrentMonth && setCurrentMonth(addMonths(currentMonth, 1))}
            style={({ pressed }) => ({
              padding: 8,
              opacity: isAtCurrentMonth ? 0.3 : pressed ? 0.7 : 1,
            })}
          >
            <CaretRight size={22} color={colors.textSecondary} weight="bold" />
          </Pressable>
        </View>

        {/* Calendar card */}
        <View style={[cardStyle, { padding: 14, marginBottom: 16 }]}>
          {/* Day header */}
          <View style={{ flexDirection: 'row', marginBottom: 6 }}>
            {DAY_LABELS.map((d) => (
              <Text
                key={d}
                style={{
                  flex: 1,
                  textAlign: 'center',
                  color: colors.textFaint,
                  fontSize: Typography.size.caption,
                  fontFamily: Typography.fontFamily.semiBold,
                  letterSpacing: 0.5,
                }}
              >
                {d[0]}
              </Text>
            ))}
          </View>

          {/* Weeks */}
          {Array.from({ length: calendarCells.length / 7 }, (_, rowIdx) => (
            <View key={rowIdx} style={{ flexDirection: 'row' }}>
              {calendarCells.slice(rowIdx * 7, rowIdx * 7 + 7).map((date, colIdx) => {
                if (!date) {
                  return <View key={colIdx} style={{ flex: 1, aspectRatio: 1 }} />;
                }

                const { bgColor, borderColor, borderWidth, isCompleted, isToday, isFuture } = getDayCellStyle(date);
                const textColor = getDayTextColor(date);
                const dayNum = parseInt(date.split('-')[2], 10);

                return (
                  <Pressable
                    key={date}
                    onPress={() => handleDayPress(date)}
                    style={{
                      flex: 1,
                      aspectRatio: 1,
                      margin: 2,
                      borderRadius: 8,
                      backgroundColor: bgColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth,
                      borderColor,
                      opacity: isFuture ? 0.3 : 1,
                    }}
                  >
                    <Text
                      style={{
                        color: textColor,
                        fontSize: Typography.size.small,
                        fontFamily: isToday ? Typography.fontFamily.semiBold : Typography.fontFamily.regular,
                      }}
                    >
                      {dayNum}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        {/* Legend */}
        <View style={{ flexDirection: 'row', gap: 20, justifyContent: 'center', marginBottom: 12 }}>
          {[
            { color: categoryColor, label: 'Done' },
            { color: `${colors.warning}30`, label: 'Skipped' },
            { color: `${colors.error}12`, label: 'Missed' },
          ].map(({ color: c, label }) => (
            <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  backgroundColor: c,
                }}
              />
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.caption,
                  fontFamily: Typography.fontFamily.medium,
                }}
              >
                {label}
              </Text>
            </View>
          ))}
        </View>

        <Text
          style={{
            color: colors.textFaint,
            fontSize: Typography.size.caption,
            fontFamily: Typography.fontFamily.regular,
            textAlign: 'center',
          }}
        >
          Tap any past day to log it
        </Text>
      </ScrollView>

      {/* Retrolog bottom sheet */}
      <Modal visible={showModal} transparent animationType="slide">
        <Pressable
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
          onPress={() => setShowModal(false)}
        />
        <View
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            padding: 24,
            borderTopWidth: 1,
            borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.08)',
          }}
        >
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: 22,
              fontFamily: Typography.fontFamily.display,
              marginBottom: 4,
            }}
          >
            Edit Day
          </Text>
          {selectedDate && (
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.small,
                fontFamily: Typography.fontFamily.regular,
                marginBottom: 20,
              }}
            >
              {format(new Date(selectedDate + 'T00:00:00'), 'EEEE, MMMM d')}
            </Text>
          )}

          {[
            {
              action: 'done' as const,
              Icon: CheckCircle,
              label: 'Mark as Done',
              color: colors.success,
              bg: `${colors.success}12`,
            },
            {
              action: 'skipped' as const,
              Icon: MinusCircle,
              label: 'Mark as Skipped',
              color: colors.warning,
              bg: `${colors.warning}12`,
            },
            {
              action: 'missed' as const,
              Icon: XCircle,
              label: 'Mark as Missed / Remove',
              color: colors.textMuted,
              bg: isDark ? colors.cardBorder : 'rgba(0,0,0,0.04)',
            },
          ].map((opt) => (
            <Pressable
              key={opt.action}
              onPress={() => handleMark(opt.action)}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                padding: 16,
                borderRadius: 16,
                backgroundColor: opt.bg,
                marginBottom: 10,
                opacity: pressed ? 0.8 : 1,
              })}
            >
              <opt.Icon size={26} color={opt.color} weight="fill" />
              <Text
                style={{
                  color: opt.color,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                {opt.label}
              </Text>
            </Pressable>
          ))}

          <Pressable
            onPress={() => setShowModal(false)}
            style={{ paddingVertical: 14, alignItems: 'center' }}
          >
            <Text
              style={{
                color: colors.textMuted,
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.medium,
              }}
            >
              Cancel
            </Text>
          </Pressable>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
