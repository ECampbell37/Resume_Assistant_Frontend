'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import {
  UserCircle, GaugeCircle, LogOut, Undo2, Lock, LogIn,
  FileText, Search, UploadCloud, EyeOff, Eye,
} from 'lucide-react';

const DAILY_LIMIT = 100;

export default function AccountPage() {
  const { data: session, status } = useSession();
  const [joinedAt, setJoinedAt] = useState<string | null>(null);
  const [usage, setUsage] = useState<number>(0);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (session?.user?.id) {
      sessionStorage.setItem('user_id', session.user.id);
    }
  }, [session]);

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

    if (status === 'authenticated') fetchJoinDate();
  }, [session, status]);

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

    if (status === 'authenticated') fetchUsage();
  }, [session, status]);

  useEffect(() => {
    const fetchResume = async () => {
      const res = await fetch('/api/resume/latest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session?.user?.id }),
      });

      const data = await res.json();
      if (data?.file_url) setResumeUrl(data.file_url);
    };

    if (session?.user?.id) fetchResume();
  }, [session]);

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-green-300 animate-fadeInUp">
        <div className="text-center bg-zinc-900 p-10 rounded-2xl shadow-xl w-full max-w-md space-y-12">
          <div className="flex justify-center">
            <Lock className="w-16 h-16 text-green-400 animate-pulse" />
          </div>
          <h2 className="text-3xl font-bold">You&apos;re not signed in</h2>
          <p className="text-zinc-300 text-md">You must be signed in to access this feature.</p>
          <div className="flex justify-center">
            <Link href="/signin">
              <button className="flex items-center gap-2 text-lg bg-emerald-600 text-white font-semibold px-6 py-2 rounded-full hover:bg-gradient-to-r hover:from-green-600 hover:via-emerald-600 hover:to-teal-600 hover:scale-105 transition-all duration-300 shadow-md hover:shadow-green-400/40">
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
  <div className="min-h-screen bg-black text-green-300 px-4 sm:px-6 py-16 flex justify-center items-start">
    <div className="bg-zinc-900 p-6 sm:p-8 rounded-2xl shadow-xl w-full max-w-2xl text-center space-y-8 animate-fadeIn">
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

      {/* Action Buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mt-8 w-full">
        {resumeUrl ? (
          <Link href="/analysis" className="w-full">
            <button className="w-full bg-zinc-800 border border-green-500 px-4 py-3 rounded-xl hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-2 shadow-md text-sm font-medium">
              <Search size={16} />
              See Analysis
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-zinc-700 text-zinc-400 cursor-not-allowed px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md text-sm font-medium"
          >
            <Search size={16} />
            See Analysis
          </button>
        )}

        <Link href="/upload" className="w-full">
          <button className="w-full bg-green-600 hover:bg-green-700 px-4 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 shadow-md text-sm">
            <UploadCloud size={16} />
            New Analysis
          </button>
        </Link>

        <button
          onClick={() => setShowPreview(!showPreview)}
          disabled={!resumeUrl}
          className={`w-full px-4 py-3 rounded-xl flex items-center justify-center gap-2 shadow-md text-sm font-semibold transition ${
            resumeUrl
              ? 'bg-zinc-800 border border-green-500 hover:bg-green-600 hover:text-white'
              : 'bg-zinc-700 text-zinc-400 cursor-not-allowed'
          }`}
        >
          {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPreview ? 'Hide Preview' : 'Show Resume'}
        </button>
      </div>

      {/* Resume Preview */}
      {showPreview && resumeUrl && (
        <div className="mt-10 w-full">
          <h2 className="text-lg font-bold mb-2 flex items-center justify-center gap-2">
            <FileText size={18} />
            Resume Preview
          </h2>
          <div className="bg-zinc-800 rounded-lg overflow-hidden border border-green-600 shadow-md">
            <iframe
              src={`${resumeUrl}#view=FitH`}
              title="Resume Preview"
              className="w-full h-[500px] rounded"
            />
          </div>
        </div>
      )}

      {/* Footer Nav */}
      <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center mt-10 w-full">
        <Link href="/" className="w-full sm:w-auto">
          <button className="w-full sm:w-auto bg-zinc-800 border border-green-500 px-6 py-2 rounded-full hover:bg-green-600 hover:text-white transition flex items-center justify-center gap-2 text-sm font-medium">
            <Undo2 size={16} />
            Home
          </button>
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full sm:w-auto bg-zinc-800 border border-red-500 px-6 py-2 rounded-full hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2 text-sm font-medium"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

}
