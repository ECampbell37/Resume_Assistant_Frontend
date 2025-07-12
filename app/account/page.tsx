'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { UserCircle, GaugeCircle, LogOut, Undo2, Lock, LogIn } from 'lucide-react';

const DAILY_LIMIT = 100;

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [usage, setUsage] = useState<number>(0);

  // Save user ID globally
  useEffect(() => {
    if (session?.user?.id) {
      sessionStorage.setItem('user_id', session.user.id);
    }
  }, [session]);

  // Fetch join date from Supabase
  useEffect(() => {
    const fetchJoinDate = async () => {
      if (!session?.user?.id) return;

      const res = await fetch('/api/joined', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await res.json();
      if (data?.joinedAt) setJoinedAt(data.joinedAt);
    };

    if (status === 'authenticated') {
      fetchJoinDate();
    }
  }, [session, status]);

  // Fetch today's API usage
  useEffect(() => {
    const fetchUsage = async () => {
      if (!session?.user?.id) return;

      const res = await fetch('/api/usage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id }),
      });

      const data = await res.json();
      setUsage(data?.usage ?? 0);
    };

    if (status === 'authenticated') {
      fetchUsage();
    }
  }, [session, status]);


  if (!session) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black text-green-300 animate-fadeInUp">
        <div className="text-center bg-zinc-900 p-10 rounded-2xl shadow-xl w-full max-w-md space-y-8">
            <div className="flex justify-center">
            <Lock className="w-14 h-14 text-green-400 animate-pulse" />
            </div>

            <h2 className="text-2xl font-bold">You&apos;re not signed in</h2>
            <p className="text-zinc-300 text-sm">
            You must be signed in to access this feature. 
            </p>

            <div className="flex justify-center">
            <Link href="/signin">
                <button className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-full transition shadow-lg hover:shadow-green-500/30">
                <LogIn size={18} />
                Sign In
                </button>
            </Link>
            </div>
        </div>
        </div>
    );
    }

  const usagePercent = Math.min((usage / DAILY_LIMIT) * 100, 100);

  return (
    <div className="min-h-screen bg-black text-green-300 px-6 py-16 flex justify-center items-center">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-xl w-full max-w-xl text-center space-y-8 animate-fadeIn">
        <div className="flex justify-center">
          <UserCircle className="text-green-400 w-16 h-16 animate-bounce" />
        </div>

        <h1 className="text-3xl font-bold">
            Welcome, {session.user?.email?.split('@')[0] || 'User'}!
        </h1>


        {joinedAt && (
          <p className="text-green-400 animate-fadeInUp">
            Joined on{' '}
            {new Date(joinedAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        )}

        {/* API Usage Bar */}
        <div className="space-y-2 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <GaugeCircle className="w-4 h-4" />
            Daily Usage
          </div>
          <div className="relative h-4 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="absolute top-0 left-0 h-full bg-green-500 transition-all duration-300 ease-in-out"
              style={{ width: `${usagePercent}%` }}
            />
          </div>
          <p className="text-xs text-green-400">{usage} / {DAILY_LIMIT} messages today</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          <Link href="/">
            <button className="bg-zinc-800 border border-green-500 px-6 py-2 rounded-full hover:bg-green-600 hover:text-white transition flex items-center gap-2">
              <Undo2 size={16} />
              Home
            </button>
          </Link>

          <button
            onClick={() => signOut()}
            className="bg-zinc-800 border border-red-500 px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition flex items-center gap-2"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
