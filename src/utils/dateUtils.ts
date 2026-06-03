import { format, subDays, isAfter, isBefore, startOfDay, parseISO, getDay, eachDayOfInterval, subWeeks, addDays } from 'date-fns';
import { Habit, HabitLog, FrequencyConfig } from '../types';

export const today = () => format(new Date(), 'yyyy-MM-dd');

export const formatDate = (date: Date) => format(date, 'yyyy-MM-dd');

export const formatDisplay = (date: Date) =>
  format(date, 'EEEE, MMM d');

export const formatShort = (date: Date) =>
  format(date, 'MMM d');

export const formatMonth = (date: Date) =>
  format(date, 'MMMM yyyy');

export const getLast7Days = (): string[] =>
  Array.from({ length: 7 }, (_, i) =>
    formatDate(subDays(new Date(), 6 - i))
  );

export const getLast30Days = (): string[] =>
  Array.from({ length: 30 }, (_, i) =>
    formatDate(subDays(new Date(), 29 - i))
  );

export const getLast90Days = (): string[] =>
  Array.from({ length: 90 }, (_, i) =>
    formatDate(subDays(new Date(), 89 - i))
  );

export const getLast16Weeks = (): string[][] => {
  const weeks: string[][] = [];
  for (let w = 15; w >= 0; w--) {
    const week: string[] = [];
    for (let d = 0; d < 7; d++) {
      const date = subDays(new Date(), w * 7 + (6 - d));
      week.push(formatDate(date));
    }
    weeks.push(week);
  }
  return weeks;
};

export const isScheduledOnDate = (habit: Habit, dateStr: string): boolean => {
  const date = parseISO(dateStr);
  const dayOfWeek = getDay(date); // 0=Sun, 6=Sat
  const { frequency } = habit;

  switch (frequency.type) {
    case 'daily':
      return true;
    case 'weekdays':
      return dayOfWeek >= 1 && dayOfWeek <= 5;
    case 'x_per_week':
      // Consider it scheduled every day, streak/stats handle the count
      return true;
    case 'custom':
      return (frequency.customDays || []).includes(dayOfWeek);
    default:
      return true;
  }
};

export const getWeekDays = (weekStartsOn: 0 | 1 = 1): string[] => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  if (weekStartsOn === 1) {
    return [...days.slice(1), days[0]];
  }
  return days;
};

export const getDaysOfCurrentWeek = (weekStartsOn: 0 | 1 = 1): string[] => {
  const now = new Date();
  const day = now.getDay();
  const diff = weekStartsOn === 1 ? (day === 0 ? -6 : 1 - day) : -day;
  const start = addDays(startOfDay(now), diff);
  return Array.from({ length: 7 }, (_, i) => formatDate(addDays(start, i)));
};
