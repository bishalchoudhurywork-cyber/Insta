import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useChats } from '@/hooks/useChats';
import { ChatWithParticipants } from '@/types/database';
import { colors, glassmorphism, typography, spacing, borderRadius } from '@/styles';
import Avatar from '@/components/shared/Avatar';
import Badge from '@/components/shared/Badge';

type ChatListScreenNavigationProp = StackNavigationProp<any, 'ChatList'>;

const ChatListScreen = () => {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const {
    chats,
    loading,
    error,
    searchChats,
    createChat,
    toggleArchiveChat,
    markAllAsRead,
    getTotalUnreadCount,
    refreshChats,
  } = useChats();

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredChats, setFilteredChats] = useState<ChatWithParticipants[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedChats, setSelectedChats] = useState<string[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  // Filter chats based on search query
  useEffect(() => {
    if (searchQuery.trim()) {
      setFilteredChats(searchChats(searchQuery));
    } else {
      setFilteredChats(chats);
    }
  }, [searchQuery, chats, searchChats]);

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await refreshChats();
    setRefreshing(false);
  };

  // Handle chat press
  const handleChatPress = (chat: ChatWithParticipants) => {
    if (isSelectionMode) {
      toggleChatSelection(chat.id);
    } else {
      navigation.navigate('Chat', {
        chatId: chat.id,
        chatName: chat.is_group ? chat.group_name : getChatDisplayName(chat),
      });
      // Mark messages as read
      if (chat.unread_count && chat.unread_count > 0) {
        markAllAsRead(chat.id);
      }
    }
  };

  // Handle long press for selection mode
  const handleChatLongPress = (chatId: string) => {
    if (!isSelectionMode) {
      setIsSelectionMode(true);
      setSelectedChats([chatId]);
    } else {
      toggleChatSelection(chatId);
    }
  };

  // Toggle chat selection
  const toggleChatSelection = (chatId: string) => {
    setSelectedChats(prev => {
      if (prev.includes(chatId)) {
        const newSelection = prev.filter(id => id !== chatId);
        if (newSelection.length === 0) {
          setIsSelectionMode(false);
        }
        return newSelection;
      } else {
        return [...prev, chatId];
      }
    });
  };

  // Exit selection mode
  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedChats([]);
  };

  // Handle archive selected chats
  const handleArchiveSelected = async () => {
    Alert.alert(
      'Archive Chats',
      `Archive ${selectedChats.length} chat${selectedChats.length > 1 ? 's' : ''}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            for (const chatId of selectedChats) {
              await toggleArchiveChat(chatId, true);
            }
            exitSelectionMode();
          },
        },
      ]
    );
  };

  // Get chat display name
  const getChatDisplayName = (chat: ChatWithParticipants): string => {
    if (chat.is_group) {
      return chat.group_name || 'Group Chat';
    }

    // Find other participant (not current user)
    const otherParticipant = chat.user_chats.find(uc => {
      // This would need current user ID from auth context
      return uc.role === 'member'; // Simplified logic
    });

    return otherParticipant?.user?.full_name || otherParticipant?.user?.username || 'Unknown';
  };

  // Get chat avatar URL
  const getChatAvatarUrl = (chat: ChatWithParticipants): string | null => {
    if (chat.is_group) {
      return chat.group_avatar_url || null;
    }

    // Find other participant
    const otherParticipant = chat.user_chats.find(uc => uc.role === 'member');
    return otherParticipant?.user?.avatar_url || null;
  };

  // Get last message text
  const getLastMessageText = (chat: ChatWithParticipants): string => {
    if (!chat.last_message) return 'No messages yet';
    if (chat.last_message.is_deleted) return 'Message deleted';
    return chat.last_message.content;
  };

  // Get last message time
  const getLastMessageTime = (chat: ChatWithParticipants): string => {
    if (!chat.last_message) return '';

    const messageTime = new Date(chat.last_message.created_at);
    const now = new Date();
    const diffMs = now.getTime() - messageTime.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return messageTime.toLocaleDateString();
  };

  // Render chat item
  const renderChatItem = ({ item }: { item: ChatWithParticipants }) => {
    const isSelected = selectedChats.includes(item.id);
    const displayName = getChatDisplayName(item);
    const avatarUrl = getChatAvatarUrl(item);
    const lastMessageText = getLastMessageText(item);
    const lastMessageTime = getLastMessageTime(item);

    return (
      <TouchableOpacity
        style={[
          styles.chatItem,
          isSelected && styles.chatItemSelected,
        ]}
        onPress={() => handleChatPress(item)}
        onLongPress={() => handleChatLongPress(item.id)}
        activeOpacity={0.7}
      >
        {/* Avatar */}
        <Avatar
          source={avatarUrl}
          name={displayName}
          size="medium"
          style={styles.avatar}
        />

        {/* Chat Info */}
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text
              style={[
                styles.chatName,
                item.unread_count && item.unread_count > 0 && styles.chatNameUnread,
              ]}
              numberOfLines={1}
            >
              {displayName}
            </Text>
            <Text style={styles.messageTime}>{lastMessageTime}</Text>
          </View>

          <View style={styles.messageRow}>
            <Text
              style={[
                styles.lastMessage,
                item.unread_count && item.unread_count > 0 && styles.lastMessageUnread,
              ]}
              numberOfLines={2}
            >
              {lastMessageText}
            </Text>
            {item.unread_count && item.unread_count > 0 && (
              <Badge count={item.unread_count} style={styles.unreadBadge} />
            )}
          </View>
        </View>

        {/* Selection indicator */}
        {isSelectionMode && (
          <View style={styles.selectionIndicator}>
            <View style={[
              styles.selectionCircle,
              isSelected && styles.selectionCircleSelected
            ]}>
              {isSelected && (
                <Ionicons name="checkmark" size={14} color={colors.white} />
              )}
            </View>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={colors.primaryGradient} style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Social Fusion</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('NewChat')}
            >
              <Ionicons name="add" size={24} color={colors.white} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search chats..."
              placeholderTextColor="rgba(255, 255, 255, 0.4)"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearSearch}
                onPress={() => setSearchQuery('')}
              >
                <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </LinearGradient>

      {/* Selection Mode Header */}
      {isSelectionMode && (
        <View style={styles.selectionHeader}>
          <TouchableOpacity
            style={styles.cancelSelection}
            onPress={exitSelectionMode}
          >
            <Ionicons name="close" size={24} color={colors.white} />
          </TouchableOpacity>
          <Text style={styles.selectionText}>
            {selectedChats.length} selected
          </Text>
          <TouchableOpacity
            style={styles.archiveButton}
            onPress={handleArchiveSelected}
          >
            <Ionicons name="archive" size={24} color={colors.white} />
          </TouchableOpacity>
        </View>
      )}

      {/* Chat List */}
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.chatList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={colors.textSecondary}
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="chatbubbles-outline" size={64} color="rgba(255, 255, 255, 0.3)" />
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No chats found' : 'No chats yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery
                ? 'Try searching for something else'
                : 'Start a conversation to see it here'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = {
  container: {
    flex: 1,
    backgroundColor: colors.backgroundDark,
  },
  header: {
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerTitle: {
    ...typography.textStyles.h3,
    color: colors.white,
  },
  headerActions: {
    flexDirection: 'row',
  },
  headerButton: {
    ...glassmorphism.button,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.sm,
  },
  searchContainer: {
    marginTop: spacing.sm,
  },
  searchBar: {
    ...glassmorphism.input,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    ...typography.textStyles.input,
    marginLeft: spacing.sm,
    color: colors.white,
  },
  clearSearch: {
    padding: spacing.xs,
  },
  selectionHeader: {
    ...glassmorphism.navigationBar,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  cancelSelection: {
    padding: spacing.xs,
  },
  selectionText: {
    ...typography.textStyles.body1,
    color: colors.white,
    fontWeight: '600',
  },
  archiveButton: {
    padding: spacing.xs,
  },
  chatList: {
    paddingVertical: spacing.sm,
  },
  chatItem: {
    ...glassmorphism.chatListItem,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
  },
  chatItemSelected: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  avatar: {
    marginRight: spacing.md,
  },
  chatInfo: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  chatName: {
    ...typography.textStyles.body1,
    color: colors.textSecondary,
    flex: 1,
    fontWeight: '500',
  },
  chatNameUnread: {
    fontWeight: '700',
    color: colors.white,
  },
  messageTime: {
    ...typography.textStyles.caption,
    color: colors.textMuted,
    marginLeft: spacing.sm,
  },
  messageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  lastMessage: {
    ...typography.textStyles.body2,
    color: colors.textMuted,
    flex: 1,
    marginRight: spacing.sm,
  },
  lastMessageUnread: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  unreadBadge: {
    marginLeft: spacing.sm,
  },
  selectionIndicator: {
    marginLeft: spacing.sm,
  },
  selectionCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectionCircleSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing['3xl'],
  },
  emptyTitle: {
    ...typography.textStyles.h4,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  emptySubtitle: {
    ...typography.textStyles.body2,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
};

export default ChatListScreen;