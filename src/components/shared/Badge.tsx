import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glassmorphism, typography } from '@/styles';

interface BadgeProps {
  count?: number;
  text?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'error' | 'warning';
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

const Badge: React.FC<BadgeProps> = ({
  count,
  text,
  variant = 'primary',
  size = 'medium',
  style,
}) => {
  const getColors = (): string[] => {
    switch (variant) {
      case 'primary':
        return colors.primaryGradient;
      case 'secondary':
        return colors.secondaryGradient;
      case 'success':
        return ['#48bb78', '#38a169'];
      case 'error':
        return ['#f56565', '#e53e3e'];
      case 'warning':
        return ['#ed8936', '#dd6b20'];
      default:
        return colors.primaryGradient;
    }
  };

  const getBadgeSize = () => {
    switch (size) {
      case 'small':
        return {
          minWidth: 18,
          height: 18,
          paddingHorizontal: 4,
          fontSize: 10,
          borderRadius: 9,
        };
      case 'medium':
        return {
          minWidth: 22,
          height: 22,
          paddingHorizontal: 6,
          fontSize: 11,
          borderRadius: 11,
        };
      case 'large':
        return {
          minWidth: 26,
          height: 26,
          paddingHorizontal: 8,
          fontSize: 12,
          borderRadius: 13,
        };
      default:
        return {
          minWidth: 22,
          height: 22,
          paddingHorizontal: 6,
          fontSize: 11,
          borderRadius: 11,
        };
    }
  };

  const displayText = text || (count && count > 0 ? count.toString() : '');
  const badgeSize = getBadgeSize();

  if (!displayText && (!count || count <= 0)) {
    return null;
  }

  return (
    <LinearGradient
      colors={getColors()}
      style={[
        styles.badge,
        {
          minWidth: badgeSize.minWidth,
          height: badgeSize.height,
          paddingHorizontal: badgeSize.paddingHorizontal,
          borderRadius: badgeSize.borderRadius,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.badgeText,
          {
            fontSize: badgeSize.fontSize,
          },
        ]}
      >
        {count && count > 99 ? '99+' : displayText}
      </Text>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  badge: {
    justifyContent: 'center',
    alignItems: 'center',
    ...glassmorphism.strong,
  },
  badgeText: {
    ...typography.textStyles.caption,
    color: colors.white,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default Badge;