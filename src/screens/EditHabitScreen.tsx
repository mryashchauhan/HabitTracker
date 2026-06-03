import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  X,
  Check,
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
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'EditHabit'>;

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

export function EditHabitScreen({ route, navigation }: Props) {
  const { habitId } = route.params;
  const { colors, isDark } = useTheme();
  const { habits, updateHabit } = useHabits();

  const habit = useMemo(() => habits.find((h) => h.id === habitId), [habits, habitId]);

  const [name, setName] = useState(habit?.name ?? '');
  const [icon, setIcon] = useState(habit?.icon ?? '🎯');
  const [category, setCategory] = useState<Category>(habit?.category ?? 'health');
  const [notes, setNotes] = useState(habit?.notes ?? '');

  const activeColor = CATEGORY_COLORS[category] ?? colors.accent;

  if (!habit) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center', alignItems: 'center' }} edges={['top']}>
        <Text style={{ color: colors.textMuted }}>Habit not found</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 16 }}>
          <Text style={{ color: colors.accent, fontFamily: Typography.fontFamily.semiBold }}>← Go Back</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  const handleSave = () => {
    updateHabit({
      ...habit,
      name: name.trim(),
      icon,
      color: activeColor,
      category,
      notes: notes.trim() || undefined,
    });
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top', 'bottom']}>
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
          Edit Habit
        </Text>

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
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 60 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Preview icon large */}
        <View style={{ alignItems: 'center', paddingTop: 24, marginBottom: 4 }}>
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: `${activeColor}20`,
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 2,
              borderColor: `${activeColor}40`,
            }}
          >
            <Text style={{ fontSize: 36 }}>{icon}</Text>
          </View>
          <Text
            style={{
              color: colors.textPrimary,
              fontSize: Typography.size.sectionHeading,
              fontFamily: Typography.fontFamily.display,
              marginTop: 12,
            }}
          >
            {name || 'Your Habit'}
          </Text>
        </View>

        {/* Name */}
        <Text style={labelStyle}>Name</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Habit name..."
          placeholderTextColor={colors.textFaint}
          style={inputStyle}
        />

        {/* Category */}
        <Text style={labelStyle}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
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
                  borderColor: isActive
                    ? `${catColor}60`
                    : isDark
                    ? 'rgba(255,255,255,0.08)'
                    : 'rgba(0,0,0,0.08)',
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
                borderColor: icon === ic
                  ? `${activeColor}60`
                  : isDark
                  ? 'rgba(255,255,255,0.08)'
                  : 'rgba(0,0,0,0.08)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 24 }}>{ic}</Text>
            </Pressable>
          ))}
        </View>

        {/* Notes */}
        <Text style={labelStyle}>Motivation (optional)</Text>
        <TextInput
          value={notes}
          onChangeText={setNotes}
          placeholder="Why does this habit matter to you?"
          placeholderTextColor={colors.textFaint}
          style={[inputStyle, { minHeight: 80, textAlignVertical: 'top' }]}
          multiline
        />

        {/* Save button */}
        <Pressable
          onPress={handleSave}
          disabled={!name.trim()}
          style={({ pressed }) => ({
            marginTop: 28,
            backgroundColor: name.trim() ? activeColor : isDark ? colors.surfaceElevated : '#d0d0d0',
            borderRadius: 999,
            paddingVertical: 16,
            alignItems: 'center',
            opacity: pressed ? 0.85 : 1,
            shadowColor: activeColor,
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: name.trim() ? 0.35 : 0,
            shadowRadius: 12,
            elevation: name.trim() ? 6 : 0,
          })}
        >
          <Text
            style={{
              color: '#111111',
              fontSize: Typography.size.body,
              fontFamily: Typography.fontFamily.semiBold,
            }}
          >
            Save Changes ✓
          </Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
