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
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    if (userId === tokenData.userId) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    // Check if already following
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', tokenData.userId)
      .eq('following_id', userId)
      .single();

    if (existingFollow) {
      // Unfollow
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', tokenData.userId)
        .eq('following_id', userId);

      // Decrement counts
      await supabase
        .from('users')
        .update({ following_count: supabase.raw('following_count - 1') })
        .eq('id', tokenData.userId);

      await supabase
        .from('users')
        .update({ followers_count: supabase.raw('GREATEST(followers_count - 1, 0)') })
        .eq('id', userId);

      return NextResponse.json({
        success: true,
        following: false,
      });
    } else {
      // Follow
      await supabase
        .from('follows')
        .insert({
          follower_id: tokenData.userId,
          following_id: userId,
        });

      // Increment counts
      await supabase
        .from('users')
        .update({ following_count: supabase.raw('following_count + 1') })
        .eq('id', tokenData.userId);

      await supabase
        .from('users')
        .update({ followers_count: supabase.raw('followers_count + 1') })
        .eq('id', userId);

      // Create notification
      await supabase
        .from('notifications')
        .insert({
          user_id: userId,
          type: 'follow',
          content: 'A new soul started following you',
          profile_id: tokenData.userId,
        });

      return NextResponse.json({
        success: true,
        following: true,
      });
    }
  } catch (error) {
    console.error('Follow user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
