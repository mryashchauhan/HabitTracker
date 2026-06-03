import { subDays, format } from 'date-fns';
import { Habit, HabitLog } from '../types';

const fmt = (d: Date) => format(d, 'yyyy-MM-dd');
const today = new Date();

// Helper to generate consistent log history
function genLogs(
  habitId: string,
  daysBack: number,
  completionRate: number,
  type: 'boolean' | 'count' | 'timed',
  targetValue?: number,
  scheduledDays?: number[] // 0=Sun..6=Sat, undefined = all days
): HabitLog[] {
  const logs: HabitLog[] = [];
  for (let i = daysBack; i >= 0; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    const dateStr = fmt(date);

    if (scheduledDays && !scheduledDays.includes(dayOfWeek)) continue;
    // Don't log today (leave for user to do)
    if (i === 0) continue;

    const roll = Math.random();
    if (roll < completionRate) {
      let value: number | undefined;
      if (type === 'count' && targetValue) {
        value = Math.floor(targetValue * (0.7 + Math.random() * 0.5));
      } else if (type === 'timed' && targetValue) {
        value = Math.floor(targetValue * (0.8 + Math.random() * 0.3));
      }
      logs.push({
        id: `${habitId}_${dateStr}`,
        habitId,
        date: dateStr,
        completed: true,
        value,
        skipped: false,
        loggedAt: date.toISOString(),
      });
    } else if (roll < completionRate + 0.05) {
      // occasionally skipped
      logs.push({
        id: `${habitId}_${dateStr}_skip`,
        habitId,
        date: dateStr,
        completed: false,
        skipped: true,
        loggedAt: date.toISOString(),
      });
    }
  }
  return logs;
}

export const MOCK_HABITS: Habit[] = [
  {
    id: 'h1',
    name: 'Morning Run',
    icon: '🏃',
    color: '#FF8C42',
    category: 'fitness',
    type: 'timed',
    frequency: { type: 'weekdays' },
    targetDuration: 1800,
    reminder: { enabled: true, hour: 6, minute: 30 },
    notes: 'Even a short run counts. Just go.',
    isPinned: true,
    isArchived: false,
    createdAt: fmt(subDays(today, 90)),
    sortOrder: 0,
  },
  {
    id: 'h2',
    name: 'Drink 8 Glasses',
    icon: '💧',
    color: '#00E5FF',
    category: 'health',
    type: 'count',
    frequency: { type: 'daily' },
    targetCount: 8,
    reminder: { enabled: true, hour: 9, minute: 0 },
    isPinned: true,
    isArchived: false,
    createdAt: fmt(subDays(today, 85)),
    sortOrder: 1,
  },
  {
    id: 'h3',
    name: 'Read 30 min',
    icon: '📚',
    color: '#7B61FF',
    category: 'study',
    type: 'timed',
    frequency: { type: 'daily' },
    targetDuration: 1800,
    reminder: { enabled: true, hour: 21, minute: 0 },
    notes: 'Anything goes — fiction, non-fiction, articles.',
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 80)),
    sortOrder: 2,
  },
  {
    id: 'h4',
    name: 'Meditate',
    icon: '🧘',
    color: '#00E096',
    category: 'mindfulness',
    type: 'timed',
    frequency: { type: 'daily' },
    targetDuration: 600,
    reminder: { enabled: true, hour: 7, minute: 0 },
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 75)),
    sortOrder: 3,
  },
  {
    id: 'h5',
    name: 'Sleep by 11pm',
    icon: '😴',
    color: '#00BFFF',
    category: 'sleep',
    type: 'boolean',
    frequency: { type: 'daily' },
    reminder: { enabled: true, hour: 22, minute: 30 },
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 70)),
    sortOrder: 4,
  },
  {
    id: 'h6',
    name: 'Push-ups',
    icon: '💪',
    color: '#FF6584',
    category: 'fitness',
    type: 'count',
    frequency: { type: 'x_per_week', timesPerWeek: 4 },
    targetCount: 50,
    reminder: { enabled: false, hour: 8, minute: 0 },
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 60)),
    sortOrder: 5,
  },
  {
    id: 'h7',
    name: 'No Social Media',
    icon: '📵',
    color: '#FFB347',
    category: 'mindfulness',
    type: 'boolean',
    frequency: { type: 'custom', customDays: [1, 2, 3, 4, 5] },
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 45)),
    sortOrder: 6,
  },
  {
    id: 'h8',
    name: 'Gratitude Journal',
    icon: '✍️',
    color: '#C77DFF',
    category: 'mindfulness',
    type: 'boolean',
    frequency: { type: 'daily' },
    reminder: { enabled: true, hour: 22, minute: 0 },
    isPinned: false,
    isArchived: false,
    createdAt: fmt(subDays(today, 30)),
    sortOrder: 7,
  },
];

// Seed random for consistent results
let seed = 42;
const seededRandom = () => {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff;
  return (seed >>> 0) / 0xffffffff;
};

function genDetLogs(
  habitId: string,
  daysBack: number,
  rate: number,
  type: 'boolean' | 'count' | 'timed',
  targetValue?: number,
  scheduledDays?: number[]
): HabitLog[] {
  const logs: HabitLog[] = [];
  for (let i = daysBack; i >= 1; i--) {
    const date = subDays(today, i);
    const dayOfWeek = date.getDay();
    const dateStr = fmt(date);
    if (scheduledDays && !scheduledDays.includes(dayOfWeek)) continue;
    const roll = seededRandom();
    if (roll < rate) {
      let value: number | undefined;
      if (type === 'count' && targetValue) {
        value = Math.floor(targetValue * (0.7 + seededRandom() * 0.5));
      } else if (type === 'timed' && targetValue) {
        value = Math.floor(targetValue * (0.8 + seededRandom() * 0.3));
      }
      logs.push({
        id: `${habitId}_${dateStr}`,
        habitId,
        date: dateStr,
        completed: true,
        value,
        skipped: false,
        loggedAt: date.toISOString(),
      });
    } else if (roll < rate + 0.04) {
      logs.push({
        id: `${habitId}_${dateStr}_skip`,
        habitId,
        date: dateStr,
        completed: false,
        skipped: true,
        loggedAt: date.toISOString(),
      });
    }
  }
  return logs;
}

export const MOCK_LOGS: HabitLog[] = [
  ...genDetLogs('h1', 90, 0.82, 'timed', 1800, [1, 2, 3, 4, 5]),
  ...genDetLogs('h2', 85, 0.88, 'count', 8),
  ...genDetLogs('h3', 80, 0.75, 'timed', 1800),
  ...genDetLogs('h4', 75, 0.70, 'timed', 600),
  ...genDetLogs('h5', 70, 0.65, 'boolean'),
  ...genDetLogs('h6', 60, 0.72, 'count', 50),
  ...genDetLogs('h7', 45, 0.60, 'boolean', undefined, [1, 2, 3, 4, 5]),
  ...genDetLogs('h8', 30, 0.80, 'boolean'),
];

export const SUGGESTED_HABITS = [
  { name: 'Morning Run', icon: '🏃', color: '#FF8C42', category: 'fitness' as const },
  { name: 'Drink Water', icon: '💧', color: '#00E5FF', category: 'health' as const },
  { name: 'Read 30 min', icon: '📚', color: '#7B61FF', category: 'study' as const },
  { name: 'Meditate', icon: '🧘', color: '#00E096', category: 'mindfulness' as const },
  { name: 'Sleep by 11', icon: '😴', color: '#00BFFF', category: 'sleep' as const },
  { name: 'Push-ups', icon: '💪', color: '#FF6584', category: 'fitness' as const },
  { name: 'Journal', icon: '✍️', color: '#C77DFF', category: 'mindfulness' as const },
  { name: 'No Junk Food', icon: '🥗', color: '#2ECC71', category: 'health' as const },
];
