import React from 'react';
import { Platform, View } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import {
  CalendarCheck,
  ListChecks,
  ChartBar,
  Gear,
} from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';
import { TabParamList } from './types';
import * as Haptics from 'expo-haptics';

import { TodayScreen } from '../screens/TodayScreen';
import { HabitsScreen } from '../screens/HabitsScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator<TabParamList>();

function AnimatedTabIcon({
  focused,
  IconComponent,
  color,
}: {
  focused: boolean;
  IconComponent: React.ElementType;
  color: string;
}) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    if (focused) {
      scale.value = withSpring(1.15, { damping: 12, stiffness: 300 });
    } else {
      scale.value = withSpring(1, { damping: 12, stiffness: 300 });
    }
  }, [focused]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <IconComponent
        size={24}
        color={color}
        weight={focused ? 'bold' : 'regular'}
      />
    </Animated.View>
  );
}

export function TabNavigator() {
  const { colors, isDark } = useTheme();

  return (
    <>
    {/* @ts-ignore */}
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.tabBar,
          borderTopColor: isDark ? colors.tabBorder : 'rgba(0,0,0,0.06)',
          borderTopWidth: 1,
          height: Platform.OS === 'android' ? 64 : 88,
          paddingBottom: Platform.OS === 'android' ? 10 : 24,
          paddingTop: 8,
          elevation: 0,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          fontFamily: Typography.fontFamily.semiBold,
          fontSize: Typography.size.label,
          marginTop: 2,
          letterSpacing: 0.3,
        },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') {
            Haptics.selectionAsync();
          }
        },
      }}
    >
      <Tab.Screen
        name="Today"
        component={TodayScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              IconComponent={CalendarCheck}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Habits"
        component={HabitsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              IconComponent={ListChecks}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              IconComponent={ChartBar}
              color={color}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon
              focused={focused}
              IconComponent={Gear}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
    </>
  );
}
