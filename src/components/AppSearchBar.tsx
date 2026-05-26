import { forwardRef, useImperativeHandle, useRef } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from 'react-native';
import { AppIcon } from '@/src/components/AppIcon';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export interface AppSearchBarProps extends Omit<TextInputProps, 'role' | 'style'> {
  value: string;
  onChangeText: (text: string) => void;
  onSearch?: () => void;
  onClear?: () => void;
  loading?: boolean;
  role?: RoleThemeKey;
  /** Removes outer margins when nested in a screen header. */
  embedded?: boolean;
}

export type AppSearchBarHandle = {
  focus: () => void;
};

export const AppSearchBar = forwardRef<AppSearchBarHandle, AppSearchBarProps>(function AppSearchBar(
  {
    value,
    onChangeText,
    onSearch,
    onClear,
    loading = false,
    role = 'admin',
    placeholder = 'Search...',
    embedded = false,
    ...textInputProps
  },
  ref
) {
  const { colors } = useAppTheme();
  const roleTheme = getRoleTheme(role);
  const inputRef = useRef<TextInput>(null);

  useImperativeHandle(ref, () => ({
    focus: () => inputRef.current?.focus(),
  }));

  const handleSubmit = () => {
    onSearch?.();
    inputRef.current?.blur();
  };

  const handleClear = () => {
    onChangeText('');
    onClear?.();
    inputRef.current?.focus();
  };

  const showClear = value.length > 0 && !loading;

  return (
    <View
      style={[
        styles.wrap,
        embedded && styles.wrapEmbedded,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
        },
      ]}
    >
      <AppIcon name="Search" size={18} color={colors.textMuted} />
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        selectionColor={roleTheme.primary}
        returnKeyType="search"
        enablesReturnKeyAutomatically
        onSubmitEditing={handleSubmit}
        style={[styles.input, { color: colors.typographyColor }]}
        accessibilityLabel={placeholder}
        {...textInputProps}
      />
      {showClear ? (
        <Pressable
          onPress={handleClear}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Clear search"
          style={({ pressed }) => [styles.iconBtn, pressed && styles.iconBtnPressed]}
        >
          <AppIcon name="X" size={18} color={colors.textMuted} />
        </Pressable>
      ) : null}
      <Pressable
        onPress={handleSubmit}
        disabled={loading}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel="Search"
        style={({ pressed }) => [
          styles.searchBtn,
          { backgroundColor: roleTheme.primary },
          pressed && !loading && styles.searchBtnPressed,
          loading && styles.searchBtnDisabled,
        ]}
      >
        {loading ? (
          <ActivityIndicator size="small" color={theme.colors.textInverse} />
        ) : (
          <AppIcon name="Search" size={16} color={theme.colors.textInverse} />
        )}
      </Pressable>
    </View>
  );
});

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    paddingLeft: theme.spacing.md,
    paddingRight: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    ...theme.shadows.control,
  },
  wrapEmbedded: {
    marginHorizontal: 0,
    marginBottom: 0,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: theme.spacing.sm,
    minHeight: 40,
  },
  iconBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBtnPressed: {
    opacity: 0.6,
  },
  searchBtn: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.control,
  },
  searchBtnPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  searchBtnDisabled: {
    opacity: 0.7,
  },
});
