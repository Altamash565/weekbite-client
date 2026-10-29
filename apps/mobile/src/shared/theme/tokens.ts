/**
 * WeekBite Design Tokens — Calm Culinary Minimal
 * Generated from apps/mobile/DESIGN.md
 */

export const colors = {
  // Brand
  primary: '#32CD32',
  primaryDark: '#1F8A1F',
  primaryTint: '#E9F8E9',
  onPrimary: '#0F2A0F', // Dark green text on primary buttons (Never white)

  // Neutrals & Surfaces (Light Theme)
  background: '#F8FAF7',
  surface: '#FFFFFF',
  surfaceContainerLow: '#F2F5EE',
  border: '#E6EAE4',
  textPrimary: '#1B1F1B',
  textSecondary: '#6B726B',

  // Semantic & Feedback
  error: '#D64545',
  errorTint: '#FDF2F2',
  success: '#1F8A1F',
  successTint: '#E9F8E9',
} as const;

export const spacing = {
  xs: 8,
  sm: 16,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48,
  screenMargin: 20,
} as const;

export const radii = {
  card: 12,
  input: 12,
  button: 12,
  squircle: 24,
  pill: 9999,
} as const;

export const typography = {
  fontFamily: 'Lexend',
  title: {
    fontSize: 28,
    fontWeight: '600' as const,
    lineHeight: 35,
    letterSpacing: -0.56,
  },
  section: {
    fontSize: 20,
    fontWeight: '500' as const,
    lineHeight: 27,
    letterSpacing: -0.2,
  },
  body: {
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 21,
    letterSpacing: 0,
  },
  bodyMedium: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 20,
    letterSpacing: 0,
  },
  button: {
    fontSize: 14,
    fontWeight: '500' as const,
    lineHeight: 14,
    letterSpacing: 0.14,
  },
  caption: {
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 17,
    letterSpacing: 0.12,
  },
} as const;

export const layout = {
  minTouchTarget: 44,
  borderWidth: 1,
} as const;
