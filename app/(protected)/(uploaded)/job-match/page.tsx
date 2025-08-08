/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/(protected)/(uploaded)/job-match/page.tsx
 ************************************************************/


/**
 * JobMatchPage.tsx – Allows users to compare their resume against a job description.
 * 
 * Features:
 * - Loads the most recent uploaded resume from Supabase
 * - Accepts a pasted job description and sends it to the backend for matching
 * - Displays a detailed skill breakdown and match percentage using Markdown
 * - Embeds a live PDF resume preview alongside results
 * - Enforces per-user API usage limits
 */



'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { checkApiAllowance } from '@/lib/checkApiAllowance';
import { FileText } from 'lucide-react';

// Define the structure of the job match result returned by your API
interface JobMatchResult {
  match_percentage: number;
  fit_category: string;
  matched_skills: string[];
  missing_skills: string[];
  recommendation: string;
}

export default function JobMatchPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchResult, setMatchResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

  // When user clicks match job, run job match
  const handleJobMatch = async () => {
    const userId = session?.user?.id;
    if (!jobDescription.trim() || !userId || !previewUrl) return;

    // Check usage allowance
    const allowed = await checkApiAllowance(userId, 1);
    if (!allowed) {
      setMatchResult('❌ You’ve hit your daily usage limit. Please try again tomorrow.');
      return;
    }

    setLoading(true);
    setMatchResult('');

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

      // Call job match
      const formDataMatch = new FormData();
      formDataMatch.append('user_id', userId);
      formDataMatch.append('job_description', jobDescription);

      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/jobmatch`, {
        method: 'POST',
        body: formDataMatch,
      });

      if (!res.ok) throw new Error(await res.text());
      const result: JobMatchResult = await res.json();

      const markdown = `
# 🎯 Overall Fit: _${result.fit_category}_


## ✅ Matched Skills
${
  result.matched_skills?.length
    ? result.matched_skills.map((s) => `- ${s}`).join('\n')
    : '_No clearly matched skills found._'
}

## ❌ Missing Skills
${
  result.missing_skills?.length
    ? result.missing_skills.map((s) => `- ${s}`).join('\n')
    : '_No major missing skills were identified._'
}

## 💡 Recommendation
${result.recommendation}
`.trim();


      setMatchResult(markdown);
    } catch (err) {
      console.error(err);
      setMatchResult('❌ Something went wrong. Please try again.');
    }

    setLoading(false);
  };


  return (
  <div className="min-h-screen flex flex-col items-center bg-[#0b0f14] text-teal-300 px-4 py-8">
    {/* Header */}
    <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-3">
      <h1 className="text-4xl font-extrabold tracking-tight text-white">
        Job Match 🔍
      </h1>
      <p className="text-emerald-300 text-base md:text-lg font-medium leading-relaxed">
        Paste a job description below to see how well your resume fits. You’ll get a match score, skill breakdown, and personalized recommendations.
      </p>
    </div>

    {/* Main Panel */}
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
      {/* Job Match Tool */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
        <h2 className="text-2xl font-bold text-center mb-4 text-teal-300">Job Match</h2>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-fadeIn">
            <FileText className="w-10 h-10 text-emerald-300 animate-bounce" />
            <p className="text-lg font-medium text-emerald-300">Analyzing your resume...</p>
          </div>
        ) : !matchResult ? (
          <>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here..."
              className="w-full bg-zinc-800 text-emerald-200 p-4 rounded-xl h-2/3 mb-4 border border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-400 text-base leading-relaxed"
            />
            <button
              onClick={handleJobMatch}
              disabled={!jobDescription.trim()}
              className={`mt-auto w-full py-3 rounded-xl font-semibold text-sm shadow-md transition ${
                !jobDescription.trim()
                  ? 'bg-zinc-700 text-teal-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:brightness-110'
              }`}
            >
              Match This Job
            </button>
          </>
        ) : (
          <div className="flex flex-col bg-zinc-800 rounded-xl text-emerald-200 h-full overflow-hidden shadow-md">
            <div className="flex-1 overflow-y-auto p-4 prose prose-invert max-w-none text-sm md:text-base">
              <MarkdownRenderer content={matchResult} />
            </div>
            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={() => {
                  setMatchResult('');
                  setJobDescription('');
                }}
                className="w-full py-2 px-4 bg-gradient-to-r from-emerald-700 to-teal-600 hover:from-teal-600 hover:to-emerald-500 text-white font-semibold rounded-lg shadow-sm transition"
              >
                Match Another Job
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
        <h3 className="text-lg 2xl:text-xl font-semibold mb-4 text-center text-teal-300">Resume Preview</h3>
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
