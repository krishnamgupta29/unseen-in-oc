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
    const type = searchParams.get('type'); // 'public', 'private', or 'my'

    let query = supabase
      .from('rooms')
      .select(`
        *,
        creator:users!rooms_created_by_fkey (
          id,
          username,
          display_name,
          avatar_gradient
        ),
        room_members (count)
      `)
      .order('created_at', { ascending: false });

    if (type === 'public') {
      query = query.eq('type', 'public');
    } else if (type === 'private') {
      query = query.eq('type', 'private');
    } else if (type === 'my') {
      // Get rooms where user is a member
      const { data: memberRooms } = await supabase
        .from('room_members')
        .select('room_id')
        .eq('user_id', tokenData.userId);

      const roomIds = memberRooms?.map(m => m.room_id) || [];
      
      if (roomIds.length === 0) {
        return NextResponse.json({
          success: true,
          rooms: [],
        });
      }

      query = query.in('id', roomIds);
    }

    const { data: rooms, error: roomsError } = await query;

    if (roomsError) {
      console.error('Error fetching rooms:', roomsError);
      return NextResponse.json(
        { error: 'Failed to fetch rooms' },
        { status: 500 }
      );
    }

    // Check which rooms user is a member of
    const { data: userMemberships } = await supabase
      .from('room_members')
      .select('room_id')
      .eq('user_id', tokenData.userId);

    const memberRoomIds = new Set(userMemberships?.map(m => m.room_id) || []);

    const roomsWithMembership = rooms?.map(room => ({
      ...room,
      isMember: memberRoomIds.has(room.id),
      memberCount: room.room_members?.[0]?.count || 0,
    }));

    return NextResponse.json({
      success: true,
      rooms: roomsWithMembership || [],
    });
  } catch (error) {
    console.error('List rooms error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
