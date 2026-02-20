---
title: UNSEEN Backend Integration
status: draft
created: 2026-02-20
---

# UNSEEN Backend Integration Requirements

## Project Overview
Convert the existing UNSEEN frontend into a fully working production-ready app by adding backend functionality, database, and authentication WITHOUT changing any frontend design, layout, styling, animations, colors, or UI structure.

## Critical Constraints
- ✅ KEEP existing frontend UI exactly the same
- ✅ KEEP all existing components, styles, animations
- ✅ KEEP current color scheme and layout
- ❌ DO NOT redesign or modify frontend visuals
- ✅ ONLY add backend functionality and data persistence

## Technology Stack
- **Database**: Supabase PostgreSQL
- **Authentication**: JWT + bcrypt password hashing
- **Realtime**: Supabase Realtime for messaging
- **Storage**: Supabase Storage for voice files and avatars
- **API**: Next.js API Routes
- **AI Chat**: External AI API integration

## User Stories

### US-1: Database Setup
**As a** developer  
**I want** to set up Supabase PostgreSQL database with all required tables  
**So that** the app can store and retrieve data persistently

**Acceptance Criteria:**
- Supabase project is created and configured
- Database schema includes all required tables:
  - users (id, username, password_hash, email, device_fingerprint, created_at, is_banned, report_count)
  - posts (id, user_id, content, created_at, likes_count, comments_count, is_reported)
  - messages (id, room_id, sender_id, content, type, voice_url, created_at)
  - comments (id, post_id, user_id, content, parent_id, created_at, likes_count)
  - likes (id, user_id, post_id, comment_id, created_at)
  - reports (id, reporter_id, reported_user_id, reported_post_id, reason, created_at)
  - rooms (id, name, type, password_hash, created_by, created_at)
  - room_members (id, room_id, user_id, joined_at)
  - device_tracking (id, device_fingerprint, account_count, created_at)
- Row Level Security (RLS) policies are configured
- Environment variables are set up (.env.local)

### US-2: Authentication Backend
**As a** user  
**I want** to sign up and log in using the existing UI  
**So that** I can access the platform securely

**Acceptance Criteria:**
- Signup API endpoint created (/api/auth/signup)
- Login API endpoint created (/api/auth/login)
- Logout API endpoint created (/api/auth/logout)
- Username generation from dice button works with backend
- Password is hashed using bcrypt before storage
- Device fingerprint is captured and stored
- JWT token is generated on successful login
- Session management is implemented
- Existing AuthScreen component connects to backend without UI changes

### US-3: Device Limit System
**As a** platform administrator  
**I want** to limit account creation to 3 per device  
**So that** spam and abuse are minimized

**Acceptance Criteria:**
- Device fingerprint is generated using browser fingerprinting
- Signup checks device_tracking table before allowing registration
- Maximum 3 accounts per device fingerprint enforced
- Clear error message shown when limit exceeded
- Existing signup UI shows error without design changes

### US-4: Feed Backend
**As a** user  
**I want** to create, view, like, comment, save, and report posts  
**So that** I can interact with content on the platform

**Acceptance Criteria:**
- Create post API endpoint (/api/posts/create)
- Fetch posts API endpoint (/api/posts/feed)
- Like/unlike post API endpoint (/api/posts/like)
- Comment on post API endpoint (/api/posts/comment)
- Save/unsave post API endpoint (/api/posts/save)
- Report post API endpoint (/api/posts/report)
- Existing Feed, CreatePostModal, CommentsPanel components connect to backend
- Real-time updates for likes and comments
- No changes to existing UI components

### US-5: Report and Auto-Ban System
**As a** platform moderator  
**I want** users to be automatically banned after 10 reports  
**So that** harmful content and users are removed automatically

**Acceptance Criteria:**
- Report counter increments in users table
- When report_count >= 10, is_banned flag is set to true
- Banned users cannot log in
- Banned users' posts are hidden from feed
- Clear message shown to banned users on login attempt
- Existing UI shows appropriate error messages

### US-6: Messaging Backend
**As a** user  
**I want** to send and receive real-time text and voice messages  
**So that** I can communicate with other users privately

**Acceptance Criteria:**
- Send message API endpoint (/api/messages/send)
- Fetch messages API endpoint (/api/messages/fetch)
- Supabase Realtime subscription for new messages
- Text messages stored in database
- Voice messages uploaded to Supabase Storage
- Voice message URLs stored in database
- Existing Chat components connect to backend
- Real-time message updates work seamlessly
- No changes to existing chat UI

### US-7: AI Chat Backend
**As a** user  
**I want** to chat with an AI assistant  
**So that** I can get support and companionship

**Acceptance Criteria:**
- AI chat API endpoint created (/api/ai-chat)
- Integration with AI service (OpenAI/Anthropic/Gemini)
- Text responses generated
- Voice responses generated (text-to-speech)
- Existing AI chat UI connects to backend
- Streaming responses supported
- No changes to existing AI chat UI

### US-8: Room Backend
**As a** user  
**I want** to create and join chat rooms with voice support  
**So that** I can participate in group conversations

**Acceptance Criteria:**
- Create room API endpoint (/api/rooms/create)
- Join room API endpoint (/api/rooms/join)
- Leave room API endpoint (/api/rooms/leave)
- Fetch rooms API endpoint (/api/rooms/list)
- Private room password auto-generated
- Voice chat support in rooms
- Room messages stored in messages table
- Existing room UI connects to backend
- No changes to existing room UI

### US-9: Storage Setup
**As a** user  
**I want** to upload voice files and avatars  
**So that** I can personalize my experience

**Acceptance Criteria:**
- Supabase Storage buckets created (voice-messages, avatars)
- Upload API endpoints created
- File size limits enforced (voice: 5MB, avatars: 2MB)
- File type validation (voice: audio/*, avatars: image/*)
- Secure URLs generated for uploaded files
- Existing upload UI connects to backend
- No changes to existing upload UI

### US-10: Security Implementation
**As a** developer  
**I want** to implement security best practices  
**So that** user data and the platform are protected

**Acceptance Criteria:**
- All passwords hashed with bcrypt (salt rounds: 10)
- JWT tokens used for authentication
- Protected API routes require valid JWT
- Environment variables secured
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)
- CSRF protection enabled
- Rate limiting implemented on sensitive endpoints

### US-11: Deployment
**As a** developer  
**I want** to deploy the backend safely  
**So that** the app works in production without breaking existing frontend

**Acceptance Criteria:**
- Environment variables configured in Vercel
- Supabase connection tested in production
- All API endpoints tested and working
- Frontend deployment unchanged
- No breaking changes to existing UI
- Performance optimized
- Error logging configured

## Technical Implementation Notes

### Database Schema
```sql
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
  bio TEXT,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  posts_count INTEGER DEFAULT 0
);

-- Posts table
CREATE TABLE posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_reported BOOLEAN DEFAULT FALSE
);

-- Messages table
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE CASCADE,
  content TEXT,
  type VARCHAR(20) DEFAULT 'text',
  voice_url TEXT,
  created_at TIMESTAMP DEFAULT NOW()
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
  UNIQUE(user_id, comment_id)
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

-- Device tracking table
CREATE TABLE device_tracking (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  device_fingerprint TEXT UNIQUE NOT NULL,
  account_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### API Routes Structure
```
/api
  /auth
    /signup - POST
    /login - POST
    /logout - POST
    /me - GET
  /posts
    /create - POST
    /feed - GET
    /[id] - GET
    /like - POST
    /comment - POST
    /save - POST
    /report - POST
  /messages
    /send - POST
    /fetch - GET
  /rooms
    /create - POST
    /join - POST
    /leave - POST
    /list - GET
  /ai-chat - POST
  /upload
    /voice - POST
    /avatar - POST
```

### Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
JWT_SECRET=
AI_API_KEY=
```

## Implementation Tasks

### Phase 1: Database Setup (Priority: High)
- [ ] Create Supabase project
- [ ] Run database migrations
- [ ] Configure RLS policies
- [ ] Set up storage buckets
- [ ] Test database connections

### Phase 2: Authentication (Priority: High)
- [ ] Create auth API routes
- [ ] Implement JWT generation/validation
- [ ] Add bcrypt password hashing
- [ ] Implement device fingerprinting
- [ ] Connect AuthScreen to backend
- [ ] Add session management

### Phase 3: Device Limiting (Priority: High)
- [ ] Implement device tracking logic
- [ ] Add signup validation
- [ ] Test device limit enforcement

### Phase 4: Feed Backend (Priority: High)
- [ ] Create posts API routes
- [ ] Implement CRUD operations
- [ ] Add like/unlike functionality
- [ ] Add comment functionality
- [ ] Add save functionality
- [ ] Add report functionality
- [ ] Connect Feed components to backend

### Phase 5: Report & Ban System (Priority: Medium)
- [ ] Implement report counter
- [ ] Add auto-ban trigger
- [ ] Add ban check on login
- [ ] Hide banned users' posts

### Phase 6: Messaging (Priority: Medium)
- [ ] Create messages API routes
- [ ] Set up Supabase Realtime
- [ ] Implement text messaging
- [ ] Implement voice messaging
- [ ] Connect Chat components to backend

### Phase 7: AI Chat (Priority: Low)
- [ ] Create AI chat API endpoint
- [ ] Integrate AI service
- [ ] Add text response generation
- [ ] Add voice response generation
- [ ] Connect AI chat UI to backend

### Phase 8: Rooms (Priority: Low)
- [ ] Create rooms API routes
- [ ] Implement room creation
- [ ] Implement room joining
- [ ] Add password generation
- [ ] Add voice chat support
- [ ] Connect room UI to backend

### Phase 9: Storage (Priority: Medium)
- [ ] Set up Supabase Storage
- [ ] Create upload API routes
- [ ] Add file validation
- [ ] Connect upload UI to backend

### Phase 10: Security (Priority: High)
- [ ] Implement JWT middleware
- [ ] Add input sanitization
- [ ] Add rate limiting
- [ ] Test security measures

### Phase 11: Testing & Deployment (Priority: High)
- [ ] Test all API endpoints
- [ ] Test frontend integration
- [ ] Configure production environment
- [ ] Deploy to Vercel
- [ ] Monitor for errors

## Success Criteria
- All backend functionality works correctly
- Frontend UI remains exactly the same
- No visual changes to existing components
- All user interactions persist to database
- Real-time features work seamlessly
- Security measures are in place
- App is production-ready

## Notes
- Use existing component structure - only modify data fetching logic
- Keep all existing state management in AppContext
- Add API calls without changing component UI
- Maintain existing animations and transitions
- Preserve all existing styling and themes
