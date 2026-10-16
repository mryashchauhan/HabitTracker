import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../theme/ThemeContext';
import { RootStackParamList } from './types';
import { TabNavigator } from './TabNavigator';

// Screens
import { OnboardingScreen } from '../screens/OnboardingScreen';
import { HabitDetailScreen } from '../screens/HabitDetailScreen';
import { AddHabitScreen } from '../screens/AddHabitScreen';
import { EditHabitScreen } from '../screens/EditHabitScreen';
import { CalendarScreen } from '../screens/CalendarScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isDark, colors } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      {/* @ts-ignore - React Navigation 7 id prop TS strict issue, not a runtime error */}
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        {/* Onboarding — always shown (per user preference) */}
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{ animation: 'fade' }}
        />

        {/* Main tab navigator */}
        <Stack.Screen
          name="MainTabs"
          component={TabNavigator}
          options={{ animation: 'fade' }}
        />

        {/* Detail screens */}
        <Stack.Screen
          name="HabitDetail"
          component={HabitDetailScreen}
          options={{ animation: 'slide_from_right' }}
        />

        {/* Modals */}
        <Stack.Screen
          name="AddHabit"
          component={AddHabitScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="EditHabit"
          component={EditHabitScreen}
          options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="Calendar"
          component={CalendarScreen}
          options={{ animation: 'slide_from_right' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
