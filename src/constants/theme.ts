import { TextStyle, ViewStyle } from 'react-native';

export type TextVariant = 'h1' | 'h2' | 'body' | 'caption';

export const theme = {
  colors: {
    background: '#F2FFFE',
    surface: '#FFFFFF',
    surfaceSoft: '#E7F8FF',
    primary: '#00A4A6',
    primaryDark: '#0A5E66',
    secondary: '#FF7B54',
    accent: '#2BC48A',
    textPrimary: '#173E4A',
    textMuted: '#6E8A95',
    border: '#CFE6E8',
    warning: '#FFB343',
    danger: '#E74C3C',
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 22,
    xl: 28,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#0E6B75',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 16,
      elevation: 6,
    } satisfies ViewStyle,
  },
  typography: {
    fontFamilyRegular: 'Inter_400Regular',
    fontFamilyMedium: 'Inter_500Medium',
    fontFamilySemiBold: 'Inter_600SemiBold',
    fontFamilyBold: 'Inter_700Bold',
    variants: {
      h1: {
        fontSize: 30,
        lineHeight: 42,
        fontFamily: 'Inter_700Bold',
      } satisfies TextStyle,
      h2: {
        fontSize: 20,
        lineHeight: 28,
        fontFamily: 'Inter_600SemiBold',
      } satisfies TextStyle,
      body: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: 'Inter_400Regular',
      } satisfies TextStyle,
      caption: {
        fontSize: 12,
        lineHeight: 18,
        fontFamily: 'Inter_500Medium',
      } satisfies TextStyle,
    } satisfies Record<TextVariant, TextStyle>,
  },
} as const;

export type AppTheme = typeof theme;

