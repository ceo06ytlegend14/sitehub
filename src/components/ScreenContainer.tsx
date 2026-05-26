import { PropsWithChildren } from 'react';
import { ScrollView, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

interface ScreenContainerProps {
  scroll?: boolean;
  contentStyle?: StyleProp<ViewStyle>;
  role?: RoleThemeKey;
}

export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  role = 'default',
}: PropsWithChildren<ScreenContainerProps>) {
  const { colors } = usePreferences();
  const roleTheme = getRoleTheme(role);
  const backgroundColor = role === 'admin' ? roleTheme.background : colors.background;

  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: 120,
  },
  content: {
    gap: theme.spacing.lg,
  },
});
