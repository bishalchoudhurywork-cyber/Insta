import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Message, MessageWithSender } from '@/types/database';
import { MessagingService } from '@/services/messagingService';
import supabase from '@/supabase/client';

export const useMessages = (chatId: string) => {
  const [messages, setMessages] = useState<MessageWithSender[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [messageSubscription, setMessageSubscription] = useState<RealtimeChannel | null>(null);

  // For pagination
  const oldestMessageId = useRef<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch messages with pagination
  const fetchMessages = useCallback(async (loadMore = false) => {
    if (!chatId) return;

    try {
      if (!loadMore) {
        setLoading(true);
        setError(null);
      }

      const cursor = loadMore ? oldestMessageId.current : undefined;
      const fetchedMessages = await MessagingService.getMessages(
        chatId,
        loadMore ? 30 : 50, // Load fewer messages for pagination
        cursor
      );

      if (loadMore) {
        // Prepend older messages for infinite scroll
        setMessages(prev => [...fetchedMessages, ...prev]);
      } else {
        // Replace all messages for initial load or refresh
        setMessages(fetchedMessages);
        if (fetchedMessages.length > 0) {
          oldestMessageId.current = fetchedMessages[0].id;
        }
      }

      setHasMore(fetchedMessages.length === (loadMore ? 30 : 50));
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [chatId]);

  // Send a message
  const sendMessage = useCallback(async (content: string, messageType: 'text' | 'image' | 'video' | 'file' | 'voice' = 'text', replyToId?: string) => {
    if (!content.trim() || sending || !chatId) return false;

    try {
      setSending(true);
      setError(null);

      const newMessage = await MessagingService.sendMessage(chatId, {
        content: content.trim(),
        message_type: messageType,
        reply_to_id: replyToId,
      });

      if (newMessage) {
        // Optimistically add message to local state
        const messageWithSender: MessageWithSender = {
          ...newMessage,
          sender: {
            id: newMessage.sender_id,
            // Additional sender info would come from auth context
            email: '',
            username: '',
            full_name: '',
            created_at: ''
          }
        };

        setMessages(prev => [...prev, messageWithSender]);
        return true;
      }

      return false;
    } catch (err: any) {
      console.error('Error sending message:', err);
      setError(err.message);
      return false;
    } finally {
      setSending(false);
    }
  }, [sending, chatId]);

  // Delete a message
  const deleteMessage = useCallback(async (messageId: string) => {
    try {
      const success = await MessagingService.deleteMessage(messageId);
      if (success) {
        // Optimistically update local state
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId ? { ...msg, is_deleted: true } : msg
          )
        );
      }
      return success;
    } catch (err: any) {
      console.error('Error deleting message:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Edit a message
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!newContent.trim()) return false;

    try {
      const success = await MessagingService.editMessage(messageId, newContent.trim());
      if (success) {
        // Optimistically update local state
        setMessages(prev =>
          prev.map(msg =>
            msg.id === messageId
              ? {
                  ...msg,
                  content: newContent.trim(),
                  is_edited: true,
                  edited_at: new Date().toISOString()
                }
              : msg
          )
        );
      }
      return success;
    } catch (err: any) {
      console.error('Error editing message:', err);
      setError(err.message);
      return false;
    }
  }, []);

  // Mark a message as read
  const markAsRead = useCallback(async (messageId: string) => {
    try {
      await MessagingService.markAsRead(chatId, messageId);
    } catch (err: any) {
      console.error('Error marking message as read:', err);
      // Don't set error for read receipts as it's not critical
    }
  }, [chatId]);

  // Mark all messages as read
  const markAllAsRead = useCallback(async () => {
    if (messages.length === 0) return;

    try {
      // Mark the most recent message as read
      const mostRecentMessage = messages[messages.length - 1];
      if (mostRecentMessage) {
        await markAsRead(mostRecentMessage.id);
      }
    } catch (err: any) {
      console.error('Error marking all messages as read:', err);
    }
  }, [messages, markAsRead]);

  // Load more messages (for pagination)
  const loadMoreMessages = useCallback(async () => {
    if (loading || !hasMore) return;

    await fetchMessages(true);
  }, [loading, hasMore, fetchMessages]);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  // Set up real-time subscription
  useEffect(() => {
    if (!chatId) return;

    const setupSubscription = () => {
      const subscription = MessagingService.subscribeToChatMessages(
        chatId,
        (newMessage) => {
          if (newMessage.is_deleted) {
            // Handle deleted message
            setMessages(prev =>
              prev.map(msg =>
                msg.id === newMessage.id ? { ...msg, is_deleted: true } : msg
              )
            );
          } else {
            // Check if message already exists (to avoid duplicates)
            setMessages(prev => {
              const exists = prev.some(msg => msg.id === newMessage.id);
              if (!exists) {
                return [...prev, newMessage as MessageWithSender];
              }
              return prev.map(msg =>
                msg.id === newMessage.id ? newMessage as MessageWithSender : msg
              );
            });
          }
        }
      );

      setMessageSubscription(subscription);
    };

    setupSubscription();

    return () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
    };
  }, [chatId]);

  // Initial fetch
  useEffect(() => {
    if (chatId) {
      fetchMessages(false);
      markAllAsRead();
    }
  }, [chatId, fetchMessages, markAllAsRead]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (messageSubscription) {
        supabase.removeChannel(messageSubscription);
      }
    };
  }, []);

  return {
    messages,
    loading,
    sending,
    error,
    hasMore,
    fetchMessages,
    sendMessage,
    deleteMessage,
    editMessage,
    markAsRead,
    markAllAsRead,
    loadMoreMessages,
    scrollToBottom,
    messagesEndRef,
    refreshMessages: () => fetchMessages(false),
  };
};