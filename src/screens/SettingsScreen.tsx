import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Switch,
  Alert,
  Pressable,
  TextInput,
  StyleSheet,
  Modal,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import {
  Moon,
  Sun,
  Export,
  DownloadSimple,
  Trash,
  Link,
  ArrowsClockwise,
  CloudArrowDown,
  Question,
  X,
} from 'phosphor-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { RootStackParamList, TabParamList } from '../navigation/types';
import { FLOATING_NAV_HEIGHT } from '../constants/layout';
import {
  GRADIENT_LIGHT,
  SCREEN_WASH_DARK,
  SCREEN_WASH_LOCATIONS,
  GRADIENT_LOCATIONS,
  BG_LIGHT,
  BG_DARK,
} from '../theme/gradients';
import {
  SHEETS_WEBHOOK_URL_KEY,
  SHEETS_SYNC_ENABLED_KEY,
  LAST_SYNC_TIME_KEY,
  isValidWebhookUrl,
  pushFullBackupToSheets,
  restoreFromGoogleSheets,
  GOOGLE_APPS_SCRIPT_TEMPLATE,
} from '../utils/sheetsSync';
import { retryPendingSync, getPendingCount } from '../utils/syncQueue';

type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'Settings'>,
  NativeStackScreenProps<RootStackParamList>
>;

function SectionLabel({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text
      style={{
        color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
        fontSize: 11,
        fontFamily: 'PlusJakartaSans_600SemiBold',
        letterSpacing: 1.4,
        textTransform: 'uppercase',
        marginBottom: 10,
        marginTop: 28,
      }}
    >
      {title}
    </Text>
  );
}

function SettingCard({ children, isDark }: { children: React.ReactNode; isDark: boolean }) {
  return (
    <View
      style={{
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
      }}
    >
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
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 12,
          backgroundColor: iconBg,
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Icon size={20} color={iconColor} weight="fill" />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: isDark ? '#FFFFFF' : '#1A1A1A',
            fontSize: 15,
            fontFamily: 'PlusJakartaSans_600SemiBold',
          }}
        >
          {label}
        </Text>
        {sublabel && (
          <Text
            style={{
              color: isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.40)',
              fontSize: 12,
              fontFamily: 'PlusJakartaSans_400Regular',
              marginTop: 2,
            }}
          >
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
  const { habits, logs, settings, restoreData, resetAllData } = useHabits();

  // ── Modals for JSON Import & Google Sheets Guide ────────────────────────
  const [showImportModal, setShowImportModal] = useState(false);
  const [importJsonText, setImportJsonText] = useState('');
  const [showGuideModal, setShowGuideModal] = useState(false);

  // ── Export & Import JSON ────────────────────────────────────────────────
  const handleExport = async () => {
    try {
      const data = JSON.stringify(
        {
          version: 1,
          exportedAt: new Date().toISOString(),
          habits,
          logs,
          settings,
        },
        null,
        2
      );
      await Share.share({
        title: 'HabitTracker Backup JSON',
        message: data,
      });
    } catch (err: any) {
      Alert.alert('Export Error', err?.message ?? 'Could not share backup data.');
    }
  };

  const handleConfirmImportJson = () => {
    try {
      const parsed = JSON.parse(importJsonText.trim());
      if (!Array.isArray(parsed.habits) || !Array.isArray(parsed.logs)) {
        Alert.alert('Invalid Backup', 'JSON must contain "habits" and "logs" arrays.');
        return;
      }
      restoreData(
        {
          habits: parsed.habits,
          logs: parsed.logs,
          settings: parsed.settings,
        },
        'merge'
      );
      setShowImportModal(false);
      setImportJsonText('');
      Alert.alert(
        'Backup Restored',
        `Imported ${parsed.habits.length} habits and ${parsed.logs.length} logs.`
      );
    } catch {
      Alert.alert('Invalid JSON', 'Please paste a valid HabitTracker JSON backup.');
    }
  };

  const handleReset = () => {
    Alert.alert(
      'Delete All Data',
      'This will permanently delete all your habits and logs on this device. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Are you sure?', 'All local habit data will be removed.', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Yes, Delete All',
                style: 'destructive',
                onPress: () => {
                  resetAllData();
                  setSyncEnabled(false);
                  setWebhookUrl('');
                  setLastSyncTime(null);
                  setPendingCount(0);
                },
              },
            ]);
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
  const [isRestoring, setIsRestoring] = useState(false);

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

  const handleWebhookChange = (text: string) => {
    setWebhookUrl(text);
    AsyncStorage.setItem(SHEETS_WEBHOOK_URL_KEY, text.trim());
  };

  const handleWebhookBlur = async () => {
    const trimmed = webhookUrl.trim();
    if (trimmed && !isValidWebhookUrl(trimmed)) {
      Alert.alert(
        'Invalid Webhook URL',
        'Google Sheets webhooks must begin with https://script.google.com/macros/s/'
      );
    }
    await AsyncStorage.setItem(SHEETS_WEBHOOK_URL_KEY, trimmed);
  };

  const handleSyncNow = async () => {
    const trimmed = webhookUrl.trim();
    if (!isValidWebhookUrl(trimmed)) {
      Alert.alert(
        'Webhook URL Required',
        'Paste your Google Apps Script URL (starting with https://script.google.com/macros/s/) before syncing.'
      );
      return;
    }

    await AsyncStorage.setItem(SHEETS_WEBHOOK_URL_KEY, trimmed);
    setIsSyncing(true);
    try {
      await retryPendingSync();
      await pushFullBackupToSheets(habits, logs, settings);
      const now = new Date().toISOString();
      await AsyncStorage.setItem(LAST_SYNC_TIME_KEY, now);
      setLastSyncTime(now);
      setPendingCount(await getPendingCount());
      Alert.alert(
        'Backup Complete',
        `Backed up ${habits.length} habit${habits.length === 1 ? '' : 's'} and ${logs.length} log${logs.length === 1 ? '' : 's'} to Google Sheets.`
      );
    } catch (err: any) {
      Alert.alert('Sync Failed', err?.message ?? 'Could not reach Google Sheets webhook.');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestoreFromSheets = async () => {
    const trimmed = webhookUrl.trim();
    if (!isValidWebhookUrl(trimmed)) {
      Alert.alert(
        'Webhook URL Required',
        'Paste your Google Apps Script URL first so the app knows which Sheet to restore from.'
      );
      return;
    }

    await AsyncStorage.setItem(SHEETS_WEBHOOK_URL_KEY, trimmed);
    setIsRestoring(true);
    try {
      const restored = await restoreFromGoogleSheets();
      if (restored.habits.length === 0 && restored.logs.length === 0) {
        Alert.alert(
          'No Backup Found',
          'Connected to Google Sheet, but no habits or logs were found yet. Make sure your Apps Script includes the restore handler (tap "How to Connect" below).'
        );
        return;
      }

      if (habits.length === 0) {
        restoreData(restored, 'replace');
        Alert.alert(
          'Restored from Google Sheets!',
          `Recovered ${restored.habits.length} habit${restored.habits.length === 1 ? '' : 's'} and ${restored.logs.length} log${restored.logs.length === 1 ? '' : 's'}.`
        );
      } else {
        Alert.alert(
          'Restore from Google Sheets',
          `Found ${restored.habits.length} habits and ${restored.logs.length} logs in your Sheet. How would you like to restore them?`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Merge with Current',
              onPress: () => {
                restoreData(restored, 'merge');
                Alert.alert('Merged!', 'Your Sheet habits and logs have been merged.');
              },
            },
            {
              text: 'Replace Local Data',
              style: 'destructive',
              onPress: () => {
                restoreData(restored, 'replace');
                Alert.alert('Restored!', 'Local data replaced with your Google Sheet backup.');
              },
            },
          ]
        );
      }
    } catch (err: any) {
      Alert.alert(
        'Restore Failed',
        err?.message ??
          'Could not fetch backup from Google Sheets. Make sure your Apps Script is deployed with "Who has access: Anyone".'
      );
    } finally {
      setIsRestoring(false);
    }
  };

  const handleShareAppsScript = async () => {
    try {
      await Share.share({
        title: 'HabitTracker Google Apps Script',
        message: GOOGLE_APPS_SCRIPT_TEMPLATE,
      });
    } catch {
      // ignore
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
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: FLOATING_NAV_HEIGHT + 140,
          }}
        >
          {/* Header */}
          <View style={{ paddingTop: 18, paddingBottom: 4 }}>
            <Text
              style={{
                color: '#FFFFFF',
                fontSize: 28,
                fontFamily: 'PlusJakartaSans_700Bold',
                letterSpacing: -0.5,
              }}
            >
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

          {/* GOOGLE SHEETS SYNC */}
          <SectionLabel title="Google Sheets Cloud Backup" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(80).springify()}>
            <SettingCard isDark={isDark}>
              {/* Toggle row */}
              <SettingRow
                isDark={isDark}
                icon={Link}
                iconBg="rgba(72,82,245,0.18)"
                iconColor="#4852F5"
                label="Auto-Sync to Google Sheets"
                sublabel={
                  syncEnabled
                    ? 'Automatically backs up new habits & logs'
                    : 'Turn on to auto-sync changes'
                }
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
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  marginLeft: 70,
                }}
              />

              {/* Webhook URL input */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  gap: 14,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: 'rgba(72,82,245,0.12)',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Link size={20} color="#4852F5" weight="fill" />
                </View>
                <View style={{ flex: 1 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark ? '#FFFFFF' : '#1A1A1A',
                        fontSize: 13,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                      }}
                    >
                      Apps Script Webhook URL
                    </Text>
                    <Pressable onPress={() => setShowGuideModal(true)}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Question size={14} color="#F6955D" weight="bold" />
                        <Text
                          style={{
                            color: '#F6955D',
                            fontSize: 12,
                            fontFamily: 'PlusJakartaSans_600SemiBold',
                          }}
                        >
                          How to Connect
                        </Text>
                      </View>
                    </Pressable>
                  </View>
                  <TextInput
                    value={webhookUrl}
                    onChangeText={handleWebhookChange}
                    onBlur={handleWebhookBlur}
                    placeholder="https://script.google.com/macros/s/..."
                    placeholderTextColor={
                      isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)'
                    }
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="url"
                    style={{
                      color: isDark ? '#FFFFFF' : '#1A1A1A',
                      fontSize: 12,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.06)'
                        : 'rgba(0,0,0,0.05)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 8,
                      borderWidth: 1,
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.10)'
                        : 'rgba(0,0,0,0.08)',
                    }}
                  />
                </View>
              </View>

              {/* Divider */}
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  marginLeft: 70,
                }}
              />

              {/* Pending count + last sync + Backup & Restore buttons */}
              <View
                style={{
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  gap: 8,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                      fontSize: 13,
                      fontFamily: 'PlusJakartaSans_500Medium',
                    }}
                  >
                    Pending unsynced items
                  </Text>
                  <Text
                    style={{
                      color:
                        pendingCount > 0
                          ? '#F6955D'
                          : isDark
                          ? 'rgba(255,255,255,0.35)'
                          : 'rgba(0,0,0,0.35)',
                      fontSize: 13,
                      fontFamily: 'PlusJakartaSans_700Bold',
                    }}
                  >
                    {pendingCount}
                  </Text>
                </View>

                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Text
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.45)',
                      fontSize: 13,
                      fontFamily: 'PlusJakartaSans_500Medium',
                    }}
                  >
                    Last synced
                  </Text>
                  <Text
                    style={{
                      color: isDark ? 'rgba(255,255,255,0.35)' : 'rgba(0,0,0,0.35)',
                      fontSize: 12,
                      fontFamily: 'PlusJakartaSans_400Regular',
                      maxWidth: 180,
                      textAlign: 'right',
                    }}
                  >
                    {lastSyncTime ? new Date(lastSyncTime).toLocaleString() : 'Never'}
                  </Text>
                </View>

                {/* Two-button row: Backup Now + Restore from Sheet */}
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 6 }}>
                  <Pressable
                    onPress={handleSyncNow}
                    disabled={isSyncing || isRestoring}
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: isSyncing
                        ? isDark
                          ? 'rgba(72,82,245,0.35)'
                          : 'rgba(72,82,245,0.20)'
                        : '#4852F5',
                      borderRadius: 12,
                      paddingVertical: 12,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <ArrowsClockwise size={16} color="#FFFFFF" weight="bold" />
                    <Text
                      style={{
                        color: '#FFFFFF',
                        fontSize: 13,
                        fontFamily: 'PlusJakartaSans_700Bold',
                      }}
                    >
                      {isSyncing ? 'Backing up…' : 'Backup to Sheet'}
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={handleRestoreFromSheets}
                    disabled={isSyncing || isRestoring}
                    style={({ pressed }) => ({
                      flex: 1,
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.09)'
                        : 'rgba(0,0,0,0.07)',
                      borderWidth: 1,
                      borderColor: isDark
                        ? 'rgba(255,255,255,0.16)'
                        : 'rgba(0,0,0,0.12)',
                      borderRadius: 12,
                      paddingVertical: 12,
                      opacity: pressed ? 0.8 : 1,
                    })}
                  >
                    <CloudArrowDown
                      size={16}
                      color={isDark ? '#FFFFFF' : '#1A1A1A'}
                      weight="bold"
                    />
                    <Text
                      style={{
                        color: isDark ? '#FFFFFF' : '#1A1A1A',
                        fontSize: 13,
                        fontFamily: 'PlusJakartaSans_700Bold',
                      }}
                    >
                      {isRestoring ? 'Restoring…' : 'Restore from Sheet'}
                    </Text>
                  </Pressable>
                </View>
              </View>
            </SettingCard>
          </Animated.View>

          {/* LOCAL FILE BACKUP */}
          <SectionLabel title="Manual JSON Backup" isDark={isDark} />
          <Animated.View entering={FadeInDown.delay(120).springify()}>
            <SettingCard isDark={isDark}>
              <SettingRow
                isDark={isDark}
                icon={Export}
                iconBg="rgba(0,216,46,0.18)"
                iconColor="#00D82E"
                label="Export Backup JSON"
                sublabel={`${habits.length} habits · ${logs.length} logs`}
                onPress={handleExport}
                right={
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(0,0,0,0.6)',
                        fontSize: 11,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                      }}
                    >
                      Share
                    </Text>
                  </View>
                }
              />

              <View
                style={{
                  height: 1,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
                  marginLeft: 70,
                }}
              />

              <SettingRow
                isDark={isDark}
                icon={DownloadSimple}
                iconBg="rgba(246,149,93,0.18)"
                iconColor="#F6955D"
                label="Import Backup JSON"
                sublabel="Restore habits from a saved JSON snapshot"
                onPress={() => setShowImportModal(true)}
                right={
                  <View
                    style={{
                      backgroundColor: isDark
                        ? 'rgba(255,255,255,0.08)'
                        : 'rgba(0,0,0,0.06)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                    }}
                  >
                    <Text
                      style={{
                        color: isDark
                          ? 'rgba(255,255,255,0.7)'
                          : 'rgba(0,0,0,0.6)',
                        fontSize: 11,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                      }}
                    >
                      Import
                    </Text>
                  </View>
                }
              />
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
                sublabel="Permanently remove all local habits and logs"
                onPress={handleReset}
                right={
                  <View
                    style={{
                      backgroundColor: 'rgba(230,57,70,0.12)',
                      borderRadius: 8,
                      paddingHorizontal: 10,
                      paddingVertical: 5,
                      borderWidth: 1,
                      borderColor: 'rgba(230,57,70,0.25)',
                    }}
                  >
                    <Text
                      style={{
                        color: '#E63946',
                        fontSize: 11,
                        fontFamily: 'PlusJakartaSans_600SemiBold',
                      }}
                    >
                      Reset
                    </Text>
                  </View>
                }
              />
            </SettingCard>
          </Animated.View>

          {/* App version footer */}
          <Animated.View entering={FadeInDown.delay(160).springify()}>
            <Text
              style={{
                color: isDark ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                fontSize: 12,
                fontFamily: 'PlusJakartaSans_400Regular',
                textAlign: 'center',
                marginTop: 40,
              }}
            >
              Habit Tracker v1.0.0
            </Text>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>

      {/* ── MODAL: Google Sheets Setup Guide & Apps Script ───────────────── */}
      <Modal
        visible={showGuideModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowGuideModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'flex-end',
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#18181C' : '#FFFFFF',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: '85%',
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 14,
              }}
            >
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#1A1A1A',
                  fontSize: 18,
                  fontFamily: 'PlusJakartaSans_700Bold',
                }}
              >
                Connect Google Sheets (No Login)
              </Text>
              <Pressable onPress={() => setShowGuideModal(false)} hitSlop={12}>
                <X size={22} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text
                style={{
                  color: isDark ? 'rgba(255,255,255,0.75)' : '#444444',
                  fontSize: 13,
                  lineHeight: 20,
                  fontFamily: 'PlusJakartaSans_400Regular',
                  marginBottom: 14,
                }}
              >
                1. Open your Google Sheet and click{' '}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
                  Extensions → Apps Script
                </Text>
                .{'\n'}
                2. Paste the script below and click{' '}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Save</Text>.{'\n'}
                3. Click{' '}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>
                  Deploy → New deployment → Web app
                </Text>{' '}
                (set Execute as: <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Me</Text>,
                Who has access:{' '}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Anyone</Text>).{'\n'}
                4. Paste the Web App URL into Settings. Anytime you reinstall the app, just paste
                that URL and tap{' '}
                <Text style={{ fontFamily: 'PlusJakartaSans_700Bold' }}>Restore from Sheet</Text>!
              </Text>

              <Pressable
                onPress={handleShareAppsScript}
                style={({ pressed }) => ({
                  backgroundColor: '#4852F5',
                  borderRadius: 12,
                  paddingVertical: 12,
                  alignItems: 'center',
                  marginBottom: 12,
                  opacity: pressed ? 0.85 : 1,
                })}
              >
                <Text
                  style={{
                    color: '#FFFFFF',
                    fontSize: 14,
                    fontFamily: 'PlusJakartaSans_700Bold',
                  }}
                >
                  Copy / Share Apps Script Code
                </Text>
              </Pressable>

              <View
                style={{
                  backgroundColor: isDark ? '#0D0D10' : '#F3F4F6',
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 20,
                }}
              >
                <Text
                  selectable
                  style={{
                    color: isDark ? 'rgba(255,255,255,0.70)' : '#333333',
                    fontSize: 11,
                    fontFamily: 'PlusJakartaSans_400Regular',
                  }}
                >
                  {GOOGLE_APPS_SCRIPT_TEMPLATE}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ── MODAL: Import JSON Backup ────────────────────────────────────── */}
      <Modal
        visible={showImportModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImportModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.75)',
            justifyContent: 'center',
            padding: 20,
          }}
        >
          <View
            style={{
              backgroundColor: isDark ? '#18181C' : '#FFFFFF',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 12,
              }}
            >
              <Text
                style={{
                  color: isDark ? '#FFFFFF' : '#1A1A1A',
                  fontSize: 18,
                  fontFamily: 'PlusJakartaSans_700Bold',
                }}
              >
                Import JSON Backup
              </Text>
              <Pressable onPress={() => setShowImportModal(false)} hitSlop={12}>
                <X size={20} color={isDark ? '#FFFFFF' : '#1A1A1A'} />
              </Pressable>
            </View>

            <TextInput
              value={importJsonText}
              onChangeText={setImportJsonText}
              placeholder='Paste exported {"habits": [...], "logs": [...]} JSON here'
              placeholderTextColor={
                isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)'
              }
              multiline
              style={{
                height: 150,
                textAlignVertical: 'top',
                color: isDark ? '#FFFFFF' : '#1A1A1A',
                fontSize: 12,
                fontFamily: 'PlusJakartaSans_400Regular',
                backgroundColor: isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.05)',
                borderRadius: 12,
                padding: 12,
                borderWidth: 1,
                borderColor: isDark
                  ? 'rgba(255,255,255,0.12)'
                  : 'rgba(0,0,0,0.10)',
                marginBottom: 14,
              }}
            />

            <Pressable
              onPress={handleConfirmImportJson}
              style={({ pressed }) => ({
                backgroundColor: '#F6955D',
                borderRadius: 12,
                paddingVertical: 12,
                alignItems: 'center',
                opacity: pressed ? 0.85 : 1,
              })}
            >
              <Text
                style={{
                  color: '#FFFFFF',
                  fontSize: 14,
                  fontFamily: 'PlusJakartaSans_700Bold',
                }}
              >
                Restore Backup
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
