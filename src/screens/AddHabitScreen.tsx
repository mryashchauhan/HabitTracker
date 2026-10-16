import React, { useState } from 'react';
import { CONTENT_COLUMN } from '../constants/layout';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import {
  X,
  Check,
  CheckSquare,
  Hash,
  Timer,
  SunHorizon,
  CalendarDots,
  Briefcase,
  Repeat,
  Calendar,
  PencilSimple,
  HeartStraight,
  Barbell,
  BookOpen,
  Moon,
  Brain,
  Star,
  ArrowRight,
  Minus,
  Plus,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Category, FrequencyType, HabitType } from '../types';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AddHabit'>;

const ICONS = ['🏃', '💧', '📚', '🧘', '😴', '💪', '✍️', '🥗', '🎯', '🎸', '🧠', '💊', '☀️', '🚴', '🏋️', '🤸', '🧹', '💰', '🌿', '🎨', '🔥', '⚡'];

const CATEGORY_COLORS: Record<string, string> = {
  fitness: '#ff7043',
  health: '#b0f1e6',
  study: '#72d7f0',
  sleep: '#7c6aff',
  mindfulness: '#4fd1a5',
  custom: '#9e9e9e',
};

const CATEGORIES: { id: Category; label: string; Icon: React.ElementType }[] = [
  { id: 'health', label: 'Health', Icon: HeartStraight },
  { id: 'fitness', label: 'Fitness', Icon: Barbell },
  { id: 'study', label: 'Study', Icon: BookOpen },
  { id: 'sleep', label: 'Sleep', Icon: Moon },
  { id: 'mindfulness', label: 'Mind', Icon: Brain },
  { id: 'custom', label: 'Custom', Icon: Star },
];

const FREQ_OPTIONS: { id: FrequencyType; label: string; Icon: React.ElementType }[] = [
  { id: 'daily', label: 'Every day', Icon: CalendarDots },
  { id: 'weekdays', label: 'Weekdays', Icon: Briefcase },
  { id: 'x_per_week', label: 'X times/week', Icon: Repeat },
  { id: 'custom', label: 'Custom days', Icon: Calendar },
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const STEPS = ['Basics', 'Type', 'Schedule', 'Details'];

export function AddHabitScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { addHabit } = useHabits();
  const [step, setStep] = useState(0);

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎯');
  const [color, setColor] = useState('#72d7f0');
  const [category, setCategory] = useState<Category>('health');
  const [type, setType] = useState<HabitType>('boolean');
  const [freqType, setFreqType] = useState<FrequencyType>('daily');
  const [timesPerWeek, setTimesPerWeek] = useState(3);
  const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [targetCount, setTargetCount] = useState(1);
  const [targetMins, setTargetMins] = useState(30);
  const [notes, setNotes] = useState('');
  const [reminderEnabled, setReminderEnabled] = useState(false);
  const [showNotes, setShowNotes] = useState(false);

  const activeColor = CATEGORY_COLORS[category] ?? color;
  const canContinue = step === 0 ? name.trim().length > 0 : true;

  const handleSave = () => {
    addHabit({
      name: name.trim(),
      icon,
      color: activeColor,
      category,
      type,
      frequency: {
        type: freqType,
        timesPerWeek: freqType === 'x_per_week' ? timesPerWeek : undefined,
        customDays: freqType === 'custom' ? customDays : undefined,
      },
      targetCount: type === 'count' ? targetCount : undefined,
      targetDuration: type === 'timed' ? targetMins * 60 : undefined,
      notes: notes.trim() || undefined,
      reminder: reminderEnabled ? { enabled: true, hour: 8, minute: 0 } : undefined,
      isPinned: false,
      isArchived: false,
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    navigation.goBack();
  };

  const inputStyle = {
    backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
    borderRadius: 14,
    padding: 16,
    color: colors.textPrimary,
    fontSize: 17,
    fontFamily: Typography.fontFamily.medium,
    borderWidth: 1,
    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
  };

  const labelStyle = {
    color: colors.textMuted,
    fontSize: Typography.size.label,
    fontFamily: Typography.fontFamily.semiBold,
    letterSpacing: Typography.tracking.section,
    textTransform: 'uppercase' as const,
    marginBottom: 10,
    marginTop: 20,
  };

  const typeOptions = [
    { id: 'boolean' as HabitType, label: 'Yes / No', desc: 'Did you do it?', Icon: CheckSquare },
    { id: 'count' as HabitType, label: 'Count', desc: 'Track repetitions', Icon: Hash },
    { id: 'timed' as HabitType, label: 'Timed', desc: 'Track duration', Icon: Timer },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, ...CONTENT_COLUMN }} edges={['top', 'bottom']}>
      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 20,
          paddingVertical: 14,
          borderBottomWidth: 1,
          borderBottomColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
        }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => ({
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
            alignItems: 'center',
            justifyContent: 'center',
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <X size={18} color={colors.textMuted} weight="bold" />
        </Pressable>

        <Text
          style={{
            flex: 1,
            textAlign: 'center',
            color: colors.textPrimary,
            fontSize: Typography.size.body,
            fontFamily: Typography.fontFamily.semiBold,
          }}
        >
          New Habit
        </Text>

        {step === STEPS.length - 1 ? (
          <Pressable
            onPress={handleSave}
            disabled={!name.trim()}
            style={{ paddingHorizontal: 4 }}
          >
            <Text
              style={{
                color: name.trim() ? colors.accent : colors.textMuted,
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Save
            </Text>
          </Pressable>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {/* Step progress */}
      <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, gap: 4 }}>
        {STEPS.map((_, i) => (
          <View
            key={i}
            style={{
              flex: 1,
              height: 3,
              borderRadius: 2,
              backgroundColor: i <= step ? activeColor : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
            }}
          />
        ))}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text
          style={{
            color: colors.textPrimary,
            fontSize: Typography.size.sectionHeading,
            fontFamily: Typography.fontFamily.display,
            marginTop: 20,
            marginBottom: 4,
          }}
        >
          {STEPS[step]}
        </Text>

        {/* ── STEP 0: Basics ── */}
        {step === 0 && (
          <Animated.View entering={FadeIn.duration(200)}>
            {/* Name input */}
            <Text style={labelStyle}>Habit Name</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Morning Run"
              placeholderTextColor={colors.textFaint}
              style={inputStyle}
              autoFocus
            />

            {/* Category chips */}
            <Text style={labelStyle}>Category</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
              {CATEGORIES.map((cat) => {
                const catColor = CATEGORY_COLORS[cat.id] ?? colors.accent;
                const isActive = category === cat.id;
                return (
                  <Pressable
                    key={cat.id}
                    onPress={() => setCategory(cat.id)}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 14,
                      paddingVertical: 10,
                      borderRadius: 999,
                      backgroundColor: isActive ? `${catColor}20` : isDark ? colors.surfaceElevated : '#f5f4f0',
                      borderWidth: isActive ? 1.5 : 1,
                      borderColor: isActive ? `${catColor}60` : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <cat.Icon size={15} color={isActive ? catColor : colors.textMuted} weight="bold" />
                    <Text
                      style={{
                        color: isActive ? catColor : colors.textMuted,
                        fontSize: Typography.size.small,
                        fontFamily: isActive ? Typography.fontFamily.semiBold : Typography.fontFamily.medium,
                      }}
                    >
                      {cat.label}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>

            {/* Icon picker */}
            <Text style={labelStyle}>Icon</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {ICONS.map((ic) => (
                <Pressable
                  key={ic}
                  onPress={() => setIcon(ic)}
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 12,
                    backgroundColor: icon === ic ? `${activeColor}20` : isDark ? colors.surfaceElevated : '#f5f4f0',
                    borderWidth: icon === ic ? 2 : 1,
                    borderColor: icon === ic ? `${activeColor}60` : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 24 }}>{ic}</Text>
                </Pressable>
              ))}
            </View>
          </Animated.View>
        )}

        {/* ── STEP 1: Type ── */}
        {step === 1 && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text style={labelStyle}>Habit Type</Text>
            {typeOptions.map((t) => (
              <Pressable
                key={t.id}
                onPress={() => setType(t.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor:
                    type === t.id
                      ? `${activeColor}12`
                      : isDark
                      ? colors.card
                      : '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: type === t.id ? 1.5 : 1,
                  borderColor:
                    type === t.id
                      ? `${activeColor}50`
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.04,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 22,
                    backgroundColor: type === t.id ? `${activeColor}25` : isDark ? colors.surfaceElevated : '#f5f4f0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <t.Icon size={22} color={type === t.id ? activeColor : colors.textMuted} weight="bold" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size.body,
                      fontFamily: Typography.fontFamily.semiBold,
                    }}
                  >
                    {t.label}
                  </Text>
                  <Text
                    style={{
                      color: colors.textMuted,
                      fontSize: Typography.size.small,
                      fontFamily: Typography.fontFamily.regular,
                      marginTop: 2,
                    }}
                  >
                    {t.desc}
                  </Text>
                </View>
                {type === t.id && (
                  <View
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: 12,
                      backgroundColor: activeColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={14} color="#111111" weight="bold" />
                  </View>
                )}
              </Pressable>
            ))}
          </Animated.View>
        )}

        {/* ── STEP 2: Schedule ── */}
        {step === 2 && (
          <Animated.View entering={FadeIn.duration(200)}>
            <Text style={labelStyle}>Frequency</Text>
            {FREQ_OPTIONS.map((f) => (
              <Pressable
                key={f.id}
                onPress={() => setFreqType(f.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  backgroundColor:
                    freqType === f.id
                      ? `${activeColor}12`
                      : isDark
                      ? colors.card
                      : '#ffffff',
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 10,
                  borderWidth: freqType === f.id ? 1.5 : 1,
                  borderColor:
                    freqType === f.id
                      ? `${activeColor}50`
                      : isDark
                      ? 'rgba(255,255,255,0.06)'
                      : 'rgba(0,0,0,0.06)',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: isDark ? 0.2 : 0.04,
                  shadowRadius: 6,
                  elevation: 4,
                }}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: freqType === f.id ? `${activeColor}25` : isDark ? colors.surfaceElevated : '#f5f4f0',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <f.Icon size={20} color={freqType === f.id ? activeColor : colors.textMuted} weight="bold" />
                </View>
                <Text
                  style={{
                    flex: 1,
                    color: colors.textPrimary,
                    fontSize: Typography.size.body,
                    fontFamily: Typography.fontFamily.medium,
                  }}
                >
                  {f.label}
                </Text>
                {freqType === f.id && (
                  <View
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      backgroundColor: activeColor,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Check size={12} color="#111111" weight="bold" />
                  </View>
                )}
              </Pressable>
            ))}

            {freqType === 'x_per_week' && (
              <View style={{ marginTop: 8 }}>
                <Text style={labelStyle}>Times per week</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Pressable
                    onPress={() => setTimesPerWeek(Math.max(1, timesPerWeek - 1))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <Minus size={18} color={colors.textSecondary} weight="bold" />
                  </Pressable>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size['2xl'],
                      fontFamily: Typography.fontFamily.semiBold,
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {timesPerWeek}
                  </Text>
                  <Pressable
                    onPress={() => setTimesPerWeek(Math.min(7, timesPerWeek + 1))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${activeColor}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={18} color={activeColor} weight="bold" />
                  </Pressable>
                  <Text style={{ color: colors.textMuted, fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.small }}>
                    days/week
                  </Text>
                </View>
              </View>
            )}

            {freqType === 'custom' && (
              <View style={{ marginTop: 8 }}>
                <Text style={labelStyle}>Select days</Text>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {DAY_NAMES.map((d, i) => {
                    const sel = customDays.includes(i);
                    return (
                      <Pressable
                        key={i}
                        onPress={() =>
                          setCustomDays((prev) =>
                            sel ? prev.filter((x) => x !== i) : [...prev, i]
                          )
                        }
                        style={{
                          flex: 1,
                          height: 42,
                          borderRadius: 10,
                          backgroundColor: sel ? activeColor : isDark ? colors.surfaceElevated : '#f5f4f0',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderWidth: 1,
                          borderColor: sel ? activeColor : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                        }}
                      >
                        <Text
                          style={{
                            color: sel ? '#111111' : colors.textMuted,
                            fontSize: Typography.size.caption,
                            fontFamily: Typography.fontFamily.semiBold,
                          }}
                        >
                          {d}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            )}
          </Animated.View>
        )}

        {/* ── STEP 3: Details ── */}
        {step === 3 && (
          <Animated.View entering={FadeIn.duration(200)}>
            {type === 'count' && (
              <>
                <Text style={labelStyle}>Daily Target</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Pressable
                    onPress={() => setTargetCount(Math.max(1, targetCount - 1))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <Minus size={18} color={colors.textSecondary} weight="bold" />
                  </Pressable>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size['2xl'],
                      fontFamily: Typography.fontFamily.semiBold,
                      minWidth: 48,
                      textAlign: 'center',
                    }}
                  >
                    {targetCount}
                  </Text>
                  <Pressable
                    onPress={() => setTargetCount(targetCount + 1)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${activeColor}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={18} color={activeColor} weight="bold" />
                  </Pressable>
                  <Text style={{ color: colors.textMuted, fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.small }}>
                    times
                  </Text>
                </View>
              </>
            )}

            {type === 'timed' && (
              <>
                <Text style={labelStyle}>Duration Target (minutes)</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Pressable
                    onPress={() => setTargetMins(Math.max(5, targetMins - 5))}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: isDark ? colors.surfaceElevated : '#f5f4f0',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1,
                      borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                    }}
                  >
                    <Minus size={18} color={colors.textSecondary} weight="bold" />
                  </Pressable>
                  <Text
                    style={{
                      color: colors.textPrimary,
                      fontSize: Typography.size['2xl'],
                      fontFamily: Typography.fontFamily.semiBold,
                      minWidth: 48,
                      textAlign: 'center',
                    }}
                  >
                    {targetMins}
                  </Text>
                  <Pressable
                    onPress={() => setTargetMins(targetMins + 5)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 22,
                      backgroundColor: `${activeColor}20`,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Plus size={18} color={activeColor} weight="bold" />
                  </Pressable>
                  <Text style={{ color: colors.textMuted, fontFamily: Typography.fontFamily.medium, fontSize: Typography.size.small }}>
                    min
                  </Text>
                </View>
              </>
            )}

            {/* Notes field */}
            <Text style={labelStyle}>Notes (optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Why does this matter to you?"
              placeholderTextColor={colors.textFaint}
              style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
              multiline
            />

            {/* Reminder toggle */}
            <Pressable
              onPress={() => setReminderEnabled(!reminderEnabled)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 14,
                marginTop: 16,
                padding: 16,
                backgroundColor: colors.card,
                borderRadius: 16,
                borderWidth: reminderEnabled ? 1.5 : 1,
                borderColor: reminderEnabled
                  ? `${activeColor}50`
                  : isDark
                  ? 'rgba(255,255,255,0.06)'
                  : 'rgba(0,0,0,0.06)',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: isDark ? 0.2 : 0.04,
                shadowRadius: 6,
                elevation: 4,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: reminderEnabled ? `${activeColor}20` : isDark ? colors.surfaceElevated : '#f5f4f0',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <SunHorizon
                  size={20}
                  color={reminderEnabled ? activeColor : colors.textMuted}
                  weight="bold"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: colors.textPrimary,
                    fontSize: Typography.size.body,
                    fontFamily: Typography.fontFamily.medium,
                  }}
                >
                  Daily Reminder
                </Text>
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.regular,
                    marginTop: 2,
                  }}
                >
                  Tap to {reminderEnabled ? 'disable' : 'enable'} at 8:00 AM
                </Text>
              </View>
              <Switch
                value={reminderEnabled}
                onValueChange={setReminderEnabled}
                trackColor={{
                  false: isDark ? colors.surfaceElevated : '#e0e0e0',
                  true: activeColor,
                }}
                thumbColor="#ffffff"
              />
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>

      {/* Bottom nav */}
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 14,
          gap: 10,
          borderTopWidth: 1,
          borderTopColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)',
          backgroundColor: colors.bg,
        }}
      >
        {step > 0 && (
          <Pressable
            onPress={() => setStep(step - 1)}
            style={({ pressed }) => ({
              flex: 1,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: colors.card,
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text
              style={{
                color: colors.textSecondary,
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Back
            </Text>
          </Pressable>
        )}

        {step < STEPS.length - 1 ? (
          <Pressable
            onPress={() => canContinue && setStep(step + 1)}
            style={({ pressed }) => ({
              flex: 2,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: canContinue ? activeColor : isDark ? colors.surfaceElevated : '#d0d0d0',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: activeColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: canContinue ? 0.3 : 0,
              shadowRadius: 8,
              elevation: canContinue ? 4 : 0,
            })}
          >
            <Text
              style={{
                color: '#111111',
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Continue →
            </Text>
          </Pressable>
        ) : (
          <Pressable
            onPress={handleSave}
            disabled={!name.trim()}
            style={({ pressed }) => ({
              flex: 2,
              paddingVertical: 14,
              borderRadius: 999,
              backgroundColor: name.trim() ? activeColor : isDark ? colors.surfaceElevated : '#d0d0d0',
              alignItems: 'center',
              opacity: pressed ? 0.85 : 1,
              shadowColor: activeColor,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: name.trim() ? 0.3 : 0,
              shadowRadius: 8,
              elevation: name.trim() ? 4 : 0,
            })}
          >
            <Text
              style={{
                color: '#111111',
                fontSize: Typography.size.body,
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              Save Habit ✓
            </Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}
