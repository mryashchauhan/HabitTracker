export type HabitType = 'boolean' | 'count' | 'timed';
export type Category = 'health' | 'fitness' | 'study' | 'sleep' | 'mindfulness' | 'custom';
export type FrequencyType = 'daily' | 'weekdays' | 'x_per_week' | 'custom';

export interface FrequencyConfig {
  type: FrequencyType;
  timesPerWeek?: number;        // for x_per_week
  customDays?: number[];        // 0=Sun,1=Mon,...6=Sat for custom
}

export interface ReminderConfig {
  enabled: boolean;
  hour: number;
  minute: number;
}

export interface Habit {
  id: string;
  name: string;
  icon: string;           // emoji
  color: string;          // hex
  category: Category;
  type: HabitType;
  frequency: FrequencyConfig;
  targetCount?: number;   // for count type
  targetDuration?: number; // seconds for timed type
  reminder?: ReminderConfig;
  notes?: string;
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;      // ISO date string
  sortOrder: number;
}

export interface HabitLog {
  id: string;
  habitId: string;
  date: string;           // YYYY-MM-DD
  completed: boolean;
  value?: number;         // count or seconds
  skipped?: boolean;
  note?: string;
  loggedAt: string;       // ISO datetime
}

export interface DayStatus {
  date: string;
  completed: boolean;
  skipped: boolean;
  missed: boolean;
  value?: number;
}

export interface HabitStats {
  currentStreak: number;
  bestStreak: number;
  completionRate: number;   // 0–1
  consistencyScore: number; // 0–100
  totalCompletions: number;
  last7Days: DayStatus[];
  last30Days: DayStatus[];
}

export interface AppSettings {
  themeMode: 'dark' | 'light';
  defaultReminderHour: number;
  defaultReminderMinute: number;
  quietHoursStart: number;
  quietHoursEnd: number;
  weekStartsOn: 0 | 1;   // 0=Sun, 1=Mon
}
