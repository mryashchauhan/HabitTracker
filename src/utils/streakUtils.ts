import { subDays, parseISO, differenceInDays, format } from 'date-fns';
import { Habit, HabitLog, HabitStats, DayStatus } from '../types';
import { isScheduledOnDate, formatDate, getLast7Days, getLast30Days } from './dateUtils';

export const getHabitLog = (
  logs: HabitLog[],
  habitId: string,
  date: string
): HabitLog | undefined =>
  logs.find((l) => l.habitId === habitId && l.date === date);

export const isHabitCompletedOn = (
  logs: HabitLog[],
  habitId: string,
  date: string
): boolean => {
  const log = getHabitLog(logs, habitId, date);
  return !!log?.completed;
};

export const calculateStreak = (
  habit: Habit,
  logs: HabitLog[]
): { current: number; best: number } => {
  const today = formatDate(new Date());
  let current = 0;
  let best = 0;
  let runningStreak = 0;
  let i = 0;

  // Walk back from today
  while (true) {
    const dateStr = formatDate(subDays(new Date(), i));
    if (!isScheduledOnDate(habit, dateStr)) {
      i++;
      if (i > 365) break;
      continue;
    }

    const completed = isHabitCompletedOn(logs, habit.id, dateStr);
    if (completed) {
      runningStreak++;
      if (i === 0 || (i === 1 && runningStreak > 0)) {
        // still building current
      }
      best = Math.max(best, runningStreak);
    } else {
      if (i === 0) {
        // Today not done yet — don't break streak if yesterday was done
        i++;
        continue;
      }
      if (current === 0) current = runningStreak;
      runningStreak = 0;
    }
    i++;
    if (i > 365) break;
  }

  if (current === 0) current = runningStreak;
  best = Math.max(best, current);

  return { current, best };
};

export const calculateCurrentStreak = (habit: Habit, logs: HabitLog[]): number => {
  return calculateStreak(habit, logs).current;
};

export const calculateBestStreak = (habit: Habit, logs: HabitLog[]): number => {
  return calculateStreak(habit, logs).best;
};

export const calculateCompletionRate = (
  habit: Habit,
  logs: HabitLog[],
  days: string[]
): number => {
  const scheduled = days.filter((d) => isScheduledOnDate(habit, d));
  if (scheduled.length === 0) return 0;
  const completed = scheduled.filter((d) => isHabitCompletedOn(logs, habit.id, d));
  return completed.length / scheduled.length;
};

export const calculateConsistencyScore = (
  habit: Habit,
  logs: HabitLog[]
): number => {
  const last30 = Array.from({ length: 30 }, (_, i) =>
    formatDate(subDays(new Date(), 29 - i))
  );
  const rate = calculateCompletionRate(habit, logs, last30);
  // Weight recent days more
  const last7 = last30.slice(-7);
  const recentRate = calculateCompletionRate(habit, logs, last7);
  const score = rate * 60 + recentRate * 40;
  return Math.round(score * 100);
};

export const getDayStatuses = (
  habit: Habit,
  logs: HabitLog[],
  days: string[]
): DayStatus[] => {
  const today = formatDate(new Date());
  return days.map((date) => {
    const scheduled = isScheduledOnDate(habit, date);
    const log = getHabitLog(logs, habit.id, date);
    const isFuture = date > today;

    if (!scheduled || isFuture) {
      return { date, completed: false, skipped: false, missed: false };
    }

    if (log?.completed) {
      return { date, completed: true, skipped: false, missed: false, value: log.value };
    }
    if (log?.skipped) {
      return { date, completed: false, skipped: true, missed: false };
    }
    if (date < today) {
      return { date, completed: false, skipped: false, missed: true };
    }
    // Today, not yet done
    return { date, completed: false, skipped: false, missed: false };
  });
};

export const getHabitStats = (habit: Habit, logs: HabitLog[]): HabitStats => {
  const { current, best } = calculateStreak(habit, logs);
  const last7 = getLast7Days();
  const last30 = getLast30Days();
  const allScheduledLast30 = last30.filter((d) => isScheduledOnDate(habit, d));
  const completedLast30 = allScheduledLast30.filter((d) =>
    isHabitCompletedOn(logs, habit.id, d)
  );

  return {
    currentStreak: current,
    bestStreak: best,
    completionRate: calculateCompletionRate(habit, logs, last30),
    consistencyScore: calculateConsistencyScore(habit, logs),
    totalCompletions: completedLast30.length,
    last7Days: getDayStatuses(habit, logs, last7),
    last30Days: getDayStatuses(habit, logs, last30),
  };
};

export const getOverallConsistencyScore = (
  habits: Habit[],
  logs: HabitLog[]
): number => {
  const activeHabits = habits.filter((h) => !h.isArchived);
  if (activeHabits.length === 0) return 0;
  const scores = activeHabits.map((h) => calculateConsistencyScore(h, logs));
  return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
};

export const getTodayCompletionStats = (
  habits: Habit[],
  logs: HabitLog[],
  date: string
): { total: number; completed: number; percentage: number } => {
  const scheduled = habits.filter(
    (h) => !h.isArchived && isScheduledOnDate(h, date)
  );
  const completed = scheduled.filter((h) => isHabitCompletedOn(logs, h.id, date));
  return {
    total: scheduled.length,
    completed: completed.length,
    percentage: scheduled.length > 0 ? completed.length / scheduled.length : 0,
  };
};
