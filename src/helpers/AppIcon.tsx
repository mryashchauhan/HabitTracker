import React from 'react';
import { IconProps } from 'phosphor-react-native';
// Note: In the future redesign, we will map icon names to specific Phosphor icons.
// For now, this is a placeholder wrapper that takes any valid Phosphor Icon component.

export interface AppIconProps extends IconProps {
  IconComponent: React.ElementType;
}

export const AppIcon = ({ IconComponent, size = 24, color, ...rest }: AppIconProps) => {
  return <IconComponent size={size} color={color} {...rest} />;
};
