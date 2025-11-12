// Database type definitions for Social Fusion App
// Based on Supabase schema

export interface User {
  id: string;
  email: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  last_seen?: string;
  created_at: string;
  updated_at?: string;
}

export interface Chat {
  id: string;
  is_group: boolean;
  group_name?: string;
  group_description?: string;
  group_avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at?: string;
}

export interface UserChat {
  user_id: string;
  chat_id: string;
  role: 'admin' | 'member';
  joined_at: string;
  last_read_at?: string;
}

export interface Message {
  id: string;
  chat_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file' | 'voice';
  reply_to_id?: string;
  is_deleted: boolean;
  created_at: string;
  updated_at?: string;
}

export interface StatusUpdate {
  id: string;
  user_id: string;
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  background_gradient?: {
    start: string;
    end: string;
  };
  privacy: 'all_contacts' | 'selected_contacts';
  view_count: number;
  expires_at: string;
  created_at: string;
}

export interface StatusView {
  id: string;
  status_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface AIInteraction {
  id: string;
  user_id: string;
  message_context: string;
  suggestion_type: 'reply' | 'emoji' | 'summary';
  suggestions: any;
  user_accepted: boolean;
  created_at: string;
}

// Join types for queries
export interface ChatWithParticipants extends Chat {
  user_chats: (UserChat & { user: User })[];
  last_message?: Message;
  unread_count?: number;
}

export interface MessageWithSender extends Message {
  sender: User;
  reply_to?: MessageWithSender;
}

export interface StatusWithUser extends StatusUpdate {
  user: User;
  status_views: StatusView[];
}

// Real-time subscription types
export interface RealtimeMessage {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'messages';
  data: Message;
  old_data?: Message;
}

export interface RealtimeChat {
  type: 'INSERT' | 'UPDATE' | 'DELETE';
  table: 'chats';
  data: Chat;
  old_data?: Chat;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: 'success' | 'error';
}

export interface PaginatedResponse<T> {
  data: T[];
  has_more: boolean;
  next_cursor?: string;
}

// Form types
export interface SignUpForm {
  email: string;
  username: string;
  full_name: string;
  password: string;
  confirm_password: string;
}

export interface LoginForm {
  email: string;
  password: string;
  remember_me: boolean;
}

export interface MessageForm {
  content: string;
  message_type: 'text' | 'image' | 'video' | 'file' | 'voice';
  reply_to_id?: string;
}

export interface StatusForm {
  content?: string;
  media_url?: string;
  media_type?: 'image' | 'video';
  background_gradient?: {
    start: string;
    end: string;
  };
  privacy: 'all_contacts' | 'selected_contacts';
}

// Navigation types
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
};

export type MainStackParamList = {
  TabNavigator: undefined;
  Chat: { chatId: string; chatName?: string };
  NewChat: undefined;
  Settings: undefined;
  Profile: { userId?: string };
  StatusUpload: undefined;
  StatusView: { statusId: string; userId: string };
};

export type TabParamList = {
  ChatList: undefined;
  Status: undefined;
  Contacts: undefined;
  Profile: undefined;
};