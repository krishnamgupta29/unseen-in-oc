import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const tokenData = await getUserFromToken();

    if (!tokenData) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Fetch notifications
    const { data: notifications, error: notificationsError } = await supabase
      .from('notifications')
      .select(`
        *,
        profile:users!notifications_profile_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .eq('user_id', tokenData.userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (notificationsError) {
      console.error('Error fetching notifications:', notificationsError);
      return NextResponse.json(
        { error: 'Failed to fetch notifications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notifications: notifications || [],
    });
  } catch (error) {
    console.error('Get notifications error:', error);
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
    const { notificationId, markAllAsRead } = body;

    if (markAllAsRead) {
      // Mark all notifications as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', tokenData.userId)
        .eq('is_read', false);

      return NextResponse.json({
        success: true,
        message: 'All notifications marked as read',
      });
    } else if (notificationId) {
      // Mark single notification as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId)
        .eq('user_id', tokenData.userId);

      return NextResponse.json({
        success: true,
        message: 'Notification marked as read',
      });
    } else {
      return NextResponse.json(
        { error: 'Notification ID or markAllAsRead flag is required' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Update notifications error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
