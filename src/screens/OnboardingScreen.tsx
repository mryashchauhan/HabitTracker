import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import Animated, { FadeIn, FadeInDown, SlideInRight } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import {
  ChartLineUp,
  Flame,
  CalendarCheck,
  ArrowRight,
  Check,
  Plus,
  HeartStraight,
  Barbell,
  BookOpen,
  Moon,
  Brain,
  Star,
} from 'phosphor-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../theme/ThemeContext';
import { useHabits } from '../context/HabitContext';
import { Typography } from '../theme/typography';
import { Spacing, Radius } from '../theme/spacing';
import { Category } from '../types';
import { SUGGESTED_HABITS } from '../data/mockData';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const { width } = Dimensions.get('window');

const GOALS: {
  id: Category | 'general';
  label: string;
  Icon: React.ElementType;
  desc: string;
  color: string;
}[] = [
  { id: 'health', label: 'Health', Icon: HeartStraight, desc: 'Nutrition, hydration, wellness', color: '#b0f1e6' },
  { id: 'fitness', label: 'Fitness', Icon: Barbell, desc: 'Exercise, movement, strength', color: '#ff7043' },
  { id: 'study', label: 'Study', Icon: BookOpen, desc: 'Learning, focus, knowledge', color: '#72d7f0' },
  { id: 'sleep', label: 'Sleep', Icon: Moon, desc: 'Rest, recovery, routine', color: '#7c6aff' },
  { id: 'mindfulness', label: 'Mind', Icon: Brain, desc: 'Calm, gratitude, presence', color: '#4fd1a5' },
  { id: 'general', label: 'Custom', Icon: Star, desc: 'Define your own focus', color: '#9e9e9e' },
];

const FEATURES = [
  { Icon: ChartLineUp, text: 'Visual progress across all your habits' },
  { Icon: Flame, text: 'Streaks that reward your consistency' },
  { Icon: CalendarCheck, text: 'Retroactive logging for missed days' },
];

export function OnboardingScreen({ navigation }: Props) {
  const { colors, isDark } = useTheme();
  const { addHabit } = useHabits();
  const [step, setStep] = useState(0);
  const [selectedGoals, setSelectedGoals] = useState<Set<string>>(new Set());
  const [selectedSuggestions, setSelectedSuggestions] = useState<Set<number>>(new Set());

  const toggleGoal = (id: string) =>
    setSelectedGoals((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const toggleSuggestion = (idx: number) =>
    setSelectedSuggestions((prev) => {
      const next = new Set(prev);
      next.has(idx) ? next.delete(idx) : next.add(idx);
      return next;
    });

  const handleFinish = () => {
    selectedSuggestions.forEach((idx) => {
      const s = SUGGESTED_HABITS[idx];
      addHabit({
        name: s.name,
        icon: s.icon,
        color: s.color,
        category: s.category,
        type: 'boolean',
        frequency: { type: 'daily' },
        isPinned: false,
        isArchived: false,
      });
    });
    navigation.replace('MainTabs');
  };

  const advance = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    setStep((s) => s + 1);
  };

  const STEPS = ['Welcome', 'Focus', 'Habits'];

  return (
    <LinearGradient
      colors={['#111111', '#1a1a2e', '#111111']}
      style={{ flex: 1 }}
    >
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'bottom']}>
        {/* Progress dots */}
        <View style={{ flexDirection: 'row', gap: 6, marginTop: 16, alignSelf: 'center' }}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={{
                height: 4,
                width: i === step ? 28 : 12,
                borderRadius: 2,
                backgroundColor: i === step ? colors.accent : 'rgba(255,255,255,0.12)',
              }}
            />
          ))}
        </View>

        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 28,
            paddingBottom: 32,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >

          {/* ── STEP 0: Welcome ── */}
          {step === 0 && (
            <Animated.View entering={FadeIn.duration(400)} style={{ flex: 1, alignItems: 'center' }}>
              {/* Lottie hero */}
              <View style={{ width: 220, height: 220, marginBottom: 8 }}>
                <LottieView
                  source={require('../../assets/animations/onboarding-hero.json')}
                  autoPlay
                  loop
                  style={{ width: 220, height: 220 }}
                />
              </View>

              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 34,
                  fontFamily: Typography.fontFamily.display,
                  textAlign: 'center',
                  lineHeight: 40,
                  marginBottom: 14,
                  maxWidth: 320,
                }}
              >
                Build habits that actually stick.
              </Text>

              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.regular,
                  textAlign: 'center',
                  lineHeight: 24,
                  marginBottom: 32,
                  maxWidth: 280,
                }}
              >
                Track daily habits, celebrate consistency, and build momentum — one day at a time.
              </Text>

              {/* Feature rows */}
              <View style={{ gap: 10, width: '100%', maxWidth: 360, marginBottom: 40 }}>
                {FEATURES.map((f, i) => (
                  <Animated.View
                    key={i}
                    entering={FadeInDown.delay(i * 100 + 200).springify()}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        gap: 14,
                        alignItems: 'center',
                        backgroundColor: 'rgba(255,255,255,0.05)',
                        borderRadius: 14,
                        padding: 14,
                        borderWidth: 1,
                        borderColor: 'rgba(255,255,255,0.06)',
                      }}
                    >
                      <View
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 18,
                          backgroundColor: `${colors.accent}20`,
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        <f.Icon size={18} color={colors.accent} weight="bold" />
                      </View>
                      <Text
                        style={{
                          color: colors.textSecondary,
                          fontSize: Typography.size.body,
                          fontFamily: Typography.fontFamily.medium,
                          flex: 1,
                        }}
                      >
                        {f.text}
                      </Text>
                    </View>
                  </Animated.View>
                ))}
              </View>

              {/* CTA */}
              <Pressable
                onPress={advance}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: 999,
                  paddingVertical: 16,
                  paddingHorizontal: 56,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 8,
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 8 },
                  shadowOpacity: 0.4,
                  shadowRadius: 16,
                  elevation: 8,
                })}
              >
                <Text
                  style={{
                    color: isDark ? '#111111' : '#ffffff',
                    fontSize: 17,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  Get Started
                </Text>
                <ArrowRight size={18} color={isDark ? '#111111' : '#ffffff'} weight="bold" />
              </Pressable>
            </Animated.View>
          )}

          {/* ── STEP 1: Focus areas ── */}
          {step === 1 && (
            <Animated.View entering={SlideInRight.duration(300)}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 32,
                  fontFamily: Typography.fontFamily.display,
                  marginBottom: 8,
                  lineHeight: 38,
                }}
              >
                What's your focus?
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.regular,
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                Pick the areas you want to improve.
              </Text>

              <View
                style={{
                  flexDirection: 'row',
                  flexWrap: 'wrap',
                  gap: 12,
                  marginBottom: 32,
                }}
              >
                {GOALS.map((g, i) => {
                  const selected = selectedGoals.has(g.id);
                  return (
                    <Animated.View
                      key={g.id}
                      entering={FadeInDown.delay(i * 60).springify()}
                      style={{ width: (width - 48 - 12) / 2 }}
                    >
                      <Pressable
                        onPress={() => {
                          toggleGoal(g.id);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                        style={{
                          backgroundColor: selected
                            ? `${g.color}12`
                            : 'rgba(255,255,255,0.04)',
                          borderRadius: 16,
                          padding: 16,
                          borderWidth: selected ? 2 : 1,
                          borderColor: selected ? `${g.color}60` : 'rgba(255,255,255,0.08)',
                        }}
                      >
                        <View
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                            backgroundColor: `${g.color}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: 10,
                          }}
                        >
                          <g.Icon size={22} color={g.color} weight="bold" />
                        </View>
                        <Text
                          style={{
                            color: colors.textPrimary,
                            fontSize: Typography.size.body,
                            fontFamily: Typography.fontFamily.semiBold,
                            marginBottom: 3,
                          }}
                        >
                          {g.label}
                        </Text>
                        <Text
                          style={{
                            color: colors.textMuted,
                            fontSize: Typography.size.caption,
                            fontFamily: Typography.fontFamily.regular,
                          }}
                        >
                          {g.desc}
                        </Text>
                        {selected && (
                          <View
                            style={{
                              position: 'absolute',
                              top: 10,
                              right: 10,
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: g.color,
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Check size={12} color="#111111" weight="bold" />
                          </View>
                        )}
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              <Pressable
                onPress={advance}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                })}
              >
                <Text
                  style={{
                    color: isDark ? '#111111' : '#ffffff',
                    fontSize: Typography.size.body,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  Continue →
                </Text>
              </Pressable>
            </Animated.View>
          )}

          {/* ── STEP 2: Habit suggestions ── */}
          {step === 2 && (
            <Animated.View entering={SlideInRight.duration(300)}>
              <Text
                style={{
                  color: colors.textPrimary,
                  fontSize: 32,
                  fontFamily: Typography.fontFamily.display,
                  marginBottom: 8,
                  lineHeight: 38,
                }}
              >
                Start with 3 habits.
              </Text>
              <Text
                style={{
                  color: colors.textMuted,
                  fontSize: Typography.size.body,
                  fontFamily: Typography.fontFamily.regular,
                  marginBottom: 24,
                  lineHeight: 22,
                }}
              >
                Small wins add up. Add more any time.
              </Text>

              <View style={{ gap: 10, marginBottom: 28 }}>
                {SUGGESTED_HABITS.map((s, i) => {
                  const selected = selectedSuggestions.has(i);
                  // Look up the category color
                  const catColorMap: Record<string, string> = {
                    fitness: '#ff7043',
                    health: '#b0f1e6',
                    study: '#72d7f0',
                    sleep: '#7c6aff',
                    mindfulness: '#4fd1a5',
                    custom: '#9e9e9e',
                  };
                  const catColor = catColorMap[s.category] ?? colors.accent;
                  return (
                    <Animated.View
                      key={i}
                      entering={FadeInDown.delay(i * 60).springify()}
                    >
                      <Pressable
                        onPress={() => {
                          toggleSuggestion(i);
                          if (Platform.OS !== 'web') {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                          }
                        }}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 14,
                          backgroundColor: selected
                            ? `${catColor}10`
                            : 'rgba(255,255,255,0.04)',
                          borderRadius: 16,
                          padding: 14,
                          borderWidth: selected ? 1.5 : 1,
                          borderColor: selected
                            ? `${catColor}50`
                            : 'rgba(255,255,255,0.07)',
                        }}
                      >
                        <View
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 22,
                            backgroundColor: `${catColor}20`,
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Text style={{ fontSize: 22 }}>{s.icon}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              color: colors.textPrimary,
                              fontSize: Typography.size.body,
                              fontFamily: Typography.fontFamily.semiBold,
                            }}
                          >
                            {s.name}
                          </Text>
                          <View
                            style={{
                              backgroundColor: `${catColor}20`,
                              borderRadius: 4,
                              paddingHorizontal: 6,
                              paddingVertical: 2,
                              alignSelf: 'flex-start',
                              marginTop: 3,
                            }}
                          >
                            <Text
                              style={{
                                color: catColor,
                                fontSize: Typography.size.caption,
                                fontFamily: Typography.fontFamily.semiBold,
                                textTransform: 'uppercase',
                                letterSpacing: 0.5,
                              }}
                            >
                              {s.category}
                            </Text>
                          </View>
                        </View>
                        <View
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: selected ? catColor : 'rgba(255,255,255,0.06)',
                            borderWidth: selected ? 0 : 1,
                            borderColor: 'rgba(255,255,255,0.12)',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {selected ? (
                            <Check size={14} color="#111111" weight="bold" />
                          ) : (
                            <Plus size={14} color={colors.textMuted} weight="bold" />
                          )}
                        </View>
                      </Pressable>
                    </Animated.View>
                  );
                })}
              </View>

              {/* Buttons */}
              <Pressable
                onPress={handleFinish}
                style={({ pressed }) => ({
                  backgroundColor: colors.accent,
                  borderRadius: 999,
                  paddingVertical: 16,
                  alignItems: 'center',
                  opacity: pressed ? 0.85 : 1,
                  shadowColor: colors.accent,
                  shadowOffset: { width: 0, height: 6 },
                  shadowOpacity: 0.35,
                  shadowRadius: 12,
                  elevation: 6,
                  marginBottom: 12,
                })}
              >
                <Text
                  style={{
                    color: isDark ? '#111111' : '#ffffff',
                    fontSize: Typography.size.body,
                    fontFamily: Typography.fontFamily.semiBold,
                  }}
                >
                  {selectedSuggestions.size > 0
                    ? `Add ${selectedSuggestions.size} habit${selectedSuggestions.size > 1 ? 's' : ''} & Start →`
                    : 'Skip & Start →'}
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setStep(1)}
                style={{ alignItems: 'center', paddingVertical: 12 }}
              >
                <Text
                  style={{
                    color: colors.textMuted,
                    fontSize: Typography.size.small,
                    fontFamily: Typography.fontFamily.medium,
                  }}
                >
                  ← Back
                </Text>
              </Pressable>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}
