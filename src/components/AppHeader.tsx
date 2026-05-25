import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { AppAvatar } from '@/src/components/AppAvatar';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  role?: RoleThemeKey;
  showBack?: boolean;
  actionIcon?: AppIconName;
  onActionPress?: () => void;
  avatarName?: string;
  style?: StyleProp<ViewStyle>;
}

export function AppHeader({
  title,
  subtitle,
  role = 'default',
  showBack = false,
  actionIcon,
  onActionPress,
  avatarName,
  style,
}: AppHeaderProps) {
  const roleTheme = getRoleTheme(role);

  return (
    <View style={[styles.header, { backgroundColor: roleTheme.background }, style]}>
      {showBack ? (
        <Pressable style={styles.iconButton} onPress={() => router.back()} hitSlop={12}>
          <AppIcon name="ChevronLeft" color={roleTheme.primary} />
        </Pressable>
      ) : null}

      <View style={styles.copy}>
        {subtitle ? (
          <AppText variant="caption" weight="bold" style={{ color: roleTheme.primary }}>
            {subtitle}
          </AppText>
        ) : null}
        <AppText variant="h1" weight="bold" style={{ color: roleTheme.text }} numberOfLines={1}>
          {title}
        </AppText>
      </View>

      {actionIcon && onActionPress ? (
        <Pressable style={styles.iconButton} onPress={onActionPress} hitSlop={12}>
          <AppIcon name={actionIcon} color={roleTheme.primary} />
        </Pressable>
      ) : avatarName ? (
        <AppAvatar name={avatarName} role={role} size={44} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    ...theme.shadows.card,
  },
});
