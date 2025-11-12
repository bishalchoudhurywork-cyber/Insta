// Export all styling utilities for Social Fusion App

export * from './colors';
export * from './typography';
export * from './glassmorphism';
export * from './common';

// Re-export commonly used combinations
export { colors, gradients } from './colors';
export { typography, createTextStyle } from './typography';
export { glassmorphism, createGlassmorphism } from './glassmorphism';
export {
  commonStyles,
  spacing,
  borderRadius,
  screen,
  createFlexStyle,
  createSpacingStyle,
  createMarginStyle
} from './common';