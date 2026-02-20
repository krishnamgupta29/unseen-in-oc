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
    const { content, type, voiceUrl, waveform, duration } = body;

    // Validate required fields
    if (!content) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      );
    }

    // Create post
    const { data: post, error: postError } = await supabase
      .from('posts')
      .insert({
        user_id: tokenData.userId,
        content,
        type: type || 'text',
        voice_url: voiceUrl || null,
        waveform: waveform || null,
        duration: duration || null,
      })
      .select()
      .single();

    if (postError || !post) {
      console.error('Error creating post:', postError);
      return NextResponse.json(
        { error: 'Failed to create post' },
        { status: 500 }
      );
    }

    // Update user's post count
    await supabase.rpc('increment', {
      table_name: 'users',
      row_id: tokenData.userId,
      column_name: 'posts_count',
    }).catch(() => {
      // Fallback if RPC doesn't exist
      supabase
        .from('users')
        .update({ posts_count: supabase.raw('posts_count + 1') })
        .eq('id', tokenData.userId);
    });

    return NextResponse.json({
      success: true,
      post,
    });
  } catch (error) {
    console.error('Create post error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
