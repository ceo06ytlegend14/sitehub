import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppText } from '@/src/components/AppText';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'role';

interface AppBadgeProps {
  label?: string;
  tone?: BadgeTone;
  role?: RoleThemeKey;
  style?: StyleProp<ViewStyle>;
}

function resolveColors(tone: BadgeTone, role?: RoleThemeKey) {
  if (tone === 'role') {
    const roleTheme = getRoleTheme(role);
    return { backgroundColor: roleTheme.soft, color: roleTheme.primary };
  }

  const color = theme.status[tone];
  return {
    backgroundColor: tone === 'pending' ? theme.colors.surfaceSoft : `${color}18`,
    color,
  };
}

export function AppBadge({
  label,
  tone = 'info',
  role,
  style,
  children,
}: PropsWithChildren<AppBadgeProps>) {
  const colors = resolveColors(tone, role);

  return (
    <View style={[styles.badge, { backgroundColor: colors.backgroundColor }, style]}>
      <AppText variant="caption" weight="bold" style={[styles.label, { color: colors.color }]}>
        {label ?? children}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 5,
  },
  label: {
    textTransform: 'capitalize',
  },
});
