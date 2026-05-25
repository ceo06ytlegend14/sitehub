import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { getRoleTheme, RoleThemeKey, theme } from '@/src/constants/theme';

interface ScreenContainerProps {
  scroll?: boolean;
  contentStyle?: object;
  role?: RoleThemeKey;
}

export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
  role = 'default',
}: PropsWithChildren<ScreenContainerProps>) {
  const roleTheme = getRoleTheme(role);
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: roleTheme.background }]}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
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
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
  },
  content: {
    gap: theme.spacing.md,
  },
});
