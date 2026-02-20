export interface Profile {
  id: string;
  username: string;
  displayName: string;
  bio: string;
  avatarGradient: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  highlights: string[];
  isFollowing?: boolean;
  moodTag?: string;
}

export interface Post {
  id: string;
  profileId: string;
  type: 'text' | 'voice';
  content: string;
  timestamp: string;
  likes: number;
  comments: number;
  waveform?: number[];
  duration?: string;
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: string;
  isMe: boolean;
  type?: 'text' | 'voice';
  waveform?: number[];
  duration?: string;
}

export interface Conversation {
  id: string;
  profileId: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: Message[];
}

export interface Notification {
  id: string;
  type: 'reaction' | 'message' | 'reply' | 'follow';
  content: string;
  timestamp: string;
  read: boolean;
  profileId: string;
  postId?: string;
  conversationId?: string;
}

export interface Comment {
  id: string;
  postId: string;
  content: string;
  timestamp: string;
  likes: number;
  isLiked?: boolean;
  parentId?: string;
}

// Empty initial comments - will be populated from database
export const initialComments: Record<string, Comment[]> = {};

export const moodTags = [
  '✨ feeling reflective',
  '🌙 late night thoughts',
  '💭 overthinking again',
  '🤍 healing slowly',
  '🖤 in my feels',
  '☁️ floating somewhere',
  '🌧️ heavy heart today',
  '🔥 raw and unfiltered',
  '💫 hopeful',
  '🍃 letting go',
];

export const profileThemes = [
  { id: 'violet', gradient: 'from-violet-600 via-purple-600 to-indigo-600', label: 'Violet Dream' },
  { id: 'ocean', gradient: 'from-cyan-400 via-blue-500 to-indigo-600', label: 'Ocean Deep' },
  { id: 'sunset', gradient: 'from-rose-400 via-pink-500 to-purple-600', label: 'Sunset Glow' },
  { id: 'ember', gradient: 'from-amber-400 via-orange-500 to-red-500', label: 'Ember Warm' },
  { id: 'forest', gradient: 'from-emerald-400 via-teal-500 to-cyan-600', label: 'Forest Calm' },
  { id: 'midnight', gradient: 'from-slate-400 via-zinc-500 to-neutral-600', label: 'Midnight Grey' },
  { id: 'aurora', gradient: 'from-indigo-400 via-purple-500 to-pink-500', label: 'Aurora' },
  { id: 'sky', gradient: 'from-sky-400 via-blue-500 to-indigo-600', label: 'Clear Sky' },
];

// Empty profiles array - will be populated from database
export const profiles: Profile[] = [];

// Empty posts array - will be populated from database
export const posts: Post[] = [];

// Empty conversations array - will be populated from database
export const conversations: Conversation[] = [];

// Empty notifications array - will be populated from database
export const notifications: Notification[] = [];

// Default current user - will be replaced with actual user data after login
export const currentUser: Profile = {
  id: 'me',
  username: 'guest_user',
  displayName: 'Guest User',
  bio: 'New to UNSEEN',
  avatarGradient: 'from-violet-600 via-purple-600 to-indigo-600',
  postsCount: 0,
  followersCount: 0,
  followingCount: 0,
  highlights: [],
  moodTag: '✨ feeling reflective',
};

export const getProfile = (id: string): Profile | undefined => {
  if (id === 'me') return currentUser;
  return profiles.find(p => p.id === id);
};

export const getPostsByProfile = (profileId: string): Post[] => {
  return posts.filter(p => p.profileId === profileId);
};

export const getConversation = (id: string): Conversation | undefined => {
  return conversations.find(c => c.id === id);
};
