/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/(protected)/(uploaded)/analysis/page.tsx
 ************************************************************/


/**
 * AnalysisPage.tsx – Displays AI-generated feedback for each section of a user’s resume.
 * 
 * Features:
 * - Fetches the latest resume analysis results from Supabase
 * - Supports step-by-step navigation through feedback sections
 * - Integrates Markdown rendering for AI responses
 * - Embeds a live PDF preview of the uploaded resume
 * - Links to Job Match and Chatbot modes via ToolsNav
 */


'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';

//JSON keys for backend analysis
const sections = [
  'summary',
  'personal_info',
  'strengths',
  'job_roles',
  'career_tips',
  'rating',
  'improvements',
  'spelling',
] as const;

type SectionKey = typeof sections[number];

interface AnalysisResults {
  previewUrl: string;
  summary: string;
  rating: string;
  personal_info: string;
  job_roles: string;
  strengths: string;
  improvements: string;
  career_tips: string;
  spelling: string;
}


export default function AnalysisPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState<AnalysisResults | null>(null);
  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();


  //Fetches user's resume and analysis data
  useEffect(() => {
    const fetchResults = async () => {
      const userId = session?.user?.id;
      if (!userId) {
        router.push('/upload');
        return;
      }

      const { data, error } = await supabase
        .from('resume_results')
        .select('*')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.warn('No analysis result found or error:', error);
        router.push('/upload');
        return;
      }

      setResults({
        ...data.analysis,
        previewUrl: data.file_url,
      });
    };

    fetchResults();
  }, [router, session, supabase]);

  if (!results) return null;

  // Sets analysis section and corresponding result
  const currentKey: SectionKey = sections[currentIndex];
  const currentValue = results[currentKey];

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0b0f14] text-teal-300 px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-3">
        <h1 className="text-4xl font-extrabold tracking-tight text-white">
          Your Resume Analysis
        </h1>
        <p className="text-emerald-300 text-base md:text-lg font-medium leading-relaxed">
          Use the navigation arrows to move through each section, and preview your resume alongside your results.
          Check out the{' '}
          <span className="bg-zinc-800 text-teal-300 font-mono px-2 py-1 mx-1 rounded-md text-sm inline-block">
            Job Match
          </span>
          and
          <span className="bg-zinc-800 text-teal-300 font-mono px-2 py-1 mx-1 rounded-md text-sm inline-block">
            Chatbot
          </span>
          modes below for an even more personalized analysis.
        </p>
      </div>

      {/* Main Panel */}
      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
        {/* Analysis Section */}
        <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
          <div className="flex-1 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-bold capitalize text-center mb-4 text-teal-300">
              {currentKey.replace('_', ' ')}
            </h2>
            <div className="bg-zinc-800 p-4 rounded-xl text-emerald-200 overflow-y-auto prose prose-invert max-w-none h-[360px]">
              <MarkdownRenderer content={currentValue || '*No content available.*'} />
            </div>
          </div>

          {/* Navigation */}
          <div className="mt-4 flex flex-row items-center justify-between gap-3 w-full">
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className={`px-8 py-3 sm:px-4 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base transition ${
                currentIndex === 0
                  ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:brightness-110 shadow-md'
              }`}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            <span className="text-sm sm:text-base text-gray-400 font-medium">
              {currentIndex + 1} / {sections.length}
            </span>

            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1))}
              disabled={currentIndex === sections.length - 1}
              className={`px-8 py-3 sm:px-4 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base transition ${
                currentIndex === sections.length - 1
                  ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-black hover:brightness-110 shadow-md'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl h-[540px]">
          <h3 className="text-lg font-semibold mb-4 text-center text-teal-300">Resume Preview</h3>
          <div className="flex-1 overflow-hidden rounded-xl border border-teal-600 bg-zinc-800">
            <iframe
              src={`${results.previewUrl}#view=FitH`}
              className="w-full h-full rounded-xl"
              title="Resume Preview"
              style={{ border: 'none' }}
            />
          </div>
        </div>
      </div>

      {/* Tool Navigation */}
      <div className="mt-12 w-full">
        <ToolsNav />
      </div>
    </div>
  );

}
