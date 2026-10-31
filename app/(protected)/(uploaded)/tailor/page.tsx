/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    2026
 * File:    /app/(protected)/(uploaded)/tailor/page.tsx
 ************************************************************/


/**
 * TailorPage.tsx – Tailors the user's resume to a specific job post.
 * 
 * Features:
 * - Loads the most recent uploaded resume from Supabase
 * - Accepts a pasted job description plus optional context (framing
 *   instructions and extra facts) and sends them to the backend
 * - Displays the tailored resume with Markdown formatting
 * - Allows one-click copy of the tailored resume (with hover/fade UX)
 * - Supports "Tailor Another Job" reset
 * - Shows side-by-side original PDF preview
 * - Enforces per-user API usage limits
 */


'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { checkApiAllowance } from '@/lib/checkApiAllowance';
import { FileText, LocateFixed } from 'lucide-react';

export default function TailorPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [context, setContext] = useState('');
  const [tailored, setTailored] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const contentRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();

  // Fetch Resume from database
  useEffect(() => {
    const fetchResume = async () => {
      const userId = session?.user?.id;
      if (!userId) {
        router.push('/upload');
        return;
      }

      const { data, error } = await supabase
        .from('resume_results')
        .select('file_url')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn('No resume found or error:', error);
        router.push('/upload');
        return;
      }

      setPreviewUrl(data.file_url);
    };

    fetchResume();
  }, [router, session, supabase]);

  // When user clicks tailor, run resume tailoring
  const handleTailor = async () => {
    const userId = session?.user?.id;
    if (!jobDescription.trim() || !userId || !previewUrl) return;

    // Check usage allowance
    const allowed = await checkApiAllowance(userId, 2);
    if (!allowed) {
      setTailored('❌ You’ve hit your daily usage limit. Please try again tomorrow.');
      return;
    }

    setLoading(true);
    setTailored('');

    try {
      // Reload resume into memory
      const resBlob = await fetch(previewUrl).then((r) => r.blob());
      const formDataLoad = new FormData();
      formDataLoad.append('user_id', userId);
      formDataLoad.append('file', new File([resBlob], 'resume.pdf', { type: 'application/pdf' }));

      await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/chatbot/load`, {
        method: 'POST',
        body: formDataLoad,
      });

      // Call tailor
      const formDataTailor = new FormData();
      formDataTailor.append('user_id', userId);
      formDataTailor.append('job_description', jobDescription);
      formDataTailor.append('context', context);

      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/tailor`, {
        method: 'POST',
        body: formDataTailor,
      });

      if (!res.ok) throw new Error(await res.text());
      const result = await res.text();
      setTailored(result);
    } catch (err) {
      console.error(err);
      setTailored('❌ Something went wrong. Please try again.');
    }

    setLoading(false);
  };


  // Helper functions for rendering copy button

  const copyToClipboard = async () => {
    if (!contentRef.current) return;

    const html = contentRef.current.innerHTML;
    const blob = new Blob([html], { type: 'text/html' });
    const clipboardItem = new ClipboardItem({ 'text/html': blob });

    try {
      await navigator.clipboard.write([clipboardItem]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      alert('❌ Failed to copy resume.');
    }
  };

  const handleMouseEnter = () => {
    setShowCopy(true);
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);

    hoverTimeout.current = setTimeout(() => {
      setShowCopy(false);
    }, 3000);
  };

  const handleMouseLeave = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
      hoverTimeout.current = null;
    }
    setShowCopy(false);
  };


  return (
  <div className="min-h-screen flex flex-col items-center bg-[#0b0f14] text-teal-300 px-4 py-8">
    {/* Header */}
    <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-3">
      <h1 className="text-4xl font-extrabold tracking-tight text-white">
        Tailor Resume 🎯
      </h1>
      <p className="text-emerald-300 text-base md:text-lg font-medium leading-relaxed">
        Paste a job description below and get a version of your resume tailored to that role. Add optional context to steer how you&apos;re positioned or to include experience that isn&apos;t on your resume.
      </p>
    </div>

    {/* Main Panel */}
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
      {/* Tailor Tool */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
        <h2 className="text-2xl font-bold text-center mb-4 text-teal-300">Tailored Resume</h2>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fadeIn">
            <FileText className="w-10 h-10 text-emerald-300 animate-bounce" />
            <p className="text-lg font-medium text-emerald-300">Tailoring your resume...</p>
          </div>
        ) : !tailored ? (
          <>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here..."
              className="w-full bg-zinc-800 text-emerald-200 p-4 rounded-xl h-44 mb-3 border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-base leading-relaxed"
            />
            <label className="text-sm font-medium text-teal-300 mb-1">
              Context <span className="text-emerald-300/60 font-normal">(optional)</span>
            </label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              maxLength={1000}
              placeholder="e.g. I'm pivoting into software, so lean on my technical projects. I also led a team of five at my last job."
              className="w-full bg-zinc-800 text-emerald-200 p-3 rounded-xl h-24 mb-4 border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-sm leading-relaxed"
            />
            <button
              onClick={handleTailor}
              disabled={!jobDescription.trim() || !previewUrl}
              className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm shadow-md transition flex items-center justify-center gap-2 ${
                !jobDescription.trim() || !previewUrl
                  ? 'bg-zinc-700 text-teal-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:brightness-110'
              }`}
            >
              <LocateFixed className="w-4 h-4" />
              <span>Tailor My Resume</span>
            </button>
          </>
        ) : (
          <div
            className="flex-1 flex flex-col overflow-hidden rounded-xl bg-zinc-800 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`mr-2 absolute top-4 right-4 z-10 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-2 border border-teal-500 transition-opacity duration-300 bg-zinc-700 hover:bg-zinc-600 ${
                showCopy ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <FileText className="w-4 h-4 text-teal-300" />
              <span className={copied ? 'font-semibold' : 'font-medium'}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>

            {/* Tailored Markdown */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto p-4 prose prose-invert max-w-none text-sm md:text-base"
            >
              <MarkdownRenderer content={tailored} />
            </div>

            {/* Reset Button */}
            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={() => {
                  setTailored('');
                  setJobDescription('');
                }}
                className="w-full py-2 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-sm transition"
              >
                Tailor Another Job
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
        <h3 className="text-lg 2xl:text-xl font-semibold mb-4 text-center text-teal-300">Original Resume Preview</h3>
        <div className="flex-1 overflow-hidden rounded-xl border border-teal-600 bg-zinc-800">
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#view=FitH`}
              className="w-full h-full rounded-xl"
              title="Resume Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <p className="text-center text-emerald-300 py-20">Loading resume...</p>
          )}
        </div>
      </div>
    </div>

    {/* ToolsNav */}
    <div className="mt-12 w-full">
      <ToolsNav />
    </div>
  </div>
);


}