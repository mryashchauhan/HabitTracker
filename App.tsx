import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from './src/theme/ThemeContext';
import { HabitProvider } from './src/context/HabitContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ErrorBoundary } from './src/components/ErrorBoundary';
import {
  useFonts,
  Fraunces_700Bold,
  Fraunces_600SemiBold,
} from '@expo-google-fonts/fraunces';
import {
  SpaceGrotesk_400Regular,
  SpaceGrotesk_500Medium,
  SpaceGrotesk_600SemiBold,
} from '@expo-google-fonts/space-grotesk';
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
} from '@expo-google-fonts/plus-jakarta-sans';
import * as SplashScreen from 'expo-splash-screen';

SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded] = useFonts({
    // Display font — habit detail screen
    Fraunces_700Bold,
    Fraunces_600SemiBold,
    // Legacy font — kept for backwards compatibility
    SpaceGrotesk_400Regular,
    SpaceGrotesk_500Medium,
    SpaceGrotesk_600SemiBold,
    // Primary font — Plus Jakarta Sans (Behance reference)
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    // Legacy Urbanist aliases — mapped to Plus Jakarta Sans so existing
    // 'Urbanist_*' references in older components continue to work.
    Urbanist_400Regular: PlusJakartaSans_400Regular,
    Urbanist_500Medium:  PlusJakartaSans_500Medium,
    Urbanist_600SemiBold: PlusJakartaSans_600SemiBold,
    Urbanist_700Bold:    PlusJakartaSans_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <HabitProvider>
            <ErrorBoundary>
              <RootNavigator />
            </ErrorBoundary>
          </HabitProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
