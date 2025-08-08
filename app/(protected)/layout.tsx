/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * File:    /app/(protected)/layout.tsx
 * Date:    August 2025
 ************************************************************/

/**
 * Protected Layout – Guards access to authenticated-only pages.
 *
 * Upgrades:
 * - Matches new dark gradient brand style
 * - Larger, more polished icons
 * - Subtle animated accent border
 * - Clearer typography hierarchy
 */

'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  const [delayPassed, setDelayPassed] = useState(false);

  // Smooth out initial loading
  useEffect(() => {
    const timeout = setTimeout(() => setDelayPassed(true), 800);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/account');
    }
  }, [status, router]);

  const showLoading = status === 'loading' || !delayPassed;

  if (showLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f14] text-center px-6">
        {/* Icon */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg mb-6">
          <ShieldCheck className="w-14 h-14 text-black" />
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-white">Verifying Access...</h1>
        <p className="text-sm text-gray-400 mt-2">
          Please wait while we confirm your session.
        </p>

        {/* Loader */}
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin mt-6" />

        {/* Accent Bar */}
        <div className="mt-8 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
