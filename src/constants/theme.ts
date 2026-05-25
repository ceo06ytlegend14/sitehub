import { TextStyle, ViewStyle } from 'react-native';
import type { UserRole } from '@/src/types/models';

export type TextVariant = 'h1' | 'h2' | 'body' | 'caption';
export type ThemeMode = 'light' | 'dark';
export type RoleThemeKey = 'default' | 'sales' | 'printer' | 'admin';

export interface RoleTheme {
  key: RoleThemeKey;
  primary: string;
  primaryDark: string;
  soft: string;
  background: string;
  surface: string;
  accent: string;
  alert: string;
  text: string;
  muted: string;
}

interface ColorModeTokens {
  background: string;
  surface: string;
  textPrimary: string;
  textMuted: string;
  border: string;
}

const FONT_REGULAR = 'MavenPro_400Regular';
const FONT_MEDIUM = 'MavenPro_500Medium';
const FONT_SEMIBOLD = 'MavenPro_600SemiBold';
const FONT_BOLD = 'MavenPro_700Bold';

export const theme = {
  colors: {
    background: '#F1FEFC',
    surface: '#FFFFFF',
    surfaceSoft: '#DDF7F4',
    surfaceGlass: 'rgba(255,255,255,0.94)',
    primary: '#0FBAAF',
    primarySoft: '#DDF7F4',
    primaryDark: '#0A6F71',
    secondary: '#0A6F71',
    accent: '#06B6D4',
    textPrimary: '#073A3A',
    textMuted: '#5B7C7C',
    textInverse: '#FFFFFF',
    border: '#B2EBF2',
    warning: '#B7791F',
    danger: '#DC2626',
    success: '#0F766E',
    info: '#0FBAAF',
    pending: '#98A2B3',
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
    md: 14,
    lg: 18,
    xl: 24,
    pill: 999,
  },
  shadows: {
    card: {
      shadowColor: '#07111F',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.06,
      shadowRadius: 18,
      elevation: 3,
    } satisfies ViewStyle,
  },
  status: {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: '#0FBAAF',
    pending: '#98A2B3',
  },
  roles: {
    default: {
      key: 'default',
      primary: '#0FBAAF',
      primaryDark: '#0A6F71',
      soft: '#DDF7F4',
      background: '#F1FEFC',
      surface: '#FFFFFF',
      accent: '#06B6D4',
      alert: '#DC2626',
      text: '#073A3A',
      muted: '#5B7C7C',
    },
    sales: {
      key: 'sales',
      primary: '#E91E8C',
      primaryDark: '#9D155F',
      soft: '#FCE7F3',
      background: '#FFF5FA',
      surface: '#FFFFFF',
      accent: '#F43F5E',
      alert: '#DC2626',
      text: '#2A0E1C',
      muted: '#8B5E73',
    },
    printer: {
      key: 'printer',
      primary: '#0FBAAF',
      primaryDark: '#0A6F71',
      soft: '#DDF7F4',
      background: '#F1FEFC',
      surface: '#FFFFFF',
      accent: '#06B6D4',
      alert: '#0E7490',
      text: '#073A3A',
      muted: '#5B7C7C',
    },
    admin: {
      key: 'admin',
      primary: '#111827',
      primaryDark: '#020617',
      soft: '#E5E7EB',
      background: '#F4F6FA',
      surface: '#FFFFFF',
      accent: '#2563EB',
      alert: '#DC2626',
      text: '#0F172A',
      muted: '#64748B',
    },
  } satisfies Record<RoleThemeKey, RoleTheme>,
  modes: {
    light: {
      background: '#F1FEFC',
      surface: '#FFFFFF',
      textPrimary: '#073A3A',
      textMuted: '#5B7C7C',
      border: '#B2EBF2',
    },
    dark: {
      background: '#0B1220',
      surface: '#111827',
      textPrimary: '#F9FAFB',
      textMuted: '#98A2B3',
      border: '#243042',
    },
  } satisfies Record<ThemeMode, ColorModeTokens>,
  typography: {
    fontFamily: FONT_REGULAR,
    fontFamilyRegular: FONT_REGULAR,
    fontFamilyMedium: FONT_MEDIUM,
    fontFamilySemiBold: FONT_SEMIBOLD,
    fontFamilyBold: FONT_BOLD,
    variants: {
      h1: {
        fontSize: 30,
        lineHeight: 39,
        fontFamily: FONT_BOLD,
        fontWeight: '700',
        color: '#111827',
      } satisfies TextStyle,
      h2: {
        fontSize: 20,
        lineHeight: 27,
        fontFamily: FONT_SEMIBOLD,
        fontWeight: '600',
        color: '#111827',
      } satisfies TextStyle,
      body: {
        fontSize: 15,
        lineHeight: 22,
        fontFamily: FONT_REGULAR,
        fontWeight: '400',
        color: '#111827',
      } satisfies TextStyle,
      caption: {
        fontSize: 12,
        lineHeight: 17,
        fontFamily: FONT_MEDIUM,
        fontWeight: '500',
        color: '#667085',
      } satisfies TextStyle,
    } satisfies Record<TextVariant, TextStyle>,
  },
} as const;

export type AppTheme = typeof theme;

export function getRoleTheme(role?: UserRole | RoleThemeKey | null): RoleTheme {
  if (role === 'sales') return theme.roles.sales;
  if (role === 'printer') return theme.roles.printer;
  if (role === 'admin' || role === 'super_admin') return theme.roles.admin;
  if (role === 'default') return theme.roles.default;
  return theme.roles.default;
}
