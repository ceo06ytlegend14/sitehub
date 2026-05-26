import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { router } from 'expo-router';
import { AppAvatar } from '@/src/components/AppAvatar';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  role?: RoleThemeKey;
  showBack?: boolean;
  onBackPress?: () => void;
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
  onBackPress,
  actionIcon,
  onActionPress,
  avatarName,
  style,
}: AppHeaderProps) {
  const { colors } = usePreferences();
  const roleTheme = getRoleTheme(role);
  const backgroundColor = colors.background;
  const titleColor = colors.typographyColor;
  const subtitleColor = colors.textMuted;
  const iconButtonStyle = {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  };

  return (
    <View style={[styles.header, { backgroundColor }, style]}>
      {showBack ? (
        <Pressable style={[styles.iconButton, iconButtonStyle]} onPress={onBackPress ?? (() => router.back())} hitSlop={12}>
          <AppIcon name="ChevronLeft" size={22} color={colors.primary} />
        </Pressable>
      ) : null}

      <View style={styles.copy}>
        {subtitle ? (
          <AppText variant="caption" weight="medium" style={{ color: subtitleColor }}>
            {subtitle}
          </AppText>
        ) : null}
        <AppText variant="h1" weight="bold" style={[styles.title, { color: titleColor }]} numberOfLines={1}>
          {title}
        </AppText>
      </View>

      {actionIcon && onActionPress ? (
        <Pressable style={[styles.iconButton, iconButtonStyle]} onPress={onActionPress} hitSlop={12}>
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
    paddingBottom: theme.spacing.sm,
  },
  copy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    ...theme.shadows.control,
  },
  title: {
    letterSpacing: 0,
  },
});
