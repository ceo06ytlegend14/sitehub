import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'disabled';

interface AppButtonProps extends Omit<PressableProps, 'style' | 'role'> {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  iconName?: AppIconName;
  iconPosition?: 'left' | 'right';
  role?: RoleThemeKey;
  style?: StyleProp<ViewStyle>;
}

const labelTone: Record<ButtonVariant, 'primary' | 'inverse'> = {
  primary: 'inverse',
  secondary: 'inverse',
  outline: 'primary',
  ghost: 'primary',
  disabled: 'primary',
};

export function AppButton({
  label,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  iconName,
  iconPosition = 'left',
  role = 'default',
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading || variant === 'disabled';
  const resolvedVariant = isDisabled && !loading ? 'disabled' : variant;
  const roleTheme = getRoleTheme(role);
  const variantStyle: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: roleTheme.primary,
    },
    secondary: {
      backgroundColor: roleTheme.primaryDark,
    },
    outline: {
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
    },
    ghost: {
      backgroundColor: roleTheme.soft,
    },
    disabled: {
      backgroundColor: theme.colors.surfaceSoft,
    },
  };
  const iconColor =
    labelTone[resolvedVariant] === 'inverse'
      ? theme.colors.textInverse
      : roleTheme.primary;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyle[resolvedVariant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={[styles.content, iconPosition === 'right' && styles.contentReverse]}>
          {iconName ? <AppIcon name={iconName} size={20} color={iconColor} /> : null}
          <AppText variant="body" tone={labelTone[resolvedVariant]} weight="semibold">
            {label}
          </AppText>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
  },
  contentReverse: {
    flexDirection: 'row-reverse',
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
