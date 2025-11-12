import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, glassmorphism, typography } from '@/styles';

interface AvatarProps {
  source?: string | null;
  name?: string;
  size?: 'small' | 'medium' | 'large';
  style?: any;
  showStatus?: boolean;
  isOnline?: boolean;
}

const Avatar: React.FC<AvatarProps> = ({
  source,
  name,
  size = 'medium',
  style,
  showStatus = false,
  isOnline = false,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return 32;
      case 'medium':
        return 48;
      case 'large':
        return 64;
      default:
        return 48;
    }
  };

  const avatarSize = getSize();
  const borderRadius = avatarSize / 2;

  // Generate initials from name
  const getInitials = (name?: string): string => {
    if (!name) return '?';
    const words = name.trim().split(' ');
    if (words.length >= 2) {
      return words[0][0].toUpperCase() + words[1][0].toUpperCase();
    }
    return words[0].substring(0, 2).toUpperCase();
  };

  // Generate background gradient based on name
  const getGradientColors = (): string[] => {
    if (!name) return colors.primaryGradient;

    const gradients = [
      colors.primaryGradient,
      colors.secondaryGradient,
      colors.accentGradient,
    ];

    const index = name.charCodeAt(0) % gradients.length;
    return gradients[index];
  };

  return (
    <View style={[styles.container, style]}>
      <View
        style={[
          styles.avatar,
          {
            width: avatarSize,
            height: avatarSize,
            borderRadius,
          },
        ]}
      >
        {source ? (
          <Image
            source={{ uri: source }}
            style={[
              styles.avatarImage,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius,
              },
            ]}
          />
        ) : (
          <LinearGradient
            colors={getGradientColors()}
            style={[
              styles.avatarGradient,
              {
                width: avatarSize,
                height: avatarSize,
                borderRadius,
              },
            ]}
          >
            <Text
              style={[
                styles.initials,
                {
                  fontSize: avatarSize * 0.4,
                },
              ]}
            >
              {getInitials(name)}
            </Text>
          </LinearGradient>
        )}
      </View>

      {/* Online status indicator */}
      {showStatus && (
        <View
          style={[
            styles.statusIndicator,
            {
              width: avatarSize * 0.25,
              height: avatarSize * 0.25,
              borderRadius: avatarSize * 0.125,
              backgroundColor: isOnline ? colors.online : colors.offline,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  avatar: {
    ...glassmorphism.strong,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: {
    resizeMode: 'cover',
  },
  avatarGradient: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    ...typography.textStyles.button,
    color: colors.white,
    fontWeight: '700',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: colors.backgroundDark,
  },
});

export default Avatar;