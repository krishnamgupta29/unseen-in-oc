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
    const { postId, content, parentId } = body;

    if (!postId || !content) {
      return NextResponse.json(
        { error: 'Post ID and content are required' },
        { status: 400 }
      );
    }

    // Create comment
    const { data: comment, error: commentError } = await supabase
      .from('comments')
      .insert({
        post_id: postId,
        user_id: tokenData.userId,
        content,
        parent_id: parentId || null,
      })
      .select(`
        *,
        users!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .single();

    if (commentError || !comment) {
      console.error('Error creating comment:', commentError);
      return NextResponse.json(
        { error: 'Failed to create comment' },
        { status: 500 }
      );
    }

    // Increment comments count
    const { data: post } = await supabase
      .from('posts')
      .select('comments_count, user_id')
      .eq('id', postId)
      .single();

    if (post) {
      await supabase
        .from('posts')
        .update({ comments_count: post.comments_count + 1 })
        .eq('id', postId);

      // Create notification for post owner (if not self-comment)
      if (post.user_id !== tokenData.userId) {
        await supabase
          .from('notifications')
          .insert({
            user_id: post.user_id,
            type: 'reply',
            content: 'Someone replied to your thought',
            profile_id: tokenData.userId,
            post_id: postId,
          });
      }
    }

    return NextResponse.json({
      success: true,
      comment,
    });
  } catch (error) {
    console.error('Comment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const postId = searchParams.get('postId');

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const tokenData = await getUserFromToken();
    const currentUserId = tokenData?.userId;

    // Fetch comments with user data
    const { data: comments, error: commentsError } = await supabase
      .from('comments')
      .select(`
        *,
        users!comments_user_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (commentsError) {
      console.error('Error fetching comments:', commentsError);
      return NextResponse.json(
        { error: 'Failed to fetch comments' },
        { status: 500 }
      );
    }

    // If user is logged in, check likes
    let commentsWithUserData = comments;

    if (currentUserId) {
      const commentIds = comments.map(c => c.id);

      const { data: likes } = await supabase
        .from('likes')
        .select('comment_id')
        .eq('user_id', currentUserId)
        .in('comment_id', commentIds);

      const likedCommentIds = new Set(likes?.map(l => l.comment_id) || []);

      commentsWithUserData = comments.map(comment => ({
        ...comment,
        isLiked: likedCommentIds.has(comment.id),
      }));
    }

    return NextResponse.json({
      success: true,
      comments: commentsWithUserData,
    });
  } catch (error) {
    console.error('Get comments error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
