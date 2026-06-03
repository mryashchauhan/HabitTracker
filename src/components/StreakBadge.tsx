import React from 'react';
import { View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withSpring,
} from 'react-native-reanimated';
import { Flame } from 'phosphor-react-native';
import { useTheme } from '../theme/ThemeContext';
import { Typography } from '../theme/typography';
import { Radius } from '../theme/spacing';

interface StreakBadgeProps {
  streak: number;
  size?: 'sm' | 'md' | 'lg';
}

export function StreakBadge({ streak, size = 'md' }: StreakBadgeProps) {
  const { colors } = useTheme();

  const iconSize = { sm: 13, md: 16, lg: 20 }[size];
  const textSize = { sm: Typography.size.caption, md: Typography.size.small, lg: Typography.size.body }[size];
  const px = { sm: 7, md: 10, lg: 14 }[size];
  const py = { sm: 3, md: 5, lg: 7 }[size];

  const scale = useSharedValue(1);

  // Gentle pulse when streak > 0
  React.useEffect(() => {
    if (streak > 0) {
      scale.value = withRepeat(
        withSequence(
          withSpring(1.06, { damping: 8, stiffness: 200 }),
          withSpring(1.0, { damping: 8, stiffness: 200 })
        ),
        -1,
        true
      );
    }
  }, [streak]);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animStyle}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 3,
          backgroundColor: `${colors.accentGold}18`,
          borderRadius: Radius.full,
          paddingHorizontal: px,
          paddingVertical: py,
        }}
      >
        <Flame size={iconSize} color={colors.accentGold} weight="fill" />
        <Text
          style={{
            color: colors.accentGold,
            fontSize: textSize,
            fontFamily: Typography.fontFamily.semiBold,
          }}
        >
          {streak}
        </Text>
      </View>
    </Animated.View>
  );
}
