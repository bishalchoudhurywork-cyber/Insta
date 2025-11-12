import { StyleSheet, Dimensions } from 'react-native';
import { typography } from './typography';
import { glassmorphism } from './glassmorphism';

// Common styles and utilities used throughout the app

const { width, height } = Dimensions.get('window');

// Spacing scale
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
};

// Border radius scale
export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  '2xl': 24,
  full: 9999,
};

// Screen dimensions
export const screen = {
  width,
  height,
  isSmall: width < 375,
  isMedium: width >= 375 && width < 768,
  isLarge: width >= 768,
};

// Common styles
export const commonStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: '#0f0f1e', // Dark background
  },

  safeArea: {
    flex: 1,
    backgroundColor: 'transparent',
  },

  // Flexbox utilities
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  centerHorizontal: {
    alignItems: 'center',
  },

  centerVertical: {
    justifyContent: 'center',
  },

  row: {
    flexDirection: 'row',
  },

  spaceBetween: {
    justifyContent: 'space-between',
  },

  spaceAround: {
    justifyContent: 'space-around',
  },

  // Position utilities
  absolute: {
    position: 'absolute',
  },

  relative: {
    position: 'relative',
  },

  // Shadow utilities
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },

  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },

  // Overlay utilities
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },

  // Loading styles
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    ...glassmorphism.medium,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },

  // Button base styles
  buttonBase: {
    ...glassmorphism.button,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },

  buttonLarge: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    minWidth: 160,
  },

  buttonSmall: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    minWidth: 80,
  },

  // Input base styles
  inputBase: {
    ...glassmorphism.input,
    ...typography.textStyles.input,
    minHeight: 48,
  },

  // Card styles
  card: {
    ...glassmorphism.medium,
    padding: spacing.md,
    margin: spacing.sm,
  },

  cardLarge: {
    ...glassmorphism.medium,
    padding: spacing.lg,
    margin: spacing.md,
  },

  // Separator styles
  separator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginVertical: spacing.md,
  },

  // Avatar styles
  avatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },

  avatarMedium: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },

  avatarLarge: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },

  // Status indicators
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: '#ffffff',
  },

  onlineStatus: {
    backgroundColor: '#48bb78',
  },

  offlineStatus: {
    backgroundColor: '#a0aec0',
  },

  // Message bubble styles
  messageContainer: {
    marginVertical: spacing.xs,
    maxWidth: width * 0.75,
  },

  messageContent: {
    ...typography.textStyles.messageSent,
    padding: spacing.md,
    marginHorizontal: spacing.sm,
  },

  // List styles
  listItem: {
    ...glassmorphism.chatListItem,
    flexDirection: 'row',
    alignItems: 'center',
  },

  listSeparator: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: spacing.lg,
  },

  // Tab bar styles
  tabBar: {
    ...glassmorphism.navigationBar,
    flexDirection: 'row',
    borderTopWidth: 1,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    paddingTop: spacing.md,
  },

  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },

  activeTab: {
    opacity: 1,
  },

  inactiveTab: {
    opacity: 0.6,
  },

  // Animation utilities
  pressable: {
    opacity: 1,
  },

  pressed: {
    opacity: 0.7,
  },

  disabled: {
    opacity: 0.5,
  },

  // Gradient overlay styles
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },

  gradientLight: {
    opacity: 0.6,
  },

  gradientStrong: {
    opacity: 1,
  },
});

// Style helpers for dynamic styling
export const createFlexStyle = (direction: 'row' | 'column' = 'row', align: 'center' | 'start' | 'end' = 'center', justify: 'center' | 'start' | 'end' | 'space-between' = 'center') => ({
  flexDirection: direction,
  alignItems: align,
  justifyContent: justify,
});

export const createSpacingStyle = (size: keyof typeof spacing, direction: 'all' | 'horizontal' | 'vertical' = 'all') => {
  const value = spacing[size];

  switch (direction) {
    case 'horizontal':
      return { paddingHorizontal: value };
    case 'vertical':
      return { paddingVertical: value };
    default:
      return { padding: value };
  }
};

export const createMarginStyle = (size: keyof typeof spacing, direction: 'all' | 'horizontal' | 'vertical' | 'top' | 'bottom' = 'all') => {
  const value = spacing[size];

  switch (direction) {
    case 'horizontal':
      return { marginHorizontal: value };
    case 'vertical':
      return { marginVertical: value };
    case 'top':
      return { marginTop: value };
    case 'bottom':
      return { marginBottom: value };
    default:
      return { margin: value };
  }
};