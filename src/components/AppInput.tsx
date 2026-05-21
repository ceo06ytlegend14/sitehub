import { forwardRef } from 'react';
import { StyleSheet, TextInput, TextInputProps, View } from 'react-native';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

interface AppInputProps extends TextInputProps {
  label?: string;
}

export const AppInput = forwardRef<TextInput, AppInputProps>(function AppInput(
  { label, style, ...props },
  ref
) {
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
        style={[styles.input, style]}
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
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    fontFamily: theme.typography.fontFamilyRegular,
  },
});

