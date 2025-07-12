/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * File:    /app/(protected)/layout.tsx
 * Date:    July 2025
 ************************************************************/

/**
 * Protected Layout – Guards access to authenticated-only pages.
 *
 * - Redirects unauthenticated users to the /signin page
 * - Shows loading animation while checking auth
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-300 text-center space-y-6 animate-fadeIn px-6">
        <ShieldCheck className="w-14 h-14 text-green-400 animate-bounce-slow" />
        <h1 className="text-2xl font-bold">Verifying Access...</h1>
        <p className="text-sm text-zinc-400">
          Please wait while we confirm your session.
        </p>
        <Loader2 className="w-6 h-6 text-green-500 animate-spin mt-4" />
      </div>
    );
  }

  return <>{children}</>;
}
