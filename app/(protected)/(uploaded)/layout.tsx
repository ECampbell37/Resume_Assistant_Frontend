/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * File:    /app/(protected)/(uploaded)/layout.tsx
 * Date:    August 2025
 ************************************************************/

/**
 * UploadedLayout.tsx – Guards access to tools that require a resume.
 *
 * Features:
 * - Verifies the user has uploaded a resume in Supabase
 * - Redirects to /upload if not found
 * - Shares visual style with rest of the app
 * - Stacks on top of ProtectedLayout (authentication)
 */

'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Loader2, FileText } from 'lucide-react';
import NavBar from '@/components/NavBar';

export default function UploadedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();

  const [checking, setChecking] = useState(true);
  const [hasResume, setHasResume] = useState(false);

  useEffect(() => {
    const checkResume = async () => {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('resume_results')
        .select('id')
        .eq('user_id', session.user.id)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        router.replace('/upload');
      } else {
        setHasResume(true);
      }

      setChecking(false);
    };

    if (status === 'authenticated') {
      checkResume();
    }
  }, [session, status, supabase, router]);

  // While verifying resume upload status
  if (checking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f14] text-center px-6">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-400 to-emerald-500 shadow-lg mb-6">
          <FileText className="w-14 h-14 text-black" />
        </div>
        <h1 className="text-2xl font-bold text-white">Checking Resume...</h1>
        <p className="text-sm text-gray-400 mt-2">
          We&apos;re making sure you have an uploaded resume.
        </p>
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin mt-6" />
        <div className="mt-8 w-40 h-1 bg-white/10 rounded-full overflow-hidden">
          <div className="w-full h-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 animate-pulse" />
        </div>
      </div>
    );
  }

  // Once resume is verified, show layout
  return (
    <div className="bg-[#0b0f14] text-teal-300 min-h-screen">
      <NavBar />
      <main className="pt-8 2xl:pt-12 px-6">{children}</main>
    </div>
  );
}
