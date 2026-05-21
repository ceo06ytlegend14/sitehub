import React from 'react';
import { LucideIcon } from 'lucide-react-native';
import { colors, icon as iconTokens } from './tokens';

type AppIconProps = {
  icon: LucideIcon;
  size?: number;
  color?: string;
  strokeWidth?: number;
};

export function AppIcon({
  icon: Icon,
  size = iconTokens.size,
  color = colors.textPrimary,
  strokeWidth = iconTokens.strokeWidth,
}: AppIconProps) {
  return <Icon size={size} color={color} strokeWidth={strokeWidth} />;
}
