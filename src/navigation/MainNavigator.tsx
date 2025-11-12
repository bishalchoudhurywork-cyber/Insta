import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet } from 'react-native';
import { colors, glassmorphism } from '@/styles';
import TabNavigator from './TabNavigator';
import ChatScreen from '@/screens/chats/ChatScreen';
import NewChatScreen from '@/screens/chats/NewChatScreen';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import StatusUploadScreen from '@/screens/status/StatusUploadScreen';
import StatusViewScreen from '@/screens/status/StatusViewScreen';

type MainStackParamList = {
  TabNavigator: undefined;
  Chat: { chatId: string; chatName?: string };
  NewChat: undefined;
  Profile: { userId?: string };
  Settings: undefined;
  StatusUpload: undefined;
  StatusView: { statusId: string; userId: string };
};

const Stack = createStackNavigator<MainStackParamList>();

const MainNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'transparent' },
        cardOverlayEnabled: true,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen name="TabNavigator" component={TabNavigator} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="NewChat"
        component={NewChatScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="StatusUpload"
        component={StatusUploadScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
      <Stack.Screen
        name="StatusView"
        component={StatusViewScreen}
        options={{
          presentation: 'fullScreenModal',
        }}
      />
    </Stack.Navigator>
  );
};

export default MainNavigator;