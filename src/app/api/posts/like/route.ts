import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const tokenData = await getUserFromToken();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { postId } = body;

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Check if already liked
    const { data: existingLike } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', tokenData.userId)
      .eq('post_id', postId)
      .single();

    if (existingLike) {
      // Unlike
      await supabase
        .from('likes')
        .delete()
        .eq('user_id', tokenData.userId)
        .eq('post_id', postId);

      // Decrement likes count
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ likes_count: Math.max(0, post.likes_count - 1) })
          .eq('id', postId);
      }

      return NextResponse.json({
        success: true,
        liked: false,
      });
    } else {
      // Like
      await supabase
        .from('likes')
        .insert({
          user_id: tokenData.userId,
          post_id: postId,
        });

      // Increment likes count
      const { data: post } = await supabase
        .from('posts')
        .select('likes_count, user_id')
        .eq('id', postId)
        .single();

      if (post) {
        await supabase
          .from('posts')
          .update({ likes_count: post.likes_count + 1 })
          .eq('id', postId);

        // Create notification for post owner (if not self-like)
        if (post.user_id !== tokenData.userId) {
          await supabase
            .from('notifications')
            .insert({
              user_id: post.user_id,
              type: 'reaction',
              content: 'Someone felt your post ❤️',
              profile_id: tokenData.userId,
              post_id: postId,
            });
        }
      }

      return NextResponse.json({
        success: true,
        liked: true,
      });
    }
  } catch (error) {
    console.error('Like post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
