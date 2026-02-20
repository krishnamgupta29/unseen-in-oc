-- UNSEEN Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  email VARCHAR(255),
  device_fingerprint TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_banned BOOLEAN DEFAULT FALSE,
  report_count INTEGER DEFAULT 0,
  avatar_url TEXT,
  bio TEXT DEFAULT 'New to UNSEEN',
  display_name VARCHAR(100),
  avatar_gradient TEXT DEFAULT 'from-violet-600 via-purple-600 to-indigo-600',
  mood_tag TEXT DEFAULT '✨ feeling reflective',
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'text',
  voice_url TEXT,
  waveform JSONB,
  duration VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0
);

-- Likes table
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (
    (post_id IS NOT NULL AND comment_id IS NULL) OR
    (post_id IS NULL AND comment_id IS NOT NULL)
  )
);

-- Saves table
CREATE TABLE IF NOT EXISTS saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Follows table
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'public',
  password_hash TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room members table
CREATE TABLE IF NOT EXISTS room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipient_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) DEFAULT 'text',
  voice_url TEXT,
  waveform JSONB,
  duration VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  is_read BOOLEAN DEFAULT FALSE
);

-- Device tracking table
CREATE TABLE IF NOT EXISTS device_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_fingerprint TEXT UNIQUE NOT NULL,
  account_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  profile_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  conversation_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_room_id ON messages(room_id);
CREATE INDEX IF NOT EXISTS idx_messages_recipient ON messages(recipient_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);

-- Function to update report count
CREATE OR REPLACE FUNCTION update_report_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET report_count = report_count + 1
  WHERE id = NEW.reported_user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update report count
DROP TRIGGER IF EXISTS update_user_report_count ON reports;
CREATE TRIGGER update_user_report_count
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION update_report_count();

-- Function to auto-ban users with 10+ reports
CREATE OR REPLACE FUNCTION check_and_ban_user()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET is_banned = TRUE
  WHERE id = NEW.reported_user_id
    AND report_count >= 10;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to check and ban user
DROP TRIGGER IF EXISTS increment_report_count ON reports;
CREATE TRIGGER increment_report_count
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION check_and_ban_user();

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saves ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_tracking ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users policies (allow public read for profiles)
DROP POLICY IF EXISTS "Users can view all profiles" ON users;
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert own profile" ON users;
CREATE POLICY "Users can insert own profile" ON users FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own profile" ON users;
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (true);

-- Posts policies
DROP POLICY IF EXISTS "Anyone can view posts" ON posts;
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create posts" ON posts;
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update own posts" ON posts;
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Users can delete own posts" ON posts;
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (true);

-- Comments policies
DROP POLICY IF EXISTS "Anyone can view comments" ON comments;
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create comments" ON comments;
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Users can delete own comments" ON comments;
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (true);

-- Likes policies
DROP POLICY IF EXISTS "Anyone can view likes" ON likes;
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own likes" ON likes;
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (true);

-- Saves policies
DROP POLICY IF EXISTS "Users can view own saves" ON saves;
CREATE POLICY "Users can view own saves" ON saves FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own saves" ON saves;
CREATE POLICY "Users can manage own saves" ON saves FOR ALL USING (true);

-- Follows policies
DROP POLICY IF EXISTS "Anyone can view follows" ON follows;
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can manage own follows" ON follows;
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (true);

-- Reports policies
DROP POLICY IF EXISTS "Users can create reports" ON reports;
CREATE POLICY "Users can create reports" ON reports FOR INSERT WITH CHECK (true);

-- Messages policies
DROP POLICY IF EXISTS "Users can view own messages" ON messages;
CREATE POLICY "Users can view own messages" ON messages FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can send messages" ON messages;
CREATE POLICY "Users can send messages" ON messages FOR INSERT WITH CHECK (true);

-- Notifications policies
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (true);

DROP POLICY IF EXISTS "System can create notifications" ON notifications;
CREATE POLICY "System can create notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Device tracking policies
DROP POLICY IF EXISTS "Anyone can read device tracking" ON device_tracking;
CREATE POLICY "Anyone can read device tracking" ON device_tracking FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can insert device tracking" ON device_tracking;
CREATE POLICY "Anyone can insert device tracking" ON device_tracking FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update device tracking" ON device_tracking;
CREATE POLICY "Anyone can update device tracking" ON device_tracking FOR UPDATE USING (true);

-- Rooms policies
DROP POLICY IF EXISTS "Anyone can view rooms" ON rooms;
CREATE POLICY "Anyone can view rooms" ON rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can create rooms" ON rooms;
CREATE POLICY "Users can create rooms" ON rooms FOR INSERT WITH CHECK (true);

-- Room members policies
DROP POLICY IF EXISTS "Anyone can view room members" ON room_members;
CREATE POLICY "Anyone can view room members" ON room_members FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join rooms" ON room_members;
CREATE POLICY "Users can join rooms" ON room_members FOR INSERT WITH CHECK (true);
