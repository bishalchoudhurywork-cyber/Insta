import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { AppProvider } from '@/contexts/AppContext';
import AuthNavigator from '@/navigation/AuthNavigator';
import MainNavigator from '@/navigation/MainNavigator';
import { useAuth } from '@/hooks/useAuth';

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return null; // Add a loading screen here
  }

  return (
    <NavigationContainer>
      {user ? <MainNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AppProvider>
      <StatusBar style="light" />
      <AppContent />
    </AppProvider>
  );
}