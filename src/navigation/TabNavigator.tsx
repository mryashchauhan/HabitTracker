import React from 'react';
import { Platform, View, StyleSheet, useWindowDimensions, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { CalendarCheck, Trophy, ChartBar, GearSix } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { TabParamList } from './types';
import * as Haptics from 'expo-haptics';
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import { TodayScreen } from '../screens/TodayScreen';
import { AchievementsScreen } from '../screens/AchievementsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();
// New sophisticated active accent for the material theme
const ACTIVE_ACCENT = '#FFFFFF';
const INACTIVE_TINT_DARK = 'rgba(255,255,255,0.4)';
const INACTIVE_TINT_LIGHT = 'rgba(0,0,0,0.35)';

// Total bottom clearance screens should reserve

// Pill dimensions — bigger and more prominent
const PILL_HEIGHT = 68;
const PILL_RADIUS = 34;
const PILL_BOTTOM = Platform.OS === 'android' ? 24 : 34;

function CircularTabIcon({ focused, IconComponent }: { focused: boolean; IconComponent: React.ElementType }) {
  const { isDark } = useTheme();

  const scale = useSharedValue(1);
  React.useEffect(() => {
    scale.value = withSpring(focused ? 1.08 : 1.0, { damping: 12, stiffness: 280 });
  }, [focused]);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View style={[animStyle, {
      width: 44, height: 44, borderRadius: 22,
      backgroundColor: focused
        ? ACTIVE_ACCENT
        : 'transparent',
      alignItems: 'center', justifyContent: 'center',
      shadowColor: focused ? ACTIVE_ACCENT : 'transparent',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: focused ? 0.40 : 0,
      shadowRadius: 10,
      elevation: focused ? 5 : 0,
    }]}>
      <IconComponent
        size={22}
        color={focused ? (isDark ? '#000000' : '#000000') : isDark ? INACTIVE_TINT_DARK : INACTIVE_TINT_LIGHT}
        weight={focused ? 'bold' : 'regular'}
      />
    </Animated.View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { isDark } = useTheme();
  const { width: screenW } = useWindowDimensions();

  const PILL_WIDTH = Math.min(320, Math.round(screenW * 0.78));
  const sideMargin = Math.round((screenW - PILL_WIDTH) / 2);

  return (
    <View style={{
      position: 'absolute',
      bottom: PILL_BOTTOM,
      left: sideMargin,
      width: PILL_WIDTH,
      height: PILL_HEIGHT,
      borderRadius: PILL_RADIUS,
      // Outer drop shadow for the floating pill
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: isDark ? 0.45 : 0.2,
      shadowRadius: 28,
      elevation: 24,
    }}>
      <BlurView
        tint={isDark ? 'dark' : 'light'}
        intensity={isDark ? 100 : 80}
        style={{
          ...StyleSheet.absoluteFill,
          borderRadius: PILL_RADIUS,
          overflow: 'hidden',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          // Liquid glass overlay
          backgroundColor: isDark ? 'rgba(20,20,22,0.85)' : 'rgba(255,255,255,0.8)',
          // Inner glowing edge
          borderWidth: 1,
          borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
        }}
      >
        {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;
        
        // Ensure options.tabBarIcon is a function that returns an element
        const Icon = typeof options.tabBarIcon === 'function' ? options.tabBarIcon : null;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={index}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' }}
          >
            {Icon && Icon({ focused: isFocused, color: '', size: 24 })}
          </TouchableOpacity>
        );
      })}
      </BlurView>
    </View>
  );
}

export function TabNavigator() {
  return (
    <>
      {/* @ts-ignore */}
      <Tab.Navigator
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Today" component={TodayScreen}
          options={{ tabBarIcon: ({ focused }) => <CircularTabIcon focused={focused} IconComponent={CalendarCheck} /> }}
        />
        <Tab.Screen
          name="Achievements" component={AchievementsScreen}
          options={{ tabBarIcon: ({ focused }) => <CircularTabIcon focused={focused} IconComponent={Trophy} /> }}
        />
        <Tab.Screen
          name="Stats" component={StatsScreen}
          options={{ tabBarIcon: ({ focused }) => <CircularTabIcon focused={focused} IconComponent={ChartBar} /> }}
        />
        <Tab.Screen
          name="Settings" component={SettingsScreen}
          options={{ tabBarIcon: ({ focused }) => <CircularTabIcon focused={focused} IconComponent={GearSix} /> }}
        />
      </Tab.Navigator>
    </>
  );
}
