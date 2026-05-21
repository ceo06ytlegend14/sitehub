import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, Text, TextProps, TextStyle } from 'react-native';
import { TextVariant, theme } from '@/src/constants/theme';

type TextTone = 'primary' | 'muted' | 'inverse';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  tone?: TextTone;
  style?: StyleProp<TextStyle>;
}

const toneStyles: Record<TextTone, TextStyle> = {
  primary: { color: theme.colors.textPrimary },
  muted: { color: theme.colors.textMuted },
  inverse: { color: '#FFFFFF' },
};

export function AppText({
  children,
  variant = 'body',
  tone = 'primary',
  style,
  ...rest
}: PropsWithChildren<AppTextProps>) {
  return (
    <Text style={[styles.base, theme.typography.variants[variant], toneStyles[tone], style]} {...rest}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  base: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
});

