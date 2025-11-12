import { useState, useEffect, useCallback } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import supabase from '@/supabase/client';
import { ChatWithParticipants } from '@/types/database';
import { MessagingService } from '@/services/messagingService';

export const useChats = () => {
  const [chats, setChats] = useState<ChatWithParticipants[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [chatSubscription, setChatSubscription] = useState<RealtimeChannel | null>(null);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const userChats = await MessagingService.getUserChats();
      setChats(userChats);
    } catch (err: any) {
      console.error('Error fetching chats:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new chat
  const createChat = useCallback(async (participantIds: string[]) => {
    try {
      const newChat = await MessagingService.createDirectChat(participantIds);
      if (newChat) {
        await fetchChats(); // Refresh chat list
        return newChat;
      }
      return null;
    } catch (err: any) {
      console.error('Error creating chat:', err);
      setError(err.message);
      return null;
    }
  }, [fetchChats]);

  // Archive/unarchive a chat
  const toggleArchiveChat = useCallback(async (chatId: string, isArchived: boolean) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('user_chats')
        .update({
          is_archived: isArchived,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      await fetchChats(); // Refresh chat list
      return true;
    } catch (err: any) {
      console.error('Error toggling chat archive:', err);
      setError(err.message);
      return false;
    }
  }, [fetchChats]);

  // Mute/unmute a chat
  const toggleMuteChat = useCallback(async (chatId: string, isMuted: boolean) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('user_chats')
        .update({
          is_muted: isMuted,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      // Update local state
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, user_chats: chat.user_chats.map(uc =>
                uc.user_id === user.user.id ? { ...uc, is_muted: isMuted } : uc
              )}
            : chat
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error toggling chat mute:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Leave a group chat
  const leaveChat = useCallback(async (chatId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('user_chats')
        .delete()
        .eq('user_id', user.user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      await fetchChats(); // Refresh chat list
      return true;
    } catch (err: any) {
      console.error('Error leaving chat:', err);
      setError(err.message);
      return false;
    }
  }, [fetchChats]);

  // Mark all messages in a chat as read
  const markAllAsRead = useCallback(async (chatId: string) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('user_chats')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .eq('chat_id', chatId);

      if (error) throw error;

      // Update local state
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === chatId
            ? { ...chat, unread_count: 0 }
            : chat
        )
      );

      return true;
    } catch (err: any) {
      console.error('Error marking all messages as read:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Get unread message count
  const getTotalUnreadCount = useCallback(() => {
    return chats.reduce((total, chat) => total + (chat.unread_count || 0), 0);
  }, [chats]);

  // Search chats by name or participant name
  const searchChats = useCallback((query: string) => {
    if (!query.trim()) return chats;

    const searchTerm = query.toLowerCase();

    return chats.filter(chat => {
      // Check group name
      if (chat.is_group && chat.group_name) {
        return chat.group_name.toLowerCase().includes(searchTerm);
      }

      // Check participant names for direct chats
      return chat.user_chats.some(uc =>
        uc.user.full_name?.toLowerCase().includes(searchTerm) ||
        uc.user.username.toLowerCase().includes(searchTerm)
      );
    });
  }, [chats]);

  // Set up real-time subscription
  useEffect(() => {
    const setupSubscription = () => {
      const subscription = MessagingService.subscribeToUserChats((updatedChat) => {
        setChats(prevChats => {
          const existingIndex = prevChats.findIndex(chat => chat.id === updatedChat.id);

          if (existingIndex >= 0) {
            // Update existing chat
            const newChats = [...prevChats];
            newChats[existingIndex] = updatedChat;
            return newChats.sort((a, b) =>
              new Date(b.last_message?.created_at || 0).getTime() -
              new Date(a.last_message?.created_at || 0).getTime()
            );
          } else {
            // Add new chat
            return [updatedChat, ...prevChats].sort((a, b) =>
              new Date(b.last_message?.created_at || 0).getTime() -
              new Date(a.last_message?.created_at || 0).getTime()
            );
          }
        });
      });

      setChatSubscription(subscription);
    };

    setupSubscription();

    return () => {
      if (chatSubscription) {
        supabase.removeChannel(chatSubscription);
      }
    };
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  // Update online status on mount and cleanup
  useEffect(() => {
    MessagingService.updateOnlineStatus(true);

    return () => {
      MessagingService.updateOnlineStatus(false);
    };
  }, []);

  return {
    chats,
    loading,
    error,
    fetchChats,
    createChat,
    toggleArchiveChat,
    toggleMuteChat,
    leaveChat,
    markAllAsRead,
    getTotalUnreadCount,
    searchChats,
    refreshChats: fetchChats,
  };
};