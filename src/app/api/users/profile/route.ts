import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const username = searchParams.get('username');

    if (!userId && !username) {
      return NextResponse.json(
        { error: 'User ID or username is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('users')
      .select('id, username, display_name, bio, avatar_gradient, avatar_url, mood_tag, followers_count, following_count, posts_count, created_at');

    if (userId) {
      query = query.eq('id', userId);
    } else if (username) {
      query = query.eq('username', username);
    }

    const { data: user, error: userError } = await query.single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if current user is following this profile
    const tokenData = await getUserFromToken();
    let isFollowing = false;

    if (tokenData && tokenData.userId !== user.id) {
      const { data: follow } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', tokenData.userId)
        .eq('following_id', user.id)
        .single();

      isFollowing = !!follow;
    }

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        isFollowing,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const tokenData = await getUserFromToken();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { displayName, bio, moodTag, avatarGradient } = body;

    const updates: any = {};
    if (displayName !== undefined) updates.display_name = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (moodTag !== undefined) updates.mood_tag = moodTag;
    if (avatarGradient !== undefined) updates.avatar_gradient = avatarGradient;

    const { data: user, error: updateError } = await supabase
      .from('users')
      .update(updates)
      .eq('id', tokenData.userId)
      .select()
      .single();

    if (updateError || !user) {
      console.error('Error updating profile:', updateError);
      return NextResponse.json(
        { error: 'Failed to update profile' },
        { status: 500 }
      );
    }

    const { password_hash, device_fingerprint, ...userData } = user;

    return NextResponse.json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
