// app/api/user/init/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

export async function POST(req: NextRequest) {
  const { userId, email } = await req.json();

  const { error } = await supabaseServer.from('users').upsert({
    id: userId,
    email,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}
