import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Missing email or password' }, { status: 400 });
    }

    const { data: existingUser } = await supabaseServer
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = crypto.randomUUID();

    const { error: insertError } = await supabaseServer
      .from('users')
      .insert([{ id: userId, email, hashed_password: hashedPassword }]);

    if (insertError) {
      return NextResponse.json({ error: 'Error creating user' }, { status: 500 });
    }

    return NextResponse.json({ message: 'User created successfully' });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
