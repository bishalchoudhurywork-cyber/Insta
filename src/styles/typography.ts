import { TextStyle } from 'react-native';

// Typography system for Social Fusion App
// Clean, modern sans-serif with good hierarchy

export const typography = {
  // Font families
  fontFamily: {
    regular: 'System',
    medium: 'System',
    semibold: 'System',
    bold: 'System',
  },

  // Font sizes
  fontSize: {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 18,
    xl: 20,
    '2xl': 24,
    '3xl': 30,
    '4xl': 36,
    '5xl': 48,
  },

  // Font weights
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Line heights
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75,
  },

  // Letter spacing
  letterSpacing: {
    tight: -0.5,
    normal: 0,
    wide: 0.5,
  },

  // Text styles
  textStyles: {
    // Headings
    h1: {
      fontSize: 36,
      fontWeight: '700' as const,
      lineHeight: 44,
      letterSpacing: -0.5,
      color: '#ffffff',
    } as TextStyle,

    h2: {
      fontSize: 30,
      fontWeight: '700' as const,
      lineHeight: 36,
      letterSpacing: -0.5,
      color: '#ffffff',
    } as TextStyle,

    h3: {
      fontSize: 24,
      fontWeight: 'semibold' as const,
      lineHeight: 32,
      letterSpacing: -0.25,
      color: '#ffffff',
    } as TextStyle,

    h4: {
      fontSize: 20,
      fontWeight: 'semibold' as const,
      lineHeight: 28,
      color: '#ffffff',
    } as TextStyle,

    // Body text
    body1: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
      color: '#ffffff',
    } as TextStyle,

    body2: {
      fontSize: 14,
      fontWeight: 'normal' as const,
      lineHeight: 20,
      color: 'rgba(255, 255, 255, 0.8)',
    } as TextStyle,

    // Caption and small text
    caption: {
      fontSize: 12,
      fontWeight: 'normal' as const,
      lineHeight: 16,
      color: 'rgba(255, 255, 255, 0.6)',
    } as TextStyle,

    // Button text
    button: {
      fontSize: 16,
      fontWeight: 'semibold' as const,
      lineHeight: 20,
      letterSpacing: 0.5,
      color: '#ffffff',
    } as TextStyle,

    // Input text
    input: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 24,
      color: '#ffffff',
    } as TextStyle,

    // Message text
    messageSent: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 22,
      color: '#ffffff',
    } as TextStyle,

    messageReceived: {
      fontSize: 16,
      fontWeight: 'normal' as const,
      lineHeight: 22,
      color: '#ffffff',
    } as TextStyle,

    // Timestamp text
    timestamp: {
      fontSize: 11,
      fontWeight: 'normal' as const,
      lineHeight: 14,
      color: 'rgba(255, 255, 255, 0.6)',
    } as TextStyle,
  },
};

// Helper function to create text styles
export const createTextStyle = (
  size: keyof typeof typography.fontSize,
  weight: keyof typeof typography.fontWeight = 'normal',
  color: string = '#ffffff'
): TextStyle => ({
  fontSize: typography.fontSize[size],
  fontWeight: typography.fontWeight[weight],
  color,
});