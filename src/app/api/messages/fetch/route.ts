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

    const searchParams = request.nextUrl.searchParams;
    const recipientId = searchParams.get('recipientId');
    const roomId = searchParams.get('roomId');

    if (!recipientId && !roomId) {
      return NextResponse.json(
        { error: 'Recipient ID or Room ID is required' },
        { status: 400 }
      );
    }

    let query = supabase
      .from('messages')
      .select(`
        *,
        users!messages_sender_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .order('created_at', { ascending: true });

    if (roomId) {
      // Fetch room messages
      query = query.eq('room_id', roomId);
    } else if (recipientId) {
      // Fetch direct messages between two users
      query = query.or(
        `and(sender_id.eq.${tokenData.userId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${tokenData.userId})`
      );
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      console.error('Error fetching messages:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch messages' },
        { status: 500 }
      );
    }

    // Mark messages as read
    if (recipientId) {
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('recipient_id', tokenData.userId)
        .eq('sender_id', recipientId)
        .eq('is_read', false);
    }

    return NextResponse.json({
      success: true,
      messages: messages || [],
    });
  } catch (error) {
    console.error('Fetch messages error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
