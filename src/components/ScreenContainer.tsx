import { PropsWithChildren } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@/src/constants/theme';

interface ScreenContainerProps {
  scroll?: boolean;
  contentStyle?: object;
}

export function ScreenContainer({
  children,
  scroll = true,
  contentStyle,
}: PropsWithChildren<ScreenContainerProps>) {
  const content = (
    <View style={[styles.content, contentStyle]}>
      {children}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#9DECF9', '#CBF7EC', '#FFF4D8']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.mapCircleLarge} />
      <View style={styles.mapCircleSmall} />
      <View style={styles.mapPath} />
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
    padding: theme.spacing.lg,
    paddingBottom: 120,
  },
  content: {
    gap: theme.spacing.md,
  },
  mapCircleLarge: {
    position: 'absolute',
    top: -90,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 220,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
  },
  mapCircleSmall: {
    position: 'absolute',
    bottom: 140,
    left: -48,
    width: 130,
    height: 130,
    borderRadius: 130,
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
  },
  mapPath: {
    position: 'absolute',
    top: 180,
    left: 36,
    right: 24,
    height: 1,
    borderStyle: 'dashed',
    borderTopWidth: 2,
    borderColor: 'rgba(23, 62, 74, 0.14)',
  },
});

