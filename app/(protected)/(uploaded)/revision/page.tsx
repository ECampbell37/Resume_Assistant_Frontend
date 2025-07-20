'use client';

import { useEffect, useState, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { FileText, RefreshCw, Wand2 } from 'lucide-react';
import { checkApiAllowance } from '@/lib/checkApiAllowance';

export default function RevisionPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [rewritten, setRewritten] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showCopy, setShowCopy] = useState(false);
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  

  const contentRef = useRef<HTMLDivElement>(null);

  const { data: session } = useSession();
  const router = useRouter();
  const supabase = createClientComponentClient();

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
        router.push('/upload');
        return;
      }

      setPreviewUrl(data.file_url);
      await loadResumeForRewrite(data.file_url, userId);
    };

    const loadResumeForRewrite = async (fileUrl: string, userId: string) => {
      const blob = await fetch(fileUrl).then((r) => r.blob());
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', new File([blob], 'resume.pdf', { type: 'application/pdf' }));

      await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/chatbot/load`, {
        method: 'POST',
        body: formData,
      });
    };

    fetchResume();
  }, [session, supabase, router]);

  const handleRewrite = async () => {
    const userId = session?.user?.id;
    if (!userId || !previewUrl) return;

    const allowed = await checkApiAllowance(userId, 2);
    if (!allowed) {
      setRewritten('❌ You’ve hit your daily usage limit. Please try again tomorrow.');
      return;
    }

    setLoading(true);
    setRewritten('');

    try {
      const formData = new FormData();
      formData.append('user_id', userId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/revision`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error(await res.text());
      const result = await res.text();
      setRewritten(result);
    } catch (err) {
      console.error(err);
      setRewritten('❌ Something went wrong. Please try again.');
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
  <div className="min-h-screen flex flex-col items-center bg-black text-green-300 px-4 py-2">
    {/* Header */}
    <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold text-green-300">🚀 Resume Revision</h1>
      <p className="text-green-400 text-base md:text-lg font-medium leading-relaxed">
        Want some help? Get a polished, concise, and ATS-friendly version of your resume instantly!
      </p>
    </div>

    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
      {/* Rewritten Resume Section */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-xl h-[500px] relative">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Resume Assistant Rewrite</h2>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-green-300 gap-4 animate-fadeIn">
            <FileText className="w-10 h-10 text-green-400 animate-bounce" />
            <p className="text-lg font-medium">Rewriting your resume...</p>
          </div>
        ) : rewritten ? (
          <div
            className="flex-1 flex flex-col overflow-hidden rounded-xl bg-zinc-800 relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {/* Copy Button */}
            <button
              onClick={copyToClipboard}
              className={`mr-2 absolute top-4 right-4 z-10 px-3 py-1 rounded-md text-sm font-medium flex items-center gap-1 border border-green-500 transition-opacity duration-300 bg-zinc-700 hover:bg-zinc-600 ${
                showCopy ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <FileText className="w-4 h-4 text-green-300" />
              <span className={copied ? 'text-green-400 font-semibold' : 'text-green-300'}>
                {copied ? 'Copied!' : 'Copy'}
              </span>
            </button>

            {/* Resume Markdown */}
            <div
              ref={contentRef}
              className="flex-1 overflow-y-auto p-4 text-sm md:text-base text-green-200"
            >
              <MarkdownRenderer content={rewritten} />
            </div>

            {/* Rewrite Button */}
            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={handleRewrite}
                className="w-full py-2 px-4 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
              >
                <RefreshCw className="text-white" />
                <span>Rewrite Again</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col">
            <p className="text-center text-green-400 mb-4">
              Use the button below to generate your AI-enhanced resume.
            </p>
            <button
              onClick={handleRewrite}
              className="mt-auto w-full py-2 px-4 bg-green-700 hover:bg-green-600 hover:animate-pulse text-white font-semibold rounded-lg flex items-center justify-center gap-2"
            >
              <Wand2 className="text-white" />
              <span>Rewrite My Resume</span>
            </button>
          </div>
        )}
      </div>

      {/* Resume Preview Section */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 rounded-2xl shadow-xl h-[500px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Original Resume Preview</h3>
        <div className="flex-1 overflow-hidden rounded-lg border border-green-700 bg-zinc-800">
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#view=FitH`}
              className="w-full h-full rounded-lg"
              title="Resume Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <p className="text-center text-green-400 py-20">Loading resume...</p>
          )}
        </div>
      </div>
    </div>

    {/* Tools Navigation */}
    <div className="mt-10 w-full">
      <ToolsNav />
    </div>
  </div>
);


}
