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
    const { recipientId, roomId, content, type, voiceUrl, waveform, duration } = body;

    if (!content && !voiceUrl) {
      return NextResponse.json(
        { error: 'Content or voice URL is required' },
        { status: 400 }
      );
    }

    if (!recipientId && !roomId) {
      return NextResponse.json(
        { error: 'Recipient ID or Room ID is required' },
        { status: 400 }
      );
    }

    // Create message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        sender_id: tokenData.userId,
        recipient_id: recipientId || null,
        room_id: roomId || null,
        content: content || null,
        type: type || 'text',
        voice_url: voiceUrl || null,
        waveform: waveform || null,
        duration: duration || null,
      })
      .select(`
        *,
        users!messages_sender_id_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        )
      `)
      .single();

    if (messageError || !message) {
      console.error('Error creating message:', messageError);
      return NextResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    // Create notification for recipient (if direct message)
    if (recipientId) {
      await supabase
        .from('notifications')
        .insert({
          user_id: recipientId,
          type: 'message',
          content: 'New anonymous message received',
          profile_id: tokenData.userId,
        });
    }

    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
