import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Sun,
  Moon,
  Bell,
  BellSlash,
  Calendar,
  Export,
  ArrowCounterClockwise,
  Star,
  ChatCircle,
  Info,
} from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { RootStackParamList, TabParamList } from '../navigation/types';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

function SectionLabel({ title }: { title: string }) {
  const { colors } = useTheme();
  return (
    <Text
      style={{
        color: colors.textMuted,
        fontSize: Typography.size.label,
        fontFamily: Typography.fontFamily.semiBold,
        letterSpacing: Typography.tracking.section,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 24,
      }}
    >
      {title}
    </Text>
  );
}

function SettingRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  onPress,
  right,
  danger,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  value?: string;
  onPress?: () => void;
  right?: React.ReactNode;
  danger?: boolean;
}) {
  const { colors, isDark } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 16,
        gap: 14,
        opacity: pressed && !!onPress ? 0.7 : 1,
      })}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={18} color={iconColor} weight="regular" />
      </View>
      <Text
        style={{
          flex: 1,
          color: danger ? colors.error : colors.textPrimary,
          fontSize: Typography.size.body,
          fontFamily: Typography.fontFamily.medium,
        }}
      >
        {label}
      </Text>
      {value && (
        <Text
          style={{
            color: colors.textMuted,
            fontSize: Typography.size.small,
            fontFamily: Typography.fontFamily.regular,
          }}
        >
          {value}
        </Text>
      )}
      {right}
    </Pressable>
  );
}

function Divider() {
  const { colors, isDark } = useTheme();
  return (
    <View
      style={{
        height: 1,
        backgroundColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.05)',
        marginLeft: 66,
      }}
    />
  );
}

export function SettingsScreen({ navigation }: Props) {
  const { colors, toggleTheme, isDark } = useTheme();
  const { settings, updateSettings } = useHabits();

  const cardStyle = {
    backgroundColor: colors.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: isDark ? colors.cardBorder : 'rgba(0,0,0,0.06)',
    borderTopColor: isDark ? colors.topEdge : 'rgba(0,0,0,0.04)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: isDark ? 0.28 : 0.06,
    shadowRadius: 12,
    elevation: 8,
    overflow: 'hidden' as const,
  };

  const handleResetOnboarding = () => {
    if (Platform.OS === 'android') {
      Alert.alert(
        'Reset Onboarding',
        'This will take you back to the welcome screen.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Reset', onPress: () => navigation.replace('Onboarding') },
        ]
      );
    } else {
      navigation.replace('Onboarding');
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 48 }}>

        {/* Header */}
        <View style={{ paddingTop: 20, marginBottom: 4 }}>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: Typography.size.title,
              fontFamily: Typography.fontFamily.display,
              letterSpacing: -0.5,
            }}
          >
            Settings
          </Text>
        </View>

        {/* APPEARANCE */}
        <SectionLabel title="Appearance" />
        <Animated.View entering={FadeInDown.delay(0).springify()} style={cardStyle}>
          {/* Theme toggle */}
          <SettingRow
            icon={isDark ? Moon : Sun}
            iconBg={isDark ? 'rgba(114,215,240,0.15)' : 'rgba(254,188,87,0.15)'}
            iconColor={isDark ? colors.accent : colors.accentGold}
            label="Dark Mode"
            right={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{
                  false: isDark ? colors.surfaceElevated : '#e0e0e0',
                  true: colors.accent,
                }}
                thumbColor="#ffffff"
              />
            }
          />
        </Animated.View>

        {/* NOTIFICATIONS */}
        <SectionLabel title="Notifications" />
        <Animated.View entering={FadeInDown.delay(60).springify()} style={cardStyle}>
          <SettingRow
            icon={Bell}
            iconBg={`${colors.success}20`}
            iconColor={colors.success}
            label="Default reminder time"
            value={`${String(settings.defaultReminderHour).padStart(2, '0')}:${String(settings.defaultReminderMinute).padStart(2, '0')}`}
          />
          <Divider />
          <SettingRow
            icon={BellSlash}
            iconBg={`${colors.secondary}20`}
            iconColor={colors.secondary ?? colors.accent}
            label="Quiet hours"
            value={`${settings.quietHoursStart}:00 – ${settings.quietHoursEnd}:00`}
          />
        </Animated.View>

        {/* PREFERENCES */}
        <SectionLabel title="Preferences" />
        <Animated.View entering={FadeInDown.delay(120).springify()} style={cardStyle}>
          <SettingRow
            icon={Calendar}
            iconBg={isDark ? 'rgba(124,106,255,0.15)' : 'rgba(124,106,255,0.10)'}
            iconColor="#7c6aff"
            label="Week starts on"
            value={settings.weekStartsOn === 1 ? 'Monday' : 'Sunday'}
            onPress={() => updateSettings({ weekStartsOn: settings.weekStartsOn === 1 ? 0 : 1 })}
          />
        </Animated.View>

        {/* DATA */}
        <SectionLabel title="Data" />
        <Animated.View entering={FadeInDown.delay(180).springify()} style={cardStyle}>
          <SettingRow
            icon={Export}
            iconBg={`${colors.success}20`}
            iconColor={colors.success}
            label="Export / Backup"
            value="Coming soon"
          />
          <Divider />
          <SettingRow
            icon={ArrowCounterClockwise}
            iconBg={`${colors.warning}18`}
            iconColor={colors.warning}
            label="Restore Onboarding"
            onPress={handleResetOnboarding}
          />
        </Animated.View>

        {/* ABOUT */}
        <SectionLabel title="About" />
        <Animated.View entering={FadeInDown.delay(240).springify()} style={cardStyle}>
          <SettingRow
            icon={Star}
            iconBg={`${colors.accent}18`}
            iconColor={colors.accent}
            label="Habit Tracker"
            value="v1.0.0"
          />
          <Divider />
          <SettingRow
            icon={ChatCircle}
            iconBg={isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)'}
            iconColor={colors.textMuted}
            label="Send Feedback"
            onPress={() => {}}
          />
        </Animated.View>

        {/* App info accent card */}
        <Animated.View entering={FadeInDown.delay(300).springify()}>
          <View
            style={{
              backgroundColor: `${colors.accent}12`,
              borderRadius: 20,
              padding: 16,
              borderWidth: 1,
              borderColor: `${colors.accent}25`,
              marginTop: 24,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
            }}
          >
            <View
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: `${colors.accent}20`,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Star size={22} color={colors.accent} weight="fill" />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  color: colors.accent,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.semiBold,
                }}
              >
                Habit Tracker
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.small,
                  fontFamily: Typography.fontFamily.regular,
                  marginTop: 2,
                }}
              >
                All features included · No ads
              </Text>
            </View>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}
