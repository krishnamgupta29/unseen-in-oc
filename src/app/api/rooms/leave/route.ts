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
    const { roomId } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Remove user from room
    const { error: leaveError } = await supabase
      .from('room_members')
      .delete()
      .eq('room_id', roomId)
      .eq('user_id', tokenData.userId);

    if (leaveError) {
      console.error('Error leaving room:', leaveError);
      return NextResponse.json(
        { error: 'Failed to leave room' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Left room successfully',
    });
  } catch (error) {
    console.error('Leave room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
