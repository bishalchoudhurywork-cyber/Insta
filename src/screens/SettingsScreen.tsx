import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography } from '@/styles';

const SettingsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>
      <Text style={styles.subtitle}>Customize your app experience</Text>
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

export default SettingsScreen;