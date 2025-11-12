// Color palette for Social Fusion App
// Purple-to-pink gradients with glassmorphism effects

export const colors = {
  // Primary gradients
  primaryGradient: ['#667eea', '#764ba2'],
  secondaryGradient: ['#f093fb', '#f5576c'],
  accentGradient: ['#4facfe', '#00f2fe'],

  // Solid colors
  primary: '#667eea',
  secondary: '#764ba2',
  accent: '#f093fb',
  white: '#ffffff',
  black: '#000000',

  // Glassmorphism overlay colors
  glassWhite: 'rgba(255, 255, 255, 0.1)',
  glassLight: 'rgba(255, 255, 255, 0.15)',
  glassMedium: 'rgba(255, 255, 255, 0.2)',
  glassStrong: 'rgba(255, 255, 255, 0.3)',

  // Glassmorphism blur colors
  blurLight: 'rgba(102, 126, 234, 0.1)',
  blurMedium: 'rgba(118, 75, 162, 0.1)',

  // Text colors
  textPrimary: '#ffffff',
  textSecondary: 'rgba(255, 255, 255, 0.8)',
  textMuted: 'rgba(255, 255, 255, 0.6)',
  textDark: '#2d3748',

  // Status colors
  online: '#48bb78',
  offline: '#a0aec0',
  typing: '#f093fb',

  // Message colors
  sentMessage: ['#667eea', '#764ba2'],
  receivedMessage: 'rgba(255, 255, 255, 0.1)',

  // Input colors
  inputBackground: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',

  // Background colors
  backgroundDark: '#0f0f1e',
  backgroundMedium: '#1a1a2e',
  backgroundLight: 'rgba(255, 255, 255, 0.05)',
};

// Gradient presets for easy reuse
export const gradients = {
  primary: colors.primaryGradient,
  secondary: colors.secondaryGradient,
  accent: colors.accentGradient,
  messageSent: colors.sentMessage,
  messageReceived: ['rgba(255, 255, 255, 0.05)', 'rgba(255, 255, 255, 0.1)'],
  card: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.05)'],
  button: colors.primaryGradient,
  buttonHover: ['#764ba2', '#667eea'],
};