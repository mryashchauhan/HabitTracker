import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { Habit, HabitLog, AppSettings } from '../types';

import { StorageService } from '../utils/storage';
import { formatDate } from '../utils/dateUtils';

interface HabitState {
  habits: Habit[];
  logs: HabitLog[];
  settings: AppSettings;
  isLoaded: boolean;
}

type HabitAction =
  | { type: 'LOAD'; habits: Habit[]; logs: HabitLog[]; settings: AppSettings }
  | { type: 'ADD_HABIT'; habit: Habit }
  | { type: 'UPDATE_HABIT'; habit: Habit }
  | { type: 'ARCHIVE_HABIT'; habitId: string }
  | { type: 'UNARCHIVE_HABIT'; habitId: string }
  | { type: 'PIN_HABIT'; habitId: string }
  | { type: 'UNPIN_HABIT'; habitId: string }
  | { type: 'REORDER_HABITS'; habits: Habit[] }
  | { type: 'LOG_HABIT'; log: HabitLog }
  | { type: 'REMOVE_LOG'; habitId: string; date: string }
  | { type: 'UPDATE_SETTINGS'; settings: Partial<AppSettings> };

const defaultSettings: AppSettings = {
  themeMode: 'dark',
  defaultReminderHour: 8,
  defaultReminderMinute: 0,
  quietHoursStart: 22,
  quietHoursEnd: 7,
  weekStartsOn: 1,
};

function reducer(state: HabitState, action: HabitAction): HabitState {
  switch (action.type) {
    case 'LOAD':
      return {
        ...state,
        habits: action.habits,
        logs: action.logs,
        settings: action.settings,
        isLoaded: true,
      };
    case 'ADD_HABIT':
      return { ...state, habits: [...state.habits, action.habit] };
    case 'UPDATE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habit.id ? action.habit : h
        ),
      };
    case 'ARCHIVE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId ? { ...h, isArchived: true, isPinned: false } : h
        ),
      };
    case 'UNARCHIVE_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId ? { ...h, isArchived: false } : h
        ),
      };
    case 'PIN_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId ? { ...h, isPinned: true } : h
        ),
      };
    case 'UNPIN_HABIT':
      return {
        ...state,
        habits: state.habits.map((h) =>
          h.id === action.habitId ? { ...h, isPinned: false } : h
        ),
      };
    case 'REORDER_HABITS':
      return { ...state, habits: action.habits };
    case 'LOG_HABIT': {
      const existing = state.logs.findIndex(
        (l) => l.habitId === action.log.habitId && l.date === action.log.date
      );
      if (existing >= 0) {
        const newLogs = [...state.logs];
        newLogs[existing] = action.log;
        return { ...state, logs: newLogs };
      }
      return { ...state, logs: [...state.logs, action.log] };
    }
    case 'REMOVE_LOG':
      return {
        ...state,
        logs: state.logs.filter(
          (l) => !(l.habitId === action.habitId && l.date === action.date)
        ),
      };
    case 'UPDATE_SETTINGS':
      return {
        ...state,
        settings: { ...state.settings, ...action.settings },
      };
    default:
      return state;
  }
}

interface HabitContextType extends HabitState {
  // Habit actions
  addHabit: (habit: Omit<Habit, 'id' | 'createdAt' | 'sortOrder'>) => void;
  updateHabit: (habit: Habit) => void;
  archiveHabit: (habitId: string) => void;
  unarchiveHabit: (habitId: string) => void;
  pinHabit: (habitId: string) => void;
  unpinHabit: (habitId: string) => void;
  reorderHabits: (habits: Habit[]) => void;
  // Log actions
  completeHabit: (habitId: string, date?: string, value?: number) => void;
  skipHabit: (habitId: string, date?: string) => void;
  uncompleteHabit: (habitId: string, date?: string) => void;
  retroLog: (habitId: string, date: string, completed: boolean, skipped?: boolean, value?: number) => void;
  getLogForDay: (habitId: string, date: string) => HabitLog | undefined;
  // Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
}

const HabitContext = createContext<HabitContextType>({} as HabitContextType);

export function HabitProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    habits: [],
    logs: [],
    settings: defaultSettings,
    isLoaded: false,
  });

  // Load from storage on mount
  useEffect(() => {
    async function load() {
      try {
        const [storedHabits, storedLogs, storedSettings] = await Promise.all([
          StorageService.loadHabits(),
          StorageService.loadLogs(),
          StorageService.loadSettings(),
        ]);
        dispatch({
          type: 'LOAD',
          habits: storedHabits ?? [],
          logs: storedLogs ?? [],
          settings: storedSettings ?? defaultSettings,
        });
      } catch {
        dispatch({
          type: 'LOAD',
          habits: [],
          logs: [],
          settings: defaultSettings,
        });
      }
    }
    load();
  }, []);

  // Persist whenever state changes
  useEffect(() => {
    if (!state.isLoaded) return;
    StorageService.saveHabits(state.habits);
    StorageService.saveLogs(state.logs);
    StorageService.saveSettings(state.settings);
  }, [state.habits, state.logs, state.settings, state.isLoaded]);

  const addHabit = useCallback(
    (data: Omit<Habit, 'id' | 'createdAt' | 'sortOrder'>) => {
      const habit: Habit = {
        ...data,
        id: `h_${Date.now()}`,
        createdAt: new Date().toISOString(),
        sortOrder: state.habits.length,
      };
      dispatch({ type: 'ADD_HABIT', habit });
    },
    [state.habits.length]
  );

  const updateHabit = useCallback((habit: Habit) => {
    dispatch({ type: 'UPDATE_HABIT', habit });
  }, []);

  const archiveHabit = useCallback((habitId: string) => {
    dispatch({ type: 'ARCHIVE_HABIT', habitId });
  }, []);

  const unarchiveHabit = useCallback((habitId: string) => {
    dispatch({ type: 'UNARCHIVE_HABIT', habitId });
  }, []);

  const pinHabit = useCallback((habitId: string) => {
    dispatch({ type: 'PIN_HABIT', habitId });
  }, []);

  const unpinHabit = useCallback((habitId: string) => {
    dispatch({ type: 'UNPIN_HABIT', habitId });
  }, []);

  const reorderHabits = useCallback((habits: Habit[]) => {
    dispatch({ type: 'REORDER_HABITS', habits });
  }, []);

  const completeHabit = useCallback(
    (habitId: string, date?: string, value?: number) => {
      const dateStr = date ?? formatDate(new Date());
      const log: HabitLog = {
        id: `${habitId}_${dateStr}_${Date.now()}`,
        habitId,
        date: dateStr,
        completed: true,
        value,
        skipped: false,
        loggedAt: new Date().toISOString(),
      };
      dispatch({ type: 'LOG_HABIT', log });
    },
    []
  );

  const skipHabit = useCallback((habitId: string, date?: string) => {
    const dateStr = date ?? formatDate(new Date());
    const log: HabitLog = {
      id: `${habitId}_${dateStr}_${Date.now()}`,
      habitId,
      date: dateStr,
      completed: false,
      skipped: true,
      loggedAt: new Date().toISOString(),
    };
    dispatch({ type: 'LOG_HABIT', log });
  }, []);

  const uncompleteHabit = useCallback((habitId: string, date?: string) => {
    const dateStr = date ?? formatDate(new Date());
    dispatch({ type: 'REMOVE_LOG', habitId, date: dateStr });
  }, []);

  const retroLog = useCallback(
    (
      habitId: string,
      date: string,
      completed: boolean,
      skipped?: boolean,
      value?: number
    ) => {
      const log: HabitLog = {
        id: `${habitId}_${date}_${Date.now()}`,
        habitId,
        date,
        completed,
        value,
        skipped: skipped ?? false,
        loggedAt: new Date().toISOString(),
      };
      dispatch({ type: 'LOG_HABIT', log });
    },
    []
  );

  const getLogForDay = useCallback(
    (habitId: string, date: string) =>
      state.logs.find((l) => l.habitId === habitId && l.date === date),
    [state.logs]
  );

  const updateSettings = useCallback((settings: Partial<AppSettings>) => {
    dispatch({ type: 'UPDATE_SETTINGS', settings });
  }, []);

  return (
    <HabitContext.Provider
      value={{
        ...state,
        addHabit,
        updateHabit,
        archiveHabit,
        unarchiveHabit,
        pinHabit,
        unpinHabit,
        reorderHabits,
        completeHabit,
        skipHabit,
        uncompleteHabit,
        retroLog,
        getLogForDay,
        updateSettings,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export const useHabits = () => useContext(HabitContext);
