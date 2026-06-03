import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { getLast16Weeks } from '../utils/dateUtils';
import { Typography } from '../theme/typography';

interface HeatmapGridProps {
  completedDates: Set<string>;
  onDayPress?: (date: string) => void;
  color?: string;
}

const DAY_SIZE = 13;
const DAY_GAP = 3;
const WEEK_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HeatmapGrid({ completedDates, onDayPress, color }: HeatmapGridProps) {
  const { colors, isDark } = useTheme();
  const accentColor = color ?? colors.accent;
  const weeks = getLast16Weeks();
  const today = new Date().toISOString().split('T')[0];

  const getCellStyle = (date: string) => {
    if (date > today) {
      return {
        backgroundColor: 'transparent',
        opacity: 0,
      };
    }

    if (completedDates.has(date)) {
      return {
        backgroundColor: accentColor,
        opacity: 1,
      };
    }

    // Past, not completed
    return {
      backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
      opacity: 1,
    };
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: DAY_GAP }}>
        {/* Day labels */}
        <View style={{ gap: DAY_GAP, width: 12 }}>
          {WEEK_LABELS.map((d, i) => (
            <Text
              key={i}
              style={{
                color: colors.textFaint,
                fontSize: 8,
                width: 12,
                height: DAY_SIZE,
                lineHeight: DAY_SIZE,
                textAlign: 'center',
                fontFamily: Typography.fontFamily.semiBold,
              }}
            >
              {i % 2 === 1 ? d : ''}
            </Text>
          ))}
        </View>

        {/* Week columns */}
        {weeks.map((week, wi) => (
          <View key={wi} style={{ gap: DAY_GAP }}>
            {week.map((date) => {
              const cellStyle = getCellStyle(date);
              return (
                <Pressable
                  key={date}
                  onPress={() => onDayPress?.(date)}
                  style={{
                    width: DAY_SIZE,
                    height: DAY_SIZE,
                    borderRadius: 3,
                    backgroundColor: cellStyle.backgroundColor,
                    opacity: cellStyle.opacity,
                  }}
                />
              );
            })}
          </View>
        ))}
      </View>
    </View>
  );
}
