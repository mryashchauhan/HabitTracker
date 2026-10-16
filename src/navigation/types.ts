export type RootStackParamList = {
  Onboarding: undefined;
  MainTabs: undefined;
  HabitDetail: { habitId: string };
  AddHabit: undefined;
  EditHabit: { habitId: string };
  Calendar: { habitId: string };
};

export type TabParamList = {
  Today: undefined;
  Achievements: undefined;
  Stats: undefined;
  Settings: undefined;
};
