-- Social Fusion App Database Schema
-- PostgreSQL with Supabase extensions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.settings.jwt_secret" TO 'your-jwt-secret';

-- ========================================
-- CORE TABLES
-- ========================================

-- Users table
CREATE TABLE users (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  last_seen TIMESTAMP WITH TIME ZONE,
  is_online BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chats table
CREATE TABLE chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  is_group BOOLEAN DEFAULT FALSE,
  group_name TEXT,
  group_description TEXT,
  group_avatar_url TEXT,
  created_by UUID REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User chat relationships (junction table)
CREATE TABLE user_chats (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_read_at TIMESTAMP WITH TIME ZONE,
  is_archived BOOLEAN DEFAULT FALSE,
  is_muted BOOLEAN DEFAULT FALSE,
  PRIMARY KEY (user_id, chat_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'file', 'voice', 'location')),
  media_url TEXT,
  media_metadata JSONB,
  reply_to_id UUID REFERENCES messages(id) ON DELETE SET NULL,
  is_deleted BOOLEAN DEFAULT FALSE,
  is_edited BOOLEAN DEFAULT FALSE,
  edited_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message read receipts
CREATE TABLE message_read_receipts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(message_id, user_id)
);

-- ========================================
-- STATUS UPDATES
-- ========================================

-- Status updates table (WhatsApp-style 24-hour status)
CREATE TABLE status_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  media_url TEXT,
  media_type TEXT CHECK (media_type IN ('image', 'video')),
  background_gradient JSONB,
  privacy TEXT DEFAULT 'all_contacts' CHECK (privacy IN ('all_contacts', 'selected_contacts')),
  view_count INTEGER DEFAULT 0,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '24 hours'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Status views tracking
CREATE TABLE status_views (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  status_id UUID REFERENCES status_updates(id) ON DELETE CASCADE,
  viewer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(status_id, viewer_id)
);

-- ========================================
-- CONTACTS MANAGEMENT
-- ========================================

-- User contacts/following system
CREATE TABLE user_contacts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
  addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'blocked')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  accepted_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(requester_id, addressee_id),
  CHECK(requester_id != addressee_id)
);

-- ========================================
-- AI FEATURES
-- ========================================

-- AI interactions tracking
CREATE TABLE ai_interactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  message_context TEXT,
  suggestion_type TEXT CHECK (suggestion_type IN ('reply', 'emoji', 'summary', 'correction')),
  suggestions JSONB,
  user_accepted BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- NOTIFICATIONS
-- ========================================

-- Notifications table
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('message', 'chat_invite', 'contact_request', 'status_view', 'ai_suggestion')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- INDEXES FOR PERFORMANCE
-- ========================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_last_seen ON users(last_seen);

-- Chats indexes
CREATE INDEX idx_chats_last_message_at ON chats(last_message_at DESC);
CREATE INDEX idx_chats_created_by ON chats(created_by);

-- Messages indexes
CREATE INDEX idx_messages_chat_id ON messages(chat_id);
CREATE INDEX idx_messages_sender_id ON messages(sender_id);
CREATE INDEX idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX idx_messages_reply_to_id ON messages(reply_to_id);
CREATE INDEX idx_messages_chat_created ON messages(chat_id, created_at DESC);

-- User chats indexes
CREATE INDEX idx_user_chats_user_id ON user_chats(user_id);
CREATE INDEX idx_user_chats_chat_id ON user_chats(chat_id);
CREATE INDEX idx_user_chats_joined_at ON user_chats(joined_at DESC);

-- Message read receipts indexes
CREATE INDEX idx_message_read_receipts_message_id ON message_read_receipts(message_id);
CREATE INDEX idx_message_read_receipts_user_id ON message_read_receipts(user_id);

-- Status updates indexes
CREATE INDEX idx_status_updates_user_id ON status_updates(user_id);
CREATE INDEX idx_status_updates_created_at ON status_updates(created_at DESC);
CREATE INDEX idx_status_updates_expires_at ON status_updates(expires_at);

-- Status views indexes
CREATE INDEX idx_status_views_status_id ON status_views(status_id);
CREATE INDEX idx_status_views_viewer_id ON status_views(viewer_id);

-- User contacts indexes
CREATE INDEX idx_user_contacts_requester_id ON user_contacts(requester_id);
CREATE INDEX idx_user_contacts_addressee_id ON user_contacts(addressee_id);
CREATE INDEX idx_user_contacts_status ON user_contacts(status);

-- AI interactions indexes
CREATE INDEX idx_ai_interactions_user_id ON ai_interactions(user_id);
CREATE INDEX idx_ai_interactions_created_at ON ai_interactions(created_at DESC);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ========================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_read_receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users RLS policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can view public profiles" ON users FOR SELECT USING (
  id IN (
    SELECT addressee_id FROM user_contacts
    WHERE requester_id = auth.uid() AND status = 'accepted'
  ) OR
  id IN (
    SELECT requester_id FROM user_contacts
    WHERE addressee_id = auth.uid() AND status = 'accepted'
  )
);

-- Chats RLS policies
CREATE POLICY "Users can view chats they participate in" ON chats FOR SELECT USING (
  id IN (
    SELECT chat_id FROM user_chats
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can create chats" ON chats FOR INSERT WITH CHECK (created_by = auth.uid());

-- User chats RLS policies
CREATE POLICY "Users can view their chat memberships" ON user_chats FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their chat memberships" ON user_chats FOR ALL USING (user_id = auth.uid());

-- Messages RLS policies
CREATE POLICY "Users can view messages in their chats" ON messages FOR SELECT USING (
  chat_id IN (
    SELECT chat_id FROM user_chats
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in their chats" ON messages FOR INSERT WITH CHECK (
  sender_id = auth.uid() AND
  chat_id IN (
    SELECT chat_id FROM user_chats
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own messages" ON messages FOR UPDATE USING (sender_id = auth.uid());

-- Message read receipts RLS policies
CREATE POLICY "Users can manage their read receipts" ON message_read_receipts FOR ALL USING (user_id = auth.uid());

-- Status updates RLS policies
CREATE POLICY "Users can view statuses from contacts" ON status_updates FOR SELECT USING (
  privacy = 'all_contacts' OR
  user_id = auth.uid() OR
  user_id IN (
    SELECT addressee_id FROM user_contacts
    WHERE requester_id = auth.uid() AND status = 'accepted'
  ) OR
  user_id IN (
    SELECT requester_id FROM user_contacts
    WHERE addressee_id = auth.uid() AND status = 'accepted'
  )
);

CREATE POLICY "Users can create their own statuses" ON status_updates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update their own statuses" ON status_updates FOR UPDATE USING (user_id = auth.uid());

-- Status views RLS policies
CREATE POLICY "Users can manage their status views" ON status_views FOR ALL USING (viewer_id = auth.uid());

-- User contacts RLS policies
CREATE POLICY "Users can view their contacts" ON user_contacts FOR SELECT USING (
  requester_id = auth.uid() OR addressee_id = auth.uid()
);

CREATE POLICY "Users can manage their contact requests" ON user_contacts FOR ALL USING (
  requester_id = auth.uid() OR addressee_id = auth.uid()
);

-- AI interactions RLS policies
CREATE POLICY "Users can manage their AI interactions" ON ai_interactions FOR ALL USING (user_id = auth.uid());

-- Notifications RLS policies
CREATE POLICY "Users can manage their notifications" ON notifications FOR ALL USING (user_id = auth.uid());

-- ========================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- ========================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chats_updated_at BEFORE UPDATE ON chats FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Update last_message_at on chats when new message is added
CREATE OR REPLACE FUNCTION update_chat_last_message_at()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chats SET last_message_at = NEW.created_at WHERE id = NEW.chat_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_chat_last_message_at_trigger AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_chat_last_message_at();

-- Increment status view count
CREATE OR REPLACE FUNCTION increment_status_view_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE status_updates SET view_count = view_count + 1 WHERE id = NEW.status_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER increment_status_view_count_trigger AFTER INSERT ON status_views FOR EACH ROW EXECUTE FUNCTION increment_status_view_count();

-- ========================================
-- FUNCTIONS FOR COMMON OPERATIONS
-- ========================================

-- Function to get user's chat list with last message and unread count
CREATE OR REPLACE FUNCTION get_user_chats(user_uuid UUID)
RETURNS TABLE (
  chat_id UUID,
  is_group BOOLEAN,
  group_name TEXT,
  group_avatar_url TEXT,
  last_message_content TEXT,
  last_message_created_at TIMESTAMP WITH TIME ZONE,
  last_message_sender_name TEXT,
  unread_count INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.id,
        c.is_group,
        c.group_name,
        c.group_avatar_url,
        m.content as last_message_content,
        m.created_at as last_message_created_at,
        u.full_name as last_message_sender_name,
        COALESCE(
            (SELECT COUNT(*)
             FROM messages m2
             WHERE m2.chat_id = c.id
             AND m2.created_at > COALESCE(uc.last_read_at, '1970-01-01')
             AND m2.sender_id != user_uuid
             AND m2.is_deleted = FALSE),
            0
        ) as unread_count
    FROM user_chats uc
    JOIN chats c ON uc.chat_id = c.id
    LEFT JOIN messages m ON m.id = (
        SELECT id FROM messages
        WHERE chat_id = c.id
        AND is_deleted = FALSE
        ORDER BY created_at DESC
        LIMIT 1
    )
    LEFT JOIN users u ON m.sender_id = u.id
    WHERE uc.user_id = user_uuid
    AND uc.is_archived = FALSE
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to get users not in contacts for discovery
CREATE OR REPLACE FUNCTION get_non_contact_users(user_uuid UUID, limit_count INTEGER DEFAULT 50)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        u.id,
        u.username,
        u.full_name,
        u.avatar_url
    FROM users u
    WHERE u.id != user_uuid
    AND u.id NOT IN (
        SELECT addressee_id FROM user_contacts WHERE requester_id = user_uuid AND status = 'accepted'
        UNION
        SELECT requester_id FROM user_contacts WHERE addressee_id = user_uuid AND status = 'accepted'
    )
    AND u.id NOT IN (
        SELECT requester_id FROM user_contacts
        WHERE addressee_id = user_uuid AND status IN ('pending', 'blocked')
        UNION
        SELECT addressee_id FROM user_contacts
        WHERE requester_id = user_uuid AND status IN ('pending', 'blocked')
    )
    LIMIT limit_count;
END;
$$ LANGUAGE plpgsql;