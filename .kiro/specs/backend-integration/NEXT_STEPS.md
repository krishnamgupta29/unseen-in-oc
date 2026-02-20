---
title: UNSEEN Backend Integration - Next Steps
status: in-progress
---

# Next Steps for Backend Integration

## ✅ Completed
- [x] Demo data removed from mock-data.ts
- [x] Type definitions preserved
- [x] App still running without errors
- [x] Specification documents created

## 🚀 Ready to Start: Phase 1 - Database & Authentication

### Step 1: Set Up Supabase Project

1. **Create Supabase Account & Project**
   - Go to https://supabase.com
   - Create new project
   - Note down:
     - Project URL
     - Anon/Public Key
     - Service Role Key (keep secret!)

2. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

3. **Create Environment Variables**
   Create `.env.local` file:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   JWT_SECRET=generate_random_secret_here
   ```

### Step 2: Create Database Schema

Run this SQL in Supabase SQL Editor:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
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
CREATE TABLE posts (
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
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0
);

-- Likes table
CREATE TABLE likes (
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
CREATE TABLE saves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, post_id)
);

-- Follows table
CREATE TABLE follows (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id UUID REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Reports table
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reported_post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Rooms table
CREATE TABLE rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) DEFAULT 'public',
  password_hash TEXT,
  created_by UUID REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Room members table
CREATE TABLE room_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- Messages table
CREATE TABLE messages (
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
CREATE TABLE device_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_fingerprint TEXT UNIQUE NOT NULL,
  account_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
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
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
CREATE INDEX idx_messages_room_id ON messages(room_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);

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

-- Trigger to increment report count and check for ban
CREATE TRIGGER increment_report_count
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION check_and_ban_user();

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
CREATE TRIGGER update_user_report_count
AFTER INSERT ON reports
FOR EACH ROW
EXECUTE FUNCTION update_report_count();
```

### Step 3: Set Up Row Level Security (RLS)

```sql
-- Enable RLS on all tables
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

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Posts policies
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can manage own likes" ON likes FOR ALL USING (auth.uid() = user_id);

-- Saves policies
CREATE POLICY "Users can view own saves" ON saves FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own saves" ON saves FOR ALL USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Anyone can view follows" ON follows FOR SELECT USING (true);
CREATE POLICY "Users can manage own follows" ON follows FOR ALL USING (auth.uid() = follower_id);

-- Messages policies
CREATE POLICY "Users can view own messages" ON messages 
  FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users can send messages" ON messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON notifications 
  FOR SELECT USING (auth.uid() = user_id);
```

### Step 4: Create Storage Buckets

In Supabase Dashboard > Storage:

1. Create bucket: `voice-messages`
   - Public: No
   - File size limit: 5MB
   - Allowed MIME types: audio/*

2. Create bucket: `avatars`
   - Public: Yes
   - File size limit: 2MB
   - Allowed MIME types: image/*

### Step 5: Install Required Dependencies

```bash
npm install @fingerprintjs/fingerprintjs bcryptjs jsonwebtoken
npm install -D @types/bcryptjs @types/jsonwebtoken
```

### Step 6: Create Supabase Client Utility

Create `src/lib/supabase.ts`

### Step 7: Create API Routes

Start with authentication:
- `/api/auth/signup`
- `/api/auth/login`
- `/api/auth/logout`
- `/api/auth/me`

## 📋 Implementation Checklist

- [ ] Supabase project created
- [ ] Environment variables configured
- [ ] Database schema created
- [ ] RLS policies set up
- [ ] Storage buckets created
- [ ] Dependencies installed
- [ ] Supabase client utility created
- [ ] Authentication API routes created
- [ ] Device fingerprinting implemented
- [ ] Frontend connected to auth APIs

## 🎯 Success Criteria

After completing Phase 1, you should be able to:
- Sign up new users
- Log in existing users
- Device fingerprinting works
- Maximum 3 accounts per device enforced
- JWT tokens generated and validated
- Session persists across page refreshes
- Existing UI unchanged

## 📝 Notes

- Keep all existing UI components unchanged
- Only modify data fetching logic in AppContext
- Test each API endpoint before moving to next
- Use Postman or Thunder Client to test APIs
- Check Supabase Dashboard to verify data is being stored

## 🔜 After Phase 1

Once authentication is complete, we'll move to:
- Phase 2: Posts Feed Backend
- Phase 3: Messaging System
- Phase 4: AI Chat & Rooms
- Phase 5: Testing & Deployment
