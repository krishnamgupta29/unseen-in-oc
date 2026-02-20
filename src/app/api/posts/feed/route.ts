import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    const tokenData = await getUserFromToken();
    const currentUserId = tokenData?.userId;

    // Fetch posts with user data
    const { data: posts, error: postsError } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient,
          mood_tag
        )
      `)
      .eq('is_reported', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (postsError) {
      console.error('Error fetching posts:', postsError);
      return NextResponse.json(
        { error: 'Failed to fetch posts' },
        { status: 500 }
      );
    }

    // If user is logged in, check likes and saves
    let postsWithUserData = posts;

    if (currentUserId) {
      const postIds = posts.map(p => p.id);

      // Get user's likes
      const { data: likes } = await supabase
        .from('likes')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const likedPostIds = new Set(likes?.map(l => l.post_id) || []);

      // Get user's saves
      const { data: saves } = await supabase
        .from('saves')
        .select('post_id')
        .eq('user_id', currentUserId)
        .in('post_id', postIds);

      const savedPostIds = new Set(saves?.map(s => s.post_id) || []);

      postsWithUserData = posts.map(post => ({
        ...post,
        isLiked: likedPostIds.has(post.id),
        isSaved: savedPostIds.has(post.id),
      }));
    }

    return NextResponse.json({
      success: true,
      posts: postsWithUserData,
      page,
      limit,
    });
  } catch (error) {
    console.error('Feed error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
