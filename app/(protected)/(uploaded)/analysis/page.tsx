'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';

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

  const currentKey: SectionKey = sections[currentIndex];
  const currentValue = results[currentKey];

  return (
    <div className="min-h-screen flex flex-col items-center bg-black text-green-300 px-4">
      {/* Welcome Header */}
      <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-green-300">
          Your Resume Analysis
        </h1>
        <p className="text-green-400 text-base md:text-lg font-medium leading-relaxed">
          Use the navigation arrows to move through each section, and preview your resume alongside your results.
          Check out the{' '}
          <span className="bg-zinc-800 text-green-300 font-mono px-2 py-1 mx-1 rounded-md text-sm inline-block">
            Job Match
          </span>
          and
          <span className="bg-zinc-800 text-green-300 font-mono px-2 py-1 mx-1 rounded-md text-sm inline-block">
            Chatbot
          </span>
          modes below for an even more personalized analysis.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
        {/* AI Analysis Section */}
        <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-xl h-[500px]">
          <div className="flex-1 overflow-hidden">
            <h2 className="text-2xl md:text-3xl font-bold capitalize text-center mb-4">
              {currentKey.replace('_', ' ')}
            </h2>
            <div className="bg-zinc-800 p-4 rounded-xl text-green-200 overflow-y-auto text-base md:text-lg leading-relaxed overflow-x-hidden break-words h-[350px]">
              <MarkdownRenderer content={currentValue || '*No content available.*'} />
            </div>
          </div>

          <div className="mt-4 flex flex-row items-center justify-between gap-3 w-full">
            {/* Previous Button */}
            <button
              onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
              disabled={currentIndex === 0}
              className={`px-8 py-4 sm:px-4 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-medium sm:font-semibold text-sm sm:text-base transition ${
                currentIndex === 0
                  ? 'bg-zinc-700 text-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {/* Progress Indicator */}
            <span className="text-green-400 text-sm sm:text-base font-medium">
              {currentIndex + 1} / {sections.length}
            </span>

            {/* Next Button */}
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, sections.length - 1))}
              disabled={currentIndex === sections.length - 1}
              className={`px-8 py-4 sm:px-4 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-medium sm:font-semibold text-sm sm:text-base transition ${
                currentIndex === sections.length - 1
                  ? 'bg-zinc-700 text-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Resume Preview */}
        <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 rounded-2xl shadow-xl h-[500px]">
          <h3 className="text-lg font-semibold mb-4 text-center">Resume Preview</h3>
          <div className="flex-1 overflow-hidden rounded-lg border border-green-700 bg-zinc-800">
            <iframe
              src={`${results.previewUrl}#view=FitH`}
              className="w-full h-full rounded-lg"
              title="Resume Preview"
              style={{ border: 'none' }}
            />
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
