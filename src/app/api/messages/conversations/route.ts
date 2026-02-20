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

    // Fetch all messages where user is sender or recipient
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select(`
        *,
        sender:users!messages_sender_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        ),
        recipient:users!messages_recipient_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .or(`sender_id.eq.${tokenData.userId},recipient_id.eq.${tokenData.userId}`)
      .is('room_id', null)
      .order('created_at', { ascending: false });

    if (messagesError) {
      console.error('Error fetching conversations:', messagesError);
      return NextResponse.json(
        { error: 'Failed to fetch conversations' },
        { status: 500 }
      );
    }

    // Group messages by conversation partner
    const conversationsMap = new Map();

    messages?.forEach((message: any) => {
      const partnerId = message.sender_id === tokenData.userId 
        ? message.recipient_id 
        : message.sender_id;
      
      const partner = message.sender_id === tokenData.userId 
        ? message.recipient 
        : message.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          id: partnerId,
          profile: partner,
          lastMessage: message.content || '🎤 Voice message',
          timestamp: message.created_at,
          unread: 0,
          messages: [],
        });
      }

      const conversation = conversationsMap.get(partnerId);
      
      // Count unread messages
      if (message.recipient_id === tokenData.userId && !message.is_read) {
        conversation.unread++;
      }
    });

    const conversations = Array.from(conversationsMap.values());

    return NextResponse.json({
      success: true,
      conversations,
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
