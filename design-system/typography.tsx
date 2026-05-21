import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors } from './tokens';

export type TextVariant = 'h1' | 'h2' | 'body' | 'caption';
const FONT_FAMILY = 'System';

const variantStyles: Record<TextVariant, TextStyle> = {
  h1: {
    fontFamily: FONT_FAMILY,
    fontSize: 28,
    lineHeight: 38,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  h2: {
    fontFamily: FONT_FAMILY,
    fontSize: 20,
    lineHeight: 30,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  body: {
    fontFamily: FONT_FAMILY,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
    color: colors.textPrimary,
  },
  caption: {
    fontFamily: FONT_FAMILY,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    color: colors.textMuted,
  },
};

type AppTextProps = TextProps & {
  variant?: TextVariant;
  muted?: boolean;
};

export function AppText({ variant = 'body', muted = false, style, ...props }: AppTextProps) {
  return (
    <RNText
      {...props}
      style={[
        variantStyles[variant],
        muted && { color: colors.textMuted },
        style,
      ]}
    />
  );
}

export const H1 = (props: Omit<AppTextProps, 'variant'>) => <AppText {...props} variant="h1" />;
export const H2 = (props: Omit<AppTextProps, 'variant'>) => <AppText {...props} variant="h2" />;
export const Body = (props: Omit<AppTextProps, 'variant'>) => <AppText {...props} variant="body" />;
export const Caption = (props: Omit<AppTextProps, 'variant'>) => <AppText {...props} variant="caption" />;

export const typography = variantStyles;
