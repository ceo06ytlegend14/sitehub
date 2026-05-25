import { PropsWithChildren } from 'react';
import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

interface AppCardProps {
  role?: RoleThemeKey;
  style?: StyleProp<ViewStyle>;
}

export function AppCard({ children, role = 'default', style }: PropsWithChildren<AppCardProps>) {
  const { colors } = usePreferences();
  const roleTheme = getRoleTheme(role);
  const backgroundColor = role === 'admin' ? roleTheme.surface : colors.surface;
  const borderColor = role === 'admin' ? theme.colors.border : colors.border;
  return <View style={[styles.card, { backgroundColor, borderColor }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
});
