import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

interface AppCardProps {
  role?: RoleThemeKey;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ children, role = 'default', style }: PropsWithChildren<AppCardProps>) {
  const roleTheme = getRoleTheme(role);
  return <View style={[styles.card, { backgroundColor: roleTheme.surface }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
});
