import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/styles';

const ChatScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat</Text>
      <Text style={styles.subtitle}>Real-time messaging coming soon...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    ...typography.textStyles.h2,
    color: colors.white,
    marginBottom: 10,
  },
  subtitle: {
    ...typography.textStyles.body2,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default ChatScreen;