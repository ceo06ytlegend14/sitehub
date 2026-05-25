import { forwardRef } from 'react';
import { StyleProp, StyleSheet, TextInput, TextInputProps, TextStyle, View } from 'react-native';
import { AppText } from '@/src/components/AppText';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

interface AppInputProps extends Omit<TextInputProps, 'style' | 'role'> {
  label?: string;
  role?: RoleThemeKey;
  style?: StyleProp<TextStyle>;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, role = 'default', style, ...props },
  ref
) {
  const roleTheme = getRoleTheme(role);
  return (
    <View style={styles.container}>
      {label ? (
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        ref={ref}
        placeholderTextColor={theme.colors.textMuted}
        selectionColor={roleTheme.primary}
        style={[styles.input, { backgroundColor: roleTheme.soft }, style]}
        {...props}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.xs,
  },
  input: {
    height: 52,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    paddingHorizontal: theme.spacing.md,
    ...theme.typography.variants.body,
  },
});
