/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * File:    /app/api/usage/check/route.ts
 ************************************************************/

/**
 * Checks whether a user is allowed to make an API request based on usage.
 * Accepts a customizable `cost`, and increments the user's usage count.
 * Enforces a daily limit of 100 requests per user.
 */

import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseClient';

const DAILY_LIMIT = 100;

export async function POST(req: NextRequest) {
  const { userId, cost = 1 } = await req.json();

  if (!userId) {
    return NextResponse.json({ allowed: false, error: 'Missing user ID' }, { status: 400 });
  }

  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabaseServer
    .from('api_usage')
    .select('*')
    .eq('user_id', userId)
    .eq('date', today)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ allowed: false, error: 'Failed to check usage' }, { status: 500 });
  }

  const currentCount = data?.request_count ?? 0;

  if (currentCount + cost > DAILY_LIMIT) {
    return NextResponse.json({ allowed: false });
  }

  if (!data) {
    const { error: insertError } = await supabaseServer
      .from('api_usage')
      .insert({ user_id: userId, date: today, request_count: cost });

    if (insertError) {
      return NextResponse.json({ allowed: false, error: 'Failed to insert usage' }, { status: 500 });
    }
  } else {
    const { error: updateError } = await supabaseServer
      .from('api_usage')
      .update({ request_count: currentCount + cost })
      .eq('user_id', userId)
      .eq('date', today);

    if (updateError) {
      return NextResponse.json({ allowed: false, error: 'Failed to update usage' }, { status: 500 });
    }
  }

  return NextResponse.json({ allowed: true });
}
