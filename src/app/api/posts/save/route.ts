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

    // Check if already saved
    const { data: existingSave } = await supabase
      .from('saves')
      .select('id')
      .eq('user_id', tokenData.userId)
      .eq('post_id', postId)
      .single();

    if (existingSave) {
      // Unsave
      await supabase
        .from('saves')
        .delete()
        .eq('user_id', tokenData.userId)
        .eq('post_id', postId);

      return NextResponse.json({
        success: true,
        saved: false,
      });
    } else {
      // Save
      await supabase
        .from('saves')
        .insert({
          user_id: tokenData.userId,
          post_id: postId,
        });

      return NextResponse.json({
        success: true,
        saved: true,
      });
    }
  } catch (error) {
    console.error('Save post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getUserFromToken();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch saved posts
    const { data: saves, error: savesError } = await supabase
      .from('saves')
      .select(`
        post_id,
        posts (
          *,
          users!posts_user_id_fkey (
            id,
            username,
            display_name,
            avatar_gradient,
            mood_tag
          )
        )
      `)
      .eq('user_id', tokenData.userId)
      .order('created_at', { ascending: false });

    if (savesError) {
      console.error('Error fetching saved posts:', savesError);
      return NextResponse.json(
        { error: 'Failed to fetch saved posts' },
        { status: 500 }
      );
    }

    const posts = saves?.map(s => ({ ...s.posts, isSaved: true })) || [];

    return NextResponse.json({
      success: true,
      posts,
    });
  } catch (error) {
    console.error('Get saved posts error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
