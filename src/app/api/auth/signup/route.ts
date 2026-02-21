import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, password, email, deviceFingerprint, avatarGradient, displayName } = body;

    // Validate required fields
    if (!username || !password || !deviceFingerprint) {
      return NextResponse.json(
        { error: 'Username, password, and device fingerprint are required' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        username,
        password_hash: passwordHash,
        email: email || null,
        device_fingerprint: deviceFingerprint,
        avatar_gradient: avatarGradient || 'from-violet-600 via-purple-600 to-indigo-600',
        display_name: displayName || username,
        bio: 'New to UNSEEN',
        mood_tag: '✨ feeling reflective',
      })
      .select()
      .single();

    if (userError || !user) {
      console.error('Error creating user:', userError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Track device (no limit)
    const { data: deviceData } = await supabase
      .from('device_tracking')
      .select('account_count')
      .eq('device_fingerprint', deviceFingerprint)
      .single();

    if (deviceData) {
      await supabase
        .from('device_tracking')
        .update({ account_count: deviceData.account_count + 1 })
        .eq('device_fingerprint', deviceFingerprint);
    } else {
      await supabase
        .from('device_tracking')
        .insert({ device_fingerprint: deviceFingerprint, account_count: 1 });
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    // Set auth cookie
    await setAuthCookie(token);

    // Return user data (without password hash)
    const { password_hash, device_fingerprint, ...userData } = user;

    return NextResponse.json({
      success: true,
      user: userData,
      token,
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
