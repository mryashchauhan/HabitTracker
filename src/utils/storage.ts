import AsyncStorage from '@react-native-async-storage/async-storage';
import { Habit, HabitLog, AppSettings } from '../types';

const HABITS_KEY = 'ht_habits';
const LOGS_KEY = 'ht_logs';
const SETTINGS_KEY = 'ht_settings';
const ONBOARDING_KEY = 'ht_onboarding_done';

export const StorageService = {
  // Habits
  async saveHabits(habits: Habit[]): Promise<void> {
    await AsyncStorage.setItem(HABITS_KEY, JSON.stringify(habits));
  },
  async loadHabits(): Promise<Habit[] | null> {
    const raw = await AsyncStorage.getItem(HABITS_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Logs
  async saveLogs(logs: HabitLog[]): Promise<void> {
    await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(logs));
  },
  async loadLogs(): Promise<HabitLog[] | null> {
    const raw = await AsyncStorage.getItem(LOGS_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Settings
  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  },
  async loadSettings(): Promise<AppSettings | null> {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  // Onboarding
  async isOnboardingDone(): Promise<boolean> {
    const val = await AsyncStorage.getItem(ONBOARDING_KEY);
    return val === 'true';
  },
  async markOnboardingDone(): Promise<void> {
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
  },
  async resetOnboarding(): Promise<void> {
    await AsyncStorage.removeItem(ONBOARDING_KEY);
  },
};
