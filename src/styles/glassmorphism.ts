import { ViewStyle } from 'react-native';
import { colors } from './colors';

// Glassmorphism styling utilities for Social Fusion App
// Modern glass effects with blur, transparency, and subtle borders

interface GlassmorphismConfig {
  blur?: number;
  opacity?: number;
  borderOpacity?: number;
  hasShadow?: boolean;
  backgroundOpacity?: 'light' | 'medium' | 'strong';
}

// Glassmorphism base configuration
const glassmorphismBase = {
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 16,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 4 },
  shadowOpacity: 0.1,
  shadowRadius: 8,
  elevation: 4,
};

// Glassmorphism styles for different components
export const glassmorphism = {
  // Light glass effect for backgrounds
  light: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderRadius: 16,
  } as ViewStyle,

  // Medium glass effect for cards and containers
  medium: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 16,
  } as ViewStyle,

  // Strong glass effect for interactive elements
  strong: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 16,
  } as ViewStyle,

  // Glass effect for buttons
  button: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    borderRadius: 12,
  } as ViewStyle,

  // Glass effect for input fields
  input: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  } as ViewStyle,

  // Glass effect for message bubbles
  messageSent: {
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 20,
    borderTopRightRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  } as ViewStyle,

  messageReceived: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 20,
    borderTopLeftRadius: 4,
  } as ViewStyle,

  // Glass effect for status cards
  statusCard: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderRadius: 12,
    height: 200,
    width: 120,
  } as ViewStyle,

  // Glass effect for chat list items
  chatListItem: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderWidth: 1,
    borderRadius: 16,
    marginHorizontal: 8,
    marginVertical: 4,
    padding: 16,
  } as ViewStyle,

  // Glass effect for navigation bar
  navigationBar: {
    ...glassmorphismBase,
    backgroundColor: 'rgba(15, 15, 30, 0.8)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderBottomWidth: 0,
  } as ViewStyle,

  // Glass effect for floating action buttons
  fab: {
    ...glassmorphismBase,
    backgroundColor: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  } as ViewStyle,
};

// Helper function to create custom glassmorphism styles
export const createGlassmorphism = (config: GlassmorphismConfig = {}): ViewStyle => {
  const {
    blur = 20,
    opacity = 0.1,
    borderOpacity = 0.2,
    hasShadow = true,
    backgroundOpacity = 'medium'
  } = config;

  const opacityMap = {
    light: 0.05,
    medium: 0.1,
    strong: 0.15,
  };

  return {
    backgroundColor: `rgba(255, 255, 255, ${opacityMap[backgroundOpacity]})`,
    borderColor: `rgba(255, 255, 255, ${borderOpacity})`,
    borderWidth: 1,
    borderRadius: 16,
    ...(hasShadow && {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    }),
  };
};