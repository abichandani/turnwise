import { Platform } from 'react-native';

// Warm cream/orange design language, matching the approved reference mockup.
export const Colors = {
  light: {
    background: '#ECE7DE',
    surface: '#FBF5EA',
    card: '#FFFFFF',
    cardBorder: '#F0E8D8',
    text: '#2C2722',
    textMuted: '#8A8175',
    textFaint: '#A89E8E',
    textFainter: '#A09686',
    textFaintest: '#B0A594',
    placeholder: '#C3B9A8',
    inputBorder: '#EADFCC',
    accent: '#EE9B3F',
    accentSoft: '#FCEFDB',
    danger: '#C6543C',
    dangerSoft: '#FBE6E1',
    dangerBorder: '#F4CFC5',
    success: '#3E8A54',
    successSoft: '#E7F3E9',
    info: '#4B87C7',
    infoSoft: '#E7F0FA',
    purple: '#7C5BB0',
    purpleSoft: '#EAE2F3',
    adminBackground: '#2C2722',
    adminTextMuted: '#C9B79A',
    adminPillInactive: 'rgba(255,255,255,0.12)',
    adminPillInactiveText: '#E7DDCB',
  },
  dark: {
    background: '#1B1712',
    surface: '#221D17',
    card: '#2B241C',
    cardBorder: '#3A3226',
    text: '#F5EFE4',
    textMuted: '#C9BEAC',
    textFaint: '#B0A594',
    textFainter: '#9C917F',
    textFaintest: '#8A7F6E',
    placeholder: '#6E655A',
    inputBorder: '#4A4131',
    accent: '#EE9B3F',
    accentSoft: '#4A3319',
    danger: '#E07A5F',
    dangerSoft: '#3D2420',
    dangerBorder: '#5A342C',
    success: '#5AA46B',
    successSoft: '#20301F',
    info: '#6DA1DA',
    infoSoft: '#1E2E3D',
    purple: '#9B7FCB',
    purpleSoft: '#2E2740',
    adminBackground: '#100D09',
    adminTextMuted: '#B0A085',
    adminPillInactive: 'rgba(255,255,255,0.08)',
    adminPillInactiveText: '#C9B79A',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

// Loaded via @expo-google-fonts/{fredoka,nunito} in the root layout — see src/app/_layout.tsx.
export const Fonts = {
  displayMedium: 'Fredoka_500Medium',
  display: 'Fredoka_600SemiBold',
  bodyRegular: 'Nunito_400Regular',
  bodySemiBold: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
  bodyExtraBold: 'Nunito_800ExtraBold',
  mono: Platform.select({ ios: 'ui-monospace', default: 'monospace' }),
};

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const Radii = {
  sm: 13,
  md: 16,
  lg: 20,
  xl: 24,
  xxl: 26,
  pill: 999,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
