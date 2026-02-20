import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { getUserFromToken, hashPassword } from '@/lib/auth';

// Generate random password for private rooms
function generateRoomPassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

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
    const { name, type } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Room name is required' },
        { status: 400 }
      );
    }

    let passwordHash = null;
    let plainPassword = null;

    // Generate password for private rooms
    if (type === 'private') {
      plainPassword = generateRoomPassword();
      passwordHash = await hashPassword(plainPassword);
    }

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name,
        type: type || 'public',
        password_hash: passwordHash,
        created_by: tokenData.userId,
      })
      .select()
      .single();

    if (roomError || !room) {
      console.error('Error creating room:', roomError);
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    }

    // Add creator as member
    await supabase
      .from('room_members')
      .insert({
        room_id: room.id,
        user_id: tokenData.userId,
      });

    return NextResponse.json({
      success: true,
      room: {
        ...room,
        password: plainPassword, // Return plain password only once
      },
    });
  } catch (error) {
    console.error('Create room error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
