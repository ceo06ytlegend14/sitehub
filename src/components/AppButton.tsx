import { ActivityIndicator, Pressable, PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface AppButtonProps extends Omit<PressableProps, 'style'> {
  label: string;
  loading?: boolean;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}

const variantStyles: Record<ButtonVariant, ViewStyle> = {
  primary: {
    backgroundColor: theme.colors.primary,
  },
  secondary: {
    backgroundColor: theme.colors.secondary,
  },
  ghost: {
    backgroundColor: '#FFFFFF',
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
};

export function AppButton({
  label,
  loading = false,
  variant = 'primary',
  fullWidth = true,
  disabled,
  style,
  ...rest
}: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        variantStyles[variant],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'ghost' ? theme.colors.primary : '#FFFFFF'} />
      ) : (
        <AppText variant="body" tone={variant === 'ghost' ? 'primary' : 'inverse'} style={styles.label}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 56,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  fullWidth: {
    width: '100%',
  },
  label: {
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  pressed: {
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.6,
  },
});
