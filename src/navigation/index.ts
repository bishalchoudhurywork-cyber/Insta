// Export all navigation components
export { default as AuthNavigator } from './AuthNavigator';
export { default as MainNavigator } from './MainNavigator';
export { default as TabNavigator } from './TabNavigator';

// Export type definitions for reference (these are defined within their respective files)
export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
};

export type MainStackParamList = {
  TabNavigator: undefined;
  Chat: { chatId: string; chatName?: string };
  NewChat: undefined;
  Profile: { userId?: string };
  Settings: undefined;
  StatusUpload: undefined;
  StatusView: { statusId: string; userId: string };
};

export type TabParamList = {
  ChatList: undefined;
  Status: undefined;
  Contacts: undefined;
  Profile: undefined;
};