import type { ProfileTheme, TypographyColorKey, UiPreferences } from '@/src/types/models';
import { theme, type ThemeMode } from '@/src/constants/theme';
import { iosPalette } from '@/src/design-system/ios';

export interface ResolvedAppColors {
  background: string;
  surface: string;
  surfaceSoft: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  textPrimary: string;
  textMuted: string;
  textInverse: string;
  border: string;
  typographyColor: string;
}

interface ProfilePalette {
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  light: { background: string; surface: string; surfaceSoft: string; textPrimary: string; textMuted: string; border: string };
  dark: { background: string; surface: string; surfaceSoft: string; textPrimary: string; textMuted: string; border: string };
}

const profilePalettes: Record<ProfileTheme, ProfilePalette> = {
  aqua: {
    primary: iosPalette.light.primary,
    primaryDark: iosPalette.light.primaryDark,
    primarySoft: iosPalette.light.primarySoft,
    accent: iosPalette.light.primary,
    light: {
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      surfaceSoft: iosPalette.light.surfaceSoft,
      textPrimary: iosPalette.light.textPrimary,
      textMuted: iosPalette.light.textSecondary,
      border: iosPalette.light.border,
    },
    dark: {
      background: iosPalette.dark.background,
      surface: iosPalette.dark.surface,
      surfaceSoft: iosPalette.dark.surfaceSoft,
      textPrimary: iosPalette.dark.textPrimary,
      textMuted: iosPalette.dark.textSecondary,
      border: iosPalette.dark.border,
    },
  },
  ocean: {
    primary: iosPalette.light.primary,
    primaryDark: iosPalette.light.primaryDark,
    primarySoft: iosPalette.light.primarySoft,
    accent: iosPalette.light.primary,
    light: {
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      surfaceSoft: iosPalette.light.surfaceSoft,
      textPrimary: iosPalette.light.textPrimary,
      textMuted: iosPalette.light.textSecondary,
      border: iosPalette.light.border,
    },
    dark: {
      background: iosPalette.dark.background,
      surface: iosPalette.dark.surface,
      surfaceSoft: iosPalette.dark.surfaceSoft,
      textPrimary: iosPalette.dark.textPrimary,
      textMuted: iosPalette.dark.textSecondary,
      border: iosPalette.dark.border,
    },
  },
  slate: {
    primary: iosPalette.light.primary,
    primaryDark: iosPalette.light.primaryDark,
    primarySoft: iosPalette.light.primarySoft,
    accent: iosPalette.light.primary,
    light: {
      background: iosPalette.light.background,
      surface: iosPalette.light.surface,
      surfaceSoft: iosPalette.light.surfaceSoft,
      textPrimary: iosPalette.light.textPrimary,
      textMuted: iosPalette.light.textSecondary,
      border: iosPalette.light.border,
    },
    dark: {
      background: iosPalette.dark.background,
      surface: iosPalette.dark.surface,
      surfaceSoft: iosPalette.dark.surfaceSoft,
      textPrimary: iosPalette.dark.textPrimary,
      textMuted: iosPalette.dark.textSecondary,
      border: iosPalette.dark.border,
    },
  },
};

export const typographyColorMap: Record<TypographyColorKey, { label: string; color: string }> = {
  deep_teal: { label: 'Deep Teal', color: iosPalette.light.textPrimary },
  ocean_blue: { label: 'Ocean Blue', color: '#0C4A6E' },
  forest: { label: 'Forest', color: '#14532D' },
  slate: { label: 'Slate', color: '#334155' },
  indigo: { label: 'Indigo', color: '#3730A3' },
  violet: { label: 'Violet', color: '#5B21B6' },
  rose: { label: 'Rose', color: '#9F1239' },
  amber: { label: 'Amber', color: '#92400E' },
  charcoal: { label: 'Charcoal', color: '#1F2937' },
  midnight: { label: 'Midnight', color: '#0B1220' },
};

export function getTypographyColor(key?: TypographyColorKey): string {
  if (!key) return typographyColorMap.deep_teal.color;
  return typographyColorMap[key]?.color ?? typographyColorMap.deep_teal.color;
}

export function normalizeUiPreferences(raw: Partial<UiPreferences> | null | undefined): UiPreferences {
  const profileTheme = raw?.profileTheme ?? mapLegacyProfileTheme(raw?.theme);
  const colorMode: ThemeMode = raw?.colorMode === 'dark' ? 'dark' : 'light';
  const typographyColor = raw?.typographyColor ?? 'deep_teal';

  return {
    language: raw?.language ?? 'en',
    theme: raw?.theme ?? 'vibrant_pink',
    profileTheme,
    colorMode,
    typographyColor,
  };
}

function mapLegacyProfileTheme(bioTheme?: UiPreferences['theme']): ProfileTheme {
  if (bioTheme === 'ocean_wave') return 'ocean';
  if (bioTheme === 'tech_noir' || bioTheme === 'editorial') return 'slate';
  return 'aqua';
}

export function resolveAppColors(preferences: UiPreferences): ResolvedAppColors {
  const palette = profilePalettes[preferences.profileTheme] ?? profilePalettes.aqua;
  const mode = preferences.colorMode === 'dark' ? palette.dark : palette.light;
  const typographyColor = preferences.colorMode === 'dark'
    ? mode.textPrimary
    : getTypographyColor(preferences.typographyColor);

  return {
    background: mode.background,
    surface: mode.surface,
    surfaceSoft: mode.surfaceSoft,
    primary: palette.primary,
    primaryDark: palette.primaryDark,
    primarySoft: palette.primarySoft,
    accent: palette.accent,
    textPrimary: mode.textPrimary,
    textMuted: mode.textMuted,
    textInverse: theme.colors.textInverse,
    border: mode.border,
    typographyColor,
  };
}

export function getStatusBarStyle(colorMode: ThemeMode): 'light' | 'dark' | 'auto' {
  return colorMode === 'dark' ? 'light' : 'dark';
}
