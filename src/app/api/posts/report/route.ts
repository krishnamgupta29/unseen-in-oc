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
    const { postId, userId, reason } = body;

    if (!postId && !userId) {
      return NextResponse.json(
        { error: 'Post ID or User ID is required' },
        { status: 400 }
      );
    }

    // Create report
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        reporter_id: tokenData.userId,
        reported_post_id: postId || null,
        reported_user_id: userId || null,
        reason: reason || 'No reason provided',
      })
      .select()
      .single();

    if (reportError || !report) {
      console.error('Error creating report:', reportError);
      return NextResponse.json(
        { error: 'Failed to create report' },
        { status: 500 }
      );
    }

    // Mark post as reported if postId provided
    if (postId) {
      await supabase
        .from('posts')
        .update({ is_reported: true })
        .eq('id', postId);
    }

    // The database trigger will automatically:
    // 1. Increment report_count in users table
    // 2. Ban user if report_count >= 10

    return NextResponse.json({
      success: true,
      message: 'Report submitted successfully',
    });
  } catch (error) {
    console.error('Report error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
