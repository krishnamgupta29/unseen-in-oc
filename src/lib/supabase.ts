import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          username: string;
          password_hash: string;
          email: string | null;
          device_fingerprint: string;
          created_at: string;
          is_banned: boolean;
          report_count: number;
          avatar_url: string | null;
          bio: string;
          display_name: string | null;
          avatar_gradient: string;
          mood_tag: string;
          followers_count: number;
          following_count: number;
          posts_count: number;
        };
        Insert: {
          id?: string;
          username: string;
          password_hash: string;
          email?: string | null;
          device_fingerprint: string;
          created_at?: string;
          is_banned?: boolean;
          report_count?: number;
          avatar_url?: string | null;
          bio?: string;
          display_name?: string | null;
          avatar_gradient?: string;
          mood_tag?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
        };
        Update: {
          id?: string;
          username?: string;
          password_hash?: string;
          email?: string | null;
          device_fingerprint?: string;
          created_at?: string;
          is_banned?: boolean;
          report_count?: number;
          avatar_url?: string | null;
          bio?: string;
          display_name?: string | null;
          avatar_gradient?: string;
          mood_tag?: string;
          followers_count?: number;
          following_count?: number;
          posts_count?: number;
        };
      };
      posts: {
        Row: {
          id: string;
          user_id: string;
          content: string;
          type: string;
          voice_url: string | null;
          waveform: any | null;
          duration: string | null;
          created_at: string;
          likes_count: number;
          comments_count: number;
          is_reported: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          content: string;
          type?: string;
          voice_url?: string | null;
          waveform?: any | null;
          duration?: string | null;
          created_at?: string;
          likes_count?: number;
          comments_count?: number;
          is_reported?: boolean;
        };
        Update: {
          id?: string;
          user_id?: string;
          content?: string;
          type?: string;
          voice_url?: string | null;
          waveform?: any | null;
          duration?: string | null;
          created_at?: string;
          likes_count?: number;
          comments_count?: number;
          is_reported?: boolean;
        };
      };
      comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          likes_count: number;
        };
        Insert: {
          id?: string;
          post_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          likes_count?: number;
        };
        Update: {
          id?: string;
          post_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          likes_count?: number;
        };
      };
      likes: {
        Row: {
          id: string;
          user_id: string;
          post_id: string | null;
          comment_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string | null;
          comment_id?: string | null;
          created_at?: string;
        };
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          post_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          post_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          post_id?: string;
          created_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
      reports: {
        Row: {
          id: string;
          reporter_id: string;
          reported_user_id: string | null;
          reported_post_id: string | null;
          reason: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          reporter_id: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          reporter_id?: string;
          reported_user_id?: string | null;
          reported_post_id?: string | null;
          reason?: string | null;
          created_at?: string;
        };
      };
      rooms: {
        Row: {
          id: string;
          name: string;
          type: string;
          password_hash: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          type?: string;
          password_hash?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          type?: string;
          password_hash?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      room_members: {
        Row: {
          id: string;
          room_id: string;
          user_id: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          room_id: string;
          user_id: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          room_id?: string;
          user_id?: string;
          joined_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          room_id: string | null;
          sender_id: string;
          recipient_id: string | null;
          content: string | null;
          type: string;
          voice_url: string | null;
          waveform: any | null;
          duration: string | null;
          created_at: string;
          is_read: boolean;
        };
        Insert: {
          id?: string;
          room_id?: string | null;
          sender_id: string;
          recipient_id?: string | null;
          content?: string | null;
          type?: string;
          voice_url?: string | null;
          waveform?: any | null;
          duration?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
        Update: {
          id?: string;
          room_id?: string | null;
          sender_id?: string;
          recipient_id?: string | null;
          content?: string | null;
          type?: string;
          voice_url?: string | null;
          waveform?: any | null;
          duration?: string | null;
          created_at?: string;
          is_read?: boolean;
        };
      };
      device_tracking: {
        Row: {
          id: string;
          device_fingerprint: string;
          account_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_fingerprint: string;
          account_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_fingerprint?: string;
          account_count?: number;
          created_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          content: string;
          profile_id: string | null;
          post_id: string | null;
          conversation_id: string | null;
          is_read: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          content: string;
          profile_id?: string | null;
          post_id?: string | null;
          conversation_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: string;
          content?: string;
          profile_id?: string | null;
          post_id?: string | null;
          conversation_id?: string | null;
          is_read?: boolean;
          created_at?: string;
        };
      };
    };
  };
}
