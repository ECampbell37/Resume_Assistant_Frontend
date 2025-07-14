'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
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

  const handleJobMatch = async () => {
    const userId = session?.user?.id;
    if (!jobDescription.trim() || !userId || !previewUrl) return;

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
## 🎯 Match Score: **${result.match_percentage}%**
**Fit:** _${result.fit_category}_

## ✅ Matched Skills
${result.matched_skills.map((s) => `- ${s}`).join('\n')}

## ❌ Missing Skills
${result.missing_skills.map((s) => `- ${s}`).join('\n')}

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
  <div className="min-h-screen flex flex-col items-center bg-black text-green-300 px-4 py-2">
    {/* Welcome Header */}
    <div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-4">
      <h1 className="text-3xl md:text-4xl font-bold text-green-300">
        Job Match 🔍
      </h1>
      <p className="text-green-400 text-base md:text-lg font-medium leading-relaxed">
        Paste a job description below to see how well your resume fits. You'll get a match score, skill breakdown, and personalized recommendations.
      </p>
    </div>

    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
      {/* Job Match Section */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-xl h-[500px] relative">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Job Match</h2>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center text-green-300 gap-4 animate-fadeIn">
            <FileText className="w-10 h-10 text-green-400 animate-bounce" />
            <p className="text-lg font-medium">Analyzing your resume...</p>
          </div>
        ) : !matchResult ? (
          <>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a job description here..."
              className="w-full bg-zinc-800 text-green-200 p-3 rounded-lg h-56 mb-3 border border-green-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={handleJobMatch}
              disabled={!jobDescription.trim()}
              className={`mt-auto w-full py-2 rounded-lg font-semibold transition ${
                !jobDescription.trim()
                  ? 'bg-zinc-600 text-green-400 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-500 text-black'
              }`}
            >
              Match This Job
            </button>
          </>
        ) : (
          <div className="flex flex-col bg-zinc-800 rounded-xl text-green-200 text-sm md:text-base h-full overflow-hidden">
            <div className="flex-1 overflow-y-auto p-4">
              <MarkdownRenderer content={matchResult} />
            </div>
            <div className="p-4 border-t border-zinc-700">
              <button
                onClick={() => {
                  setMatchResult('');
                  setJobDescription('');
                }}
                className="w-full py-2 px-4 bg-green-700 hover:bg-green-600 text-white font-semibold rounded-lg"
              >
                Match Another Job
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Resume Preview */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 rounded-2xl shadow-xl h-[500px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Resume Preview</h3>
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
