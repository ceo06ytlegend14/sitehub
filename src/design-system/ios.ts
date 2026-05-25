import { Platform, TextStyle, ViewStyle } from 'react-native';

export const iosFonts = {
  regular: 'MavenPro_400Regular',
  medium: 'MavenPro_500Medium',
  semibold: 'MavenPro_600SemiBold',
  bold: 'MavenPro_700Bold',
} as const;

export const iosPalette = {
  light: {
    background: '#F5F5F7',
    surface: '#FFFFFF',
    surfaceSoft: '#F2F2F7',
    surfaceGlass: 'rgba(255,255,255,0.72)',
    primary: '#007AFF',
    primaryDark: '#0057D9',
    primarySoft: 'rgba(0,122,255,0.10)',
    textPrimary: '#111111',
    textSecondary: '#6E6E73',
    border: 'rgba(0,0,0,0.06)',
  },
  dark: {
    background: '#1C1C1E',
    surface: '#2C2C2E',
    surfaceSoft: '#3A3A3C',
    surfaceGlass: 'rgba(44,44,46,0.72)',
    primary: '#0A84FF',
    primaryDark: '#409CFF',
    primarySoft: 'rgba(10,132,255,0.18)',
    textPrimary: '#F5F5F7',
    textSecondary: '#AEAEB2',
    border: 'rgba(255,255,255,0.08)',
  },
} as const;

export const iosTypography = {
  h1: {
    fontSize: 32,
    lineHeight: 38,
    fontFamily: iosFonts.bold,
    fontWeight: '700',
    letterSpacing: 0,
  } satisfies TextStyle,
  h2: {
    fontSize: 22,
    lineHeight: 29,
    fontFamily: iosFonts.semibold,
    fontWeight: '600',
    letterSpacing: 0,
  } satisfies TextStyle,
  body: {
    fontSize: 16,
    lineHeight: 23,
    fontFamily: iosFonts.regular,
    fontWeight: '400',
    letterSpacing: 0,
  } satisfies TextStyle,
  caption: {
    fontSize: 12,
    lineHeight: 17,
    fontFamily: iosFonts.medium,
    fontWeight: '500',
    letterSpacing: 0,
  } satisfies TextStyle,
} as const;

export const iosDesign = {
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    pill: 999,
  },
  hitTarget: 48,
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: Platform.select({ ios: 0.07, android: 0.1, default: 0.07 }),
      shadowRadius: 26,
      elevation: 3,
    } satisfies ViewStyle,
    floating: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 20 },
      shadowOpacity: Platform.select({ ios: 0.12, android: 0.16, default: 0.12 }),
      shadowRadius: 38,
      elevation: 8,
    } satisfies ViewStyle,
    control: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: Platform.select({ ios: 0.045, android: 0.07, default: 0.045 }),
      shadowRadius: 16,
      elevation: 2,
    } satisfies ViewStyle,
  },
  animation: {
    pressScale: 0.97,
    softPressScale: 0.985,
    duration: {
      fast: 160,
      base: 240,
      slow: 360,
    },
  },
} as const;
