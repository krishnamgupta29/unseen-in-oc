import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken, verifyPassword } from '@/lib/auth';

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
    const { roomId, password } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Get room details
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json(
        { error: 'Room not found' },
        { status: 404 }
      );
    }

    // Check if private room requires password
    if (room.type === 'private' && room.password_hash) {
      if (!password) {
        return NextResponse.json(
          { error: 'Password is required for private rooms' },
          { status: 400 }
        );
      }

      const isValidPassword = await verifyPassword(password, room.password_hash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: 'Invalid password' },
          { status: 401 }
        );
      }
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('room_members')
      .select('id')
      .eq('room_id', roomId)
      .eq('user_id', tokenData.userId)
      .single();

    if (existingMember) {
      return NextResponse.json({
        success: true,
        message: 'Already a member',
        room,
      });
    }

    // Add user as member
    const { error: memberError } = await supabase
      .from('room_members')
      .insert({
        room_id: roomId,
        user_id: tokenData.userId,
      });

    if (memberError) {
      console.error('Error joining room:', memberError);
      return NextResponse.json(
        { error: 'Failed to join room' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Joined room successfully',
      room,
    });
  } catch (error) {
    console.error('Join room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
