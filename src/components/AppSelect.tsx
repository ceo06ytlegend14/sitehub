import { type ReactNode, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

export interface AppSelectOption<T extends string = string> {
  label: string;
  value: T;
  hint?: string;
  leading?: ReactNode;
}

interface AppSelectProps<T extends string = string> {
  label: string;
  value: T;
  options: AppSelectOption<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
  description?: string;
}

export function AppSelect<T extends string = string>({
  label,
  value,
  options,
  onChange,
  disabled = false,
  description,
}: AppSelectProps<T>) {
  const { colors } = usePreferences();
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  function handleSelect(next: T) {
    setOpen(false);
    if (next !== value) onChange(next);
  }

  return (
    <>
      <View style={styles.wrap}>
        <AppText variant="caption" tone="muted">
          {label}
        </AppText>
        <Pressable
          disabled={disabled}
          onPress={() => setOpen(true)}
          style={[
            styles.trigger,
            { backgroundColor: colors.surface, borderColor: colors.border },
            disabled && styles.disabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${label}, ${selected?.label ?? value}`}
        >
          <View style={styles.triggerCopy}>
            {selected?.leading ?? null}
            <AppText variant="body" style={styles.triggerLabel}>
              {selected?.label ?? value}
            </AppText>
          </View>
          <AppIcon name="ChevronRight" size={20} color={colors.textMuted} />
        </Pressable>
        {description ? (
          <AppText variant="caption" tone="muted">
            {description}
          </AppText>
        ) : null}
      </View>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <Pressable
            style={[styles.sheet, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <AppText variant="h2">{label}</AppText>
              <Pressable onPress={() => setOpen(false)} hitSlop={12}>
                <AppIcon name="X" size={20} color={colors.textMuted} />
              </Pressable>
            </View>
            <ScrollView style={styles.optionList} keyboardShouldPersistTaps="handled">
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <Pressable
                    key={option.value}
                    onPress={() => handleSelect(option.value)}
                    style={[
                      styles.option,
                      { backgroundColor: isSelected ? colors.primarySoft : colors.surfaceSoft },
                    ]}
                  >
                    <View style={styles.optionCopy}>
                      {option.leading ?? null}
                      <View style={styles.optionText}>
                        <AppText variant="body" style={isSelected && { fontWeight: '700' }}>
                          {option.label}
                        </AppText>
                        {option.hint ? (
                          <AppText variant="caption" tone="muted">
                            {option.hint}
                          </AppText>
                        ) : null}
                      </View>
                    </View>
                    {isSelected ? <AppIcon name="CheckCheck" size={18} color={colors.primary} /> : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: theme.spacing.xs,
  },
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  triggerCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  triggerLabel: {
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.55,
  },
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.34)',
    padding: theme.spacing.md,
  },
  sheet: {
    maxHeight: '70%',
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
    ...theme.shadows.floating,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionList: {
    maxHeight: 360,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    gap: theme.spacing.sm,
  },
  optionCopy: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  optionText: {
    flex: 1,
    gap: 2,
  },
});
