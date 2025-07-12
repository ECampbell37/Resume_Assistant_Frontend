// /app/api/resume/latest/route.ts

import { supabaseServer } from '@/lib/supabaseClient';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { userId } = await req.json();

  const { data, error } = await supabaseServer
    .from('resume_results')
    .select('file_url')
    .eq('user_id', userId)
    .order('uploaded_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error('Failed to fetch resume:', error);
    return NextResponse.json({ error: 'Failed to fetch resume.' }, { status: 500 });
  }

  return NextResponse.json({ file_url: data?.file_url ?? null });
}
