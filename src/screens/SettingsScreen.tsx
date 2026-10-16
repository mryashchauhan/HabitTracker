import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Platform,
  Pressable,
  TextInput,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Moon, Sun, Export, Trash, Link, ArrowsClockwise } from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import {
  GRADIENT_LIGHT, SCREEN_WASH_DARK, SCREEN_WASH_LOCATIONS, GRADIENT_LOCATIONS, BG_LIGHT, BG_DARK,
} from '../theme/gradients';
import {
  SHEETS_WEBHOOK_URL_KEY,
  SHEETS_SYNC_ENABLED_KEY,
  LAST_SYNC_TIME_KEY,
} from '../utils/sheetsSync';
import { retryPendingSync, getPendingCount } from '../utils/syncQueue';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

function SectionLabel({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={{
      color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
      fontSize: 11,
      fontFamily: 'PlusJakartaSans_600SemiBold',
      letterSpacing: 1.4,
      textTransform: 'uppercase',
      marginBottom: 10,
      marginTop: 28,
    }}>
      {title}
    </Text>
  );
}

function SettingCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View style={{
      backgroundColor: isDark ? '#222226' : '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: isDark ? 0.28 : 0.07,
      shadowRadius: 12,
      elevation: 6,
      overflow: 'hidden',
    }}>
      {children}
    </View>
  );
}

function SettingRow({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  sublabel,
  right,
  onPress,
  isDark,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  isDark: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 16,
        gap: 14,
        opacity: pressed && !!onPress ? 0.7 : 1,
      })}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: iconBg,
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={iconColor} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{
          color: isDark ? '#FFFFFF' : '#1A1A1A',
          fontSize: 15,
          fontFamily: 'PlusJakartaSans_600SemiBold',
        }}>
          {label}
        </Text>
        {sublabel && (
          <Text style={{
            color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
            fontSize: 12,
            fontFamily: 'PlusJakartaSans_400Regular',
            marginTop: 2,
          }}>
            {sublabel}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
}

export function SettingsScreen({}: Props) {
  const { isDark, toggleTheme } = useTheme();
  const { habits, logs, resetAllData } = useHabits();

  const handleExport = () => {
    const data = JSON.stringify({ habits, logs }, null, 2);
    Alert.alert(
      'Backup Data',
      `Your data contains ${habits.length} habit${habits.length !== 1 ? 's' : ''} and ${logs.length} log${logs.length !== 1 ? 's' : ''}.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Copy JSON',
          onPress: () => {
            Alert.alert('Copied!', 'Habit data copied. In production this would export to a file.');
          },
        },
      ]
    );
  };

  const handleReset = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your habits and logs. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you sure?',
              'All habit data will be gone forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, Delete All',
                  style: 'destructive',
                  onPress: () => resetAllData(),
                },
              ]
            );
          },
        },
      ]
    );
  };

  // ── Google Sheets sync state ────────────────────────────────────────────
  const [syncEnabled, setSyncEnabled] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [pendingCount, setPendingCount] = useState(0);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load sync settings from AsyncStorage on mount
  useEffect(() => {
    (async () => {
      const [enabledRaw, urlRaw, lastRaw] = await AsyncStorage.multiGet([
        SHEETS_SYNC_ENABLED_KEY,
        SHEETS_WEBHOOK_URL_KEY,
        LAST_SYNC_TIME_KEY,
      ]);
      setSyncEnabled(enabledRaw[1] === 'true');
      setWebhookUrl(urlRaw[1] ?? '');
      setLastSyncTime(lastRaw[1] ?? null);
      setPendingCount(await getPendingCount());
    })();
  }, []);

  const handleToggleSync = async (value: boolean) => {
    setSyncEnabled(value);
    await AsyncStorage.setItem(SHEETS_SYNC_ENABLED_KEY, value ? 'true' : 'false');
  };

  const handleWebhookBlur = async () => {
    await AsyncStorage.setItem(SHEETS_WEBHOOK_URL_KEY, webhookUrl.trim());
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      await retryPendingSync();
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_TIME_KEY, now);
      setLastSyncTime(now);
      setPendingCount(await getPendingCount());
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? BG_DARK : BG_LIGHT }}>
      <LinearGradient
        colors={isDark ? SCREEN_WASH_DARK : GRADIENT_LIGHT}
        locations={isDark ? SCREEN_WASH_LOCATIONS : GRADIENT_LOCATIONS}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top']}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: FLOATING_NAV_HEIGHT + 140 }}
        >
          {/* Header */}
          <View style={{ paddingTop: 18, paddingBottom: 4 }}>
            <Text style={{
              color: '#FFFFFF',
              fontSize: 28,
              fontFamily: 'PlusJakartaSans_700Bold',
              letterSpacing: -0.5,
            }}>
              Settings
            </Text>
          </View>

          {/* APPEARANCE */}
          <SectionLabel title="Appearance" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(0).springify()}>
            <SettingCard isDark={isDark}>
              <SettingRow
                isDark={isDark}
                icon={isDark ? Moon : Sun}
                iconBg={isDark ? 'rgba(114,215,240,0.18)' : 'rgba(254,188,87,0.18)'}
                iconColor={isDark ? '#72D7F0' : '#F6A623'}
                label="Dark Mode"
                sublabel={isDark ? 'Currently dark' : 'Currently light'}
                right={
                  <Switch
                    value={isDark}
                    onValueChange={toggleTheme}
                    trackColor={{
                      false: 'rgba(0,0,0,0.15)',
                      true: '#F6955D',
                    }}
                    thumbColor="#ffffff"
                  />
                }
              />
            </SettingCard>
          </Animated.View>

          {/* DATA */}
          <SectionLabel title="Data" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <SettingCard isDark={isDark}>
              <SettingRow
                isDark={isDark}
                icon={Export}
                iconBg="rgba(0,216,46,0.18)"
                iconColor="#00D82E"
                label="Backup & Export"
                sublabel={`${habits.length} habits · ${logs.length} logs`}
                onPress={handleExport}
                right={
                  <View style={{
                    backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                  }}>
                    <Text style={{
                      color: isDark ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.5)',
                      fontSize: 11,
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                    }}>
                      Export
                    </Text>
                  </View>
                }
              />
            </SettingCard>
          </Animated.View>

          {/* GOOGLE SHEETS SYNC */}
          <SectionLabel title="Google Sheets Sync" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <SettingCard isDark={isDark}>
              {/* Toggle row */}
              <SettingRow
                isDark={isDark}
                icon={Link}
                iconBg="rgba(72,82,245,0.18)"
                iconColor="#4852F5"
                label="Sync to Google Sheets"
                sublabel={syncEnabled ? 'Enabled' : 'Disabled'}
                right={
                  <Switch
                    value={syncEnabled}
                    onValueChange={handleToggleSync}
                    trackColor={{ false: 'rgba(0,0,0,0.15)', true: '#4852F5' }}
                    thumbColor="#ffffff"
                  />
                }
              />

              {/* Divider */}
              <View style={{
                height: 1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                marginLeft: 70,
              }} />

              {/* Webhook URL input */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 14,
              }}>
                <View style={{
                  width: 40, height: 40, borderRadius: 12,
                  backgroundColor: 'rgba(72,82,245,0.12)',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  <Link size={20} color="#4852F5" weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    color: isDark ? '#FFFFFF' : '#1A1A1A',
                    fontSize: 13,
                    fontFamily: 'PlusJakartaSans_600SemiBold',
                    marginBottom: 6,
                  }}>
                    Webhook URL
                  </Text>
                  <TextInput
                    value={webhookUrl}
                    onChangeText={setWebhookUrl}
                    onBlur={handleWebhookBlur}
                    placeholder="https://script.google.com/macros/s/..."
                    placeholderTextColor={isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'}
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={{
                      color: isDark ? '#FFFFFF' : '#1A1A1A',
                      fontSize: 12,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
                    }}
                  />
                </View>
              </View>

              {/* Divider */}
              <View style={{
                height: 1,
                backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                marginLeft: 70,
              }} />

              {/* Pending count + last sync + button */}
              <View style={{
                paddingVertical: 14,
                paddingHorizontal: 16,
                gap: 8,
              }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                    fontSize: 13,
                    fontFamily: 'PlusJakartaSans_500Medium',
                  }}>
                    Pending unsynced items
                  </Text>
                  <Text style={{
                    color: pendingCount > 0 ? '#F6955D' : (isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)'),
                    fontSize: 13,
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}>
                    {pendingCount}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text style={{
                    color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                    fontSize: 13,
                    fontFamily: 'PlusJakartaSans_500Medium',
                  }}>
                    Last synced
                  </Text>
                  <Text style={{
                    color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                    fontSize: 12,
                    fontFamily: 'PlusJakartaSans_400Regular',
                    maxWidth: 180,
                    textAlign: 'right',
                  }}>
                    {lastSyncTime
                      ? new Date(lastSyncTime).toLocaleString()
                      : 'Never'}
                  </Text>
                </View>

                {/* Sync Now button */}
                <Pressable
                  onPress={handleSyncNow}
                  disabled={isSyncing}
                  style={({ pressed }) => ({
                    marginTop: 4,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    backgroundColor: isSyncing
                      ? (isDark ? 'rgba(72,82,245,0.35)' : 'rgba(72,82,245,0.20)')
                      : '#4852F5',
                    borderRadius: 12,
                    paddingVertical: 12,
                    opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <ArrowsClockwise
                    size={16}
                    color="#FFFFFF"
                    weight="bold"
                  />
                  <Text style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}>
                    {isSyncing ? 'Syncing…' : 'Sync Now'}
                  </Text>
                </Pressable>
              </View>
            </SettingCard>
          </Animated.View>

          {/* DANGER ZONE */}
          <SectionLabel title="Danger Zone" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(140).springify()}>
            <SettingCard isDark={isDark}>
              <SettingRow
                isDark={isDark}
                icon={Trash}
                iconBg="rgba(230,57,70,0.15)"
                iconColor="#E63946"
                label="Delete All Data"
                sublabel="Permanently remove all habits and logs"
                onPress={handleReset}
                right={
                  <View style={{
                    backgroundColor: 'rgba(230,57,70,0.12)',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: 5,
                    borderWidth: 1,
                    borderColor: 'rgba(230,57,70,0.25)',
                  }}>
                    <Text style={{
                      color: '#E63946',
                      fontSize: 11,
                      fontFamily: 'PlusJakartaSans_600SemiBold',
                    }}>
                      Reset
                    </Text>
                  </View>
                }
              />
            </SettingCard>
          </Animated.View>

          {/* App version footer */}
          <Animated.View entering={FadeInDown.delay(160).springify()}>
            <Text style={{
              color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
              fontSize: 12,
              fontFamily: 'PlusJakartaSans_400Regular',
              textAlign: 'center',
              marginTop: 40,
            }}>
              Habit Tracker v1.0.0
            </Text>
          </Animated.View>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
