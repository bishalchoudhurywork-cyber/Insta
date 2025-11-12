import supabase from '@/supabase/client';
import { Message, Chat, ChatWithParticipants, MessageForm } from '@/types/database';

export class MessagingService {
  // Create a new direct chat
  static async createDirectChat(participantIds: string[]): Promise<Chat | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // Check if direct chat already exists
      if (participantIds.length === 1) {
        const existingChat = await this.findDirectChat(user.user.id, participantIds[0]);
        if (existingChat) return existingChat;
      }

      // Create new chat
      const { data: chat, error } = await supabase
        .from('chats')
        .insert({
          is_group: participantIds.length > 1,
          created_by: user.user.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Add participants to chat
      const participants = [
        { user_id: user.user.id, chat_id: chat.id, role: 'admin' },
        ...participantIds.map(userId => ({
          user_id: userId,
          chat_id: chat.id,
          role: 'member'
        }))
      ];

      const { error: participantsError } = await supabase
        .from('user_chats')
        .insert(participants);

      if (participantsError) throw participantsError;

      return chat;
    } catch (error) {
      console.error('Error creating direct chat:', error);
      return null;
    }
  }

  // Find existing direct chat between two users
  static async findDirectChat(userId1: string, userId2: string): Promise<Chat | null> {
    try {
      const { data, error } = await supabase
        .from('chats')
        .select(`
          id, is_group, created_by, created_at,
          user_chats!inner(user_id)
        `)
        .eq('is_group', false)
        .eq('user_chats.user_id', userId1);

      if (error) throw error;

      // Check if the chat also includes the second user
      for (const chat of data || []) {
        const { data: secondParticipant } = await supabase
          .from('user_chats')
          .select('user_id')
          .eq('chat_id', chat.id)
          .eq('user_id', userId2)
          .single();

        if (secondParticipant) {
          return chat;
        }
      }

      return null;
    } catch (error) {
      console.error('Error finding direct chat:', error);
      return null;
    }
  }

  // Send a message
  static async sendMessage(chatId: string, messageForm: MessageForm): Promise<Message | null> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: message, error } = await supabase
        .from('messages')
        .insert({
          chat_id: chatId,
          sender_id: user.user.id,
          content: messageForm.content,
          message_type: messageForm.message_type,
          reply_to_id: messageForm.reply_to_id,
        })
        .select()
        .single();

      if (error) throw error;

      // Mark message as read for sender
      await this.markAsRead(chatId, message.id);

      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  // Mark message as read for current user
  static async markAsRead(chatId: string, messageId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      // Add read receipt
      const { error: receiptError } = await supabase
        .from('message_read_receipts')
        .upsert({
          message_id: messageId,
          user_id: user.user.id,
        }, {
          onConflict: 'message_id,user_id'
        });

      if (receiptError) throw receiptError;

      // Update user's last_read_at for the chat
      const { error: chatError } = await supabase
        .from('user_chats')
        .update({
          last_read_at: new Date().toISOString()
        })
        .eq('user_id', user.user.id)
        .eq('chat_id', chatId);

      if (chatError) throw chatError;

      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  // Delete a message
  static async deleteMessage(messageId: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('messages')
        .update({
          is_deleted: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  // Edit a message
  static async editMessage(messageId: string, newContent: string): Promise<boolean> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return false;

      const { error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.user.id);

      if (error) throw error;

      return true;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
  }

  // Get messages for a chat with pagination
  static async getMessages(chatId: string, limit = 50, cursor?: string): Promise<Message[]> {
    try {
      let query = supabase
        .from('messages')
        .select(`
          *,
          sender:users(id, username, full_name, avatar_url),
          reply_to:messages(id, content, sender_id)
        `)
        .eq('chat_id', chatId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (cursor) {
        query = query.lt('created_at', cursor);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Reverse to show oldest messages first
      return data ? data.reverse() : [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Get user's chat list with participants and last message
  static async getUserChats(): Promise<ChatWithParticipants[]> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return [];

      // Using the database function to get chat list with metadata
      const { data, error } = await supabase
        .rpc('get_user_chats', { user_uuid: user.user.id });

      if (error) throw error;

      // Transform the data to match ChatWithParticipants interface
      const chats: ChatWithParticipants[] = [];

      for (const chatData of data || []) {
        const { data: participants } = await supabase
          .from('user_chats')
          .select(`
            role,
            joined_at,
            user:users(id, username, full_name, avatar_url, last_seen)
          `)
          .eq('chat_id', chatData.chat_id);

        if (participants) {
          chats.push({
            id: chatData.chat_id,
            is_group: chatData.is_group,
            group_name: chatData.group_name,
            group_description: null,
            group_avatar_url: chatData.group_avatar_url,
            created_by: null,
            created_at: new Date().toISOString(), // This would come from a real query
            user_chats: participants.map(p => ({
              user_id: p.user.id,
              chat_id: chatData.chat_id,
              role: p.role,
              joined_at: p.joined_at,
              last_read_at: null,
              user: p.user
            })),
            last_message: chatData.last_message_content ? {
              id: '', // Would need separate query
              chat_id: chatData.chat_id,
              sender_id: '', // Would need separate query
              content: chatData.last_message_content,
              message_type: 'text',
              is_deleted: false,
              created_at: chatData.last_message_created_at || new Date().toISOString()
            } : undefined,
            unread_count: chatData.unread_count
          });
        }
      }

      return chats;
    } catch (error) {
      console.error('Error getting user chats:', error);
      return [];
    }
  }

  // Subscribe to new messages in a chat
  static subscribeToChatMessages(chatId: string, callback: (message: Message) => void) {
    return supabase
      .channel(`chat:${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Message);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          if (payload.new) {
            callback(payload.new as Message);
          }
        }
      )
      .subscribe();
  }

  // Subscribe to user's chat list changes
  static subscribeToUserChats(callback: (chat: ChatWithParticipants) => void) {
    return supabase
      .channel('user-chats')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
        },
        async (payload) => {
          if (payload.new) {
            // This is simplified - in production, you'd want to get the full chat data
            const chats = await this.getUserChats();
            const updatedChat = chats.find(c => c.id === (payload.new as any).id);
            if (updatedChat) callback(updatedChat);
          }
        }
      )
      .subscribe();
  }

  // Update user's online status
  static async updateOnlineStatus(isOnline: boolean): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      await supabase
        .from('users')
        .update({
          is_online: isOnline,
          last_seen: isOnline ? null : new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', user.user.id);
    } catch (error) {
      console.error('Error updating online status:', error);
    }
  }

  // Get typing indicator for a chat (simplified implementation)
  static async setTypingIndicator(chatId: string, isTyping: boolean): Promise<void> {
    // This would typically use a separate typing_indicators table
    // For now, we'll use a simple implementation with Supabase presence
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const channel = supabase.channel(`typing:${chatId}`);

      if (isTyping) {
        await channel.send({
          type: 'broadcast',
          event: 'typing',
          payload: {
            user_id: user.user.id,
            is_typing: true
          }
        });
      }
    } catch (error) {
      console.error('Error setting typing indicator:', error);
    }
  }
}