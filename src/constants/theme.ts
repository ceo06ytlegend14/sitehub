import { TextStyle, ViewStyle } from 'react-native';
import type { UserRole } from '@/src/types/models';
import { iosDesign, iosFonts, iosPalette, iosTypography } from '@/src/design-system/ios';

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

export const theme = {
  colors: {
    background: iosPalette.light.background,
    surface: iosPalette.light.surface,
    surfaceSoft: iosPalette.light.surfaceSoft,
    surfaceGlass: iosPalette.light.surfaceGlass,
    primary: iosPalette.light.primary,
    primarySoft: iosPalette.light.primarySoft,
    primaryDark: iosPalette.light.primaryDark,
    secondary: iosPalette.light.textSecondary,
    accent: iosPalette.light.primary,
    textPrimary: iosPalette.light.textPrimary,
    textMuted: iosPalette.light.textSecondary,
    textInverse: '#FFFFFF',
    border: iosPalette.light.border,
    warning: '#B7791F',
    danger: '#DC2626',
    success: '#30D158',
    info: iosPalette.light.primary,
    pending: '#98A2B3',
  },
  spacing: iosDesign.spacing,
  radius: iosDesign.radius,
  shadows: {
    card: iosDesign.shadows.card satisfies ViewStyle,
    floating: iosDesign.shadows.floating satisfies ViewStyle,
    control: iosDesign.shadows.control satisfies ViewStyle,
  },
  status: {
    success: '#16A34A',
    warning: '#D97706',
    error: '#DC2626',
    info: iosPalette.light.primary,
    pending: '#98A2B3',
  },
  roles: {
    default: {
      key: 'default',
      primary: iosPalette.light.primary,
      primaryDark: iosPalette.light.primaryDark,
      soft: iosPalette.light.primarySoft,
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      accent: iosPalette.light.primary,
      alert: '#DC2626',
      text: iosPalette.light.textPrimary,
      muted: iosPalette.light.textSecondary,
    },
    sales: {
      key: 'sales',
      primary: iosPalette.light.primary,
      primaryDark: iosPalette.light.primaryDark,
      soft: iosPalette.light.primarySoft,
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      accent: iosPalette.light.primary,
      alert: '#DC2626',
      text: iosPalette.light.textPrimary,
      muted: iosPalette.light.textSecondary,
    },
    printer: {
      key: 'printer',
      primary: iosPalette.light.primary,
      primaryDark: iosPalette.light.primaryDark,
      soft: iosPalette.light.primarySoft,
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      accent: iosPalette.light.primary,
      alert: '#FF9F0A',
      text: iosPalette.light.textPrimary,
      muted: iosPalette.light.textSecondary,
    },
    admin: {
      key: 'admin',
      primary: iosPalette.light.primary,
      primaryDark: iosPalette.light.primaryDark,
      soft: iosPalette.light.primarySoft,
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      accent: iosPalette.light.primary,
      alert: '#DC2626',
      text: iosPalette.light.textPrimary,
      muted: iosPalette.light.textSecondary,
    },
  } satisfies Record<RoleThemeKey, RoleTheme>,
  modes: {
    light: {
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      textPrimary: iosPalette.light.textPrimary,
      textMuted: iosPalette.light.textSecondary,
      border: iosPalette.light.border,
    },
    dark: {
      background: iosPalette.dark.background,
      surface: iosPalette.dark.surface,
      textPrimary: iosPalette.dark.textPrimary,
      textMuted: iosPalette.dark.textSecondary,
      border: iosPalette.dark.border,
    },
  } satisfies Record<ThemeMode, ColorModeTokens>,
  typography: {
    fontFamily: iosFonts.regular,
    fontFamilyRegular: iosFonts.regular,
    fontFamilyMedium: iosFonts.medium,
    fontFamilySemiBold: iosFonts.semibold,
    fontFamilyBold: iosFonts.bold,
    variants: {
      h1: {
        ...iosTypography.h1,
        color: iosPalette.light.textPrimary,
      } satisfies TextStyle,
      h2: {
        ...iosTypography.h2,
        color: iosPalette.light.textPrimary,
      } satisfies TextStyle,
      body: {
        ...iosTypography.body,
        color: iosPalette.light.textPrimary,
      } satisfies TextStyle,
      caption: {
        ...iosTypography.caption,
        color: iosPalette.light.textSecondary,
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
