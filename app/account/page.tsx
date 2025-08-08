/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/account/page.tsx
 ************************************************************/


/**
 * AccountPage.tsx – Displays user account information, resume usage, and access to key actions.
 * 
 * Features:
 * - Shows user email, join date, and daily API usage progress bar
 * - Provides quick links to upload a new resume, view analysis, and toggle preview
 * - Embeds the most recent resume file in a live PDF preview
 * - Fetches user usage data and resume file URL from backend APIs
 * - Includes sign-in fallback screen and sign-out button
 */



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

  // Sets user session
  useEffect(() => {
    if (session?.user?.id) {
      sessionStorage.setItem('user_id', session.user.id);
    }
  }, [session]);

  // Fetches user join data
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

  // Fetches user's API usage
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

  // Fetches user's resume
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


  // Lock screen (not signed in)
  if (!session) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b0f14] text-white px-6">
      <div className="bg-[#0f1720] p-10 rounded-2xl shadow-2xl w-full max-w-md text-center space-y-8 animate-fadeInUp">
        <div className="flex justify-center">
          <Lock className="w-14 h-14 text-teal-400 animate-pulse" />
        </div>

        <h2 className="text-3xl 2xl:text-4xl font-bold">You&apos;re not signed in</h2>
        <p className="text-sm 2xl:text-base text-gray-400 leading-relaxed">
          Sign in to unlock your personalized dashboard and dive into your resume insights—tailored just for you.
        </p>

        <Link href="/signin">
          <button className="2xl:text-xl inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold px-6 py-3 rounded-full shadow-lg hover:scale-105 transition-transform">
            <LogIn size={18} />
            Sign In
          </button>
        </Link>
      </div>
    </div>
  );
}


  // API Usage bar logic
  const usagePercent = Math.min((usage / DAILY_LIMIT) * 100, 100);


  return (
  <div className="min-h-screen 2xl:min-h-full bg-[#0b0f14] text-white px-4 sm:px-6 2xl:px-20 py-20 flex justify-center">
    <div className="w-full max-w-3xl 2xl:max-w-4xl bg-[#0f1720] rounded-3xl shadow-2xl p-10 2xl:p-12 space-y-12 animate-fadeIn">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <UserCircle className="w-16 h-16 2xl:w-20 2xl:h-20 text-teal-400 animate-bounce" />
        </div>
        <h1 className="text-3xl 2xl:text-4xl font-bold">
          Welcome, {session.user?.email?.split('@')[0] || 'User'}!
        </h1>
        {joinedAt && (
          <p className="text-sm 2xl:text-base text-gray-400">
            Joined on{" "}
            {new Date(joinedAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        )}
      </div>

      {/* API Usage */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm 2xl:text-base font-medium text-gray-300">
          <GaugeCircle className="w-5 h-5 2xl:w-6 2xl:h-6 text-teal-400" />
          Daily Usage
        </div>
        <div className="relative w-full h-5 2xl:h-6 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className={`absolute top-0 left-0 h-full transition-all duration-500 ease-in-out ${
              usagePercent > 90
                ? "bg-red-500"
                : usagePercent > 75
                ? "bg-yellow-400"
                : "bg-teal-500"
            }`}
            style={{ width: `${usagePercent}%` }}
          />
        </div>
        <p className="text-xs 2xl:text-sm text-gray-400">
          {usage} / {DAILY_LIMIT} messages today
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 2xl:gap-6">
        <Link href="/upload">
          <button className="w-full bg-zinc-800 hover:bg-teal-500 text-white border border-teal-400 px-4 py-3 2xl:px-5 2xl:py-4 rounded-xl text-sm 2xl:text-base font-semibold flex items-center justify-center gap-2 transition-all hover:shadow-lg hover:scale-105">
            <UploadCloud size={16} />
            New Analysis
          </button>
        </Link>

        {resumeUrl ? (
          <Link href="/analysis">
            <button className="w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black px-4 py-3 2xl:px-5 2xl:py-4 rounded-xl text-sm 2xl:text-base font-semibold flex items-center justify-center gap-2 transition-all hover:scale-105 shadow-lg">
              <Search size={16} />
              View Analysis
            </button>
          </Link>
        ) : (
          <button
            disabled
            className="w-full bg-zinc-700 text-gray-400 cursor-not-allowed px-4 py-3 2xl:px-5 2xl:py-4 rounded-xl flex items-center justify-center gap-2 text-sm 2xl:text-base font-medium"
          >
            <Search size={16} />
            View Analysis
          </button>
        )}

        <button
          onClick={() => setShowPreview(!showPreview)}
          disabled={!resumeUrl}
          className={`w-full px-4 py-3 2xl:px-5 2xl:py-4 rounded-xl text-sm 2xl:text-base font-semibold flex items-center justify-center gap-2 transition-all ${
            resumeUrl
              ? "bg-zinc-800 text-white border border-teal-400 hover:bg-teal-500 hover:text-black hover:shadow-lg hover:scale-105"
              : "bg-zinc-700 text-gray-400 cursor-not-allowed"
          }`}
        >
          {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
          {showPreview ? "Hide Resume" : "Show Resume"}
        </button>
      </div>

      {/* Resume Preview */}
      {showPreview && resumeUrl && (
        <div className="space-y-4">
          <h2 className="text-lg 2xl:text-xl font-semibold flex items-center justify-center gap-2">
            <FileText size={18} />
            Resume Preview
          </h2>
          <div className="bg-zinc-900 border border-teal-600 rounded-xl overflow-hidden shadow-xl">
            <iframe
              src={`${resumeUrl}#view=FitH`}
              className="w-full h-[500px] 2xl:h-[600px] rounded"
              title="Resume Preview"
            />
          </div>
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
        <Link href="/">
          <button className="w-full sm:w-auto bg-zinc-800 border border-teal-500 text-gray-300 hover:text-white px-6 2xl:px-8 py-2 2xl:py-3 rounded-full hover:bg-white/10 transition text-sm 2xl:text-base flex items-center justify-center gap-2">
            <Undo2 size={16} />
            Home
          </button>
        </Link>

        <button
          onClick={() => signOut()}
          className="w-full sm:w-auto bg-zinc-800 border border-red-500 text-red-400 px-6 2xl:px-8 py-2 2xl:py-3 rounded-full hover:bg-red-600 hover:text-white transition text-sm 2xl:text-base flex items-center justify-center gap-2"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </div>
  </div>
);

}
