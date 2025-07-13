'use client';

import { UploadCloud, Sparkles, FileText, GaugeCircle, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-green-300 px-6 py-20 space-y-24 mt-2">
      {/* Hero Section */}
      <section className="text-center max-w-2xl mx-auto animate-fadeInUp space-y-6">
        <div className="flex justify-center">
          <Sparkles className="w-10 h-10 text-green-400 animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
          Empower Your Resume with AI
        </h1>

        <p className="text-lg md:text-xl text-green-400">
          Upload your resume to get instant feedback, actionable suggestions, and job-matching insights.
        </p>

        <Link href="/upload">
          <button className="mt-4 inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all text-lg font-medium">
            <UploadCloud className="w-5 h-5" />
            Upload Your Resume
          </button>
        </Link>

        <p className="mt-6 text-sm text-green-500">
          100% free · Built with AI · Secure by design
        </p>
      </section>

      {/* About Section */}
      <section className="max-w-4xl mx-auto space-y-12 animate-fadeIn">
        <h2 className="text-3xl font-bold text-center mb-4 text-green-400">How It Works</h2>
        <div className="grid md:grid-cols-4 gap-8 text-center">
          {/* Step 1 */}
          <div className="flex flex-col items-center space-y-3">
            <UserCircle2 className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold">1. Sign In</h3>
            <p className="text-sm text-zinc-400">
              Create an account or sign in to get started. Your data is safe and private.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center space-y-3">
            <UploadCloud className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold">2. Upload Resume</h3>
            <p className="text-sm text-zinc-400">
              Upload a PDF version of your resume. We’ll handle the rest.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center space-y-3">
            <GaugeCircle className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold">3. Get Your Score</h3>
            <p className="text-sm text-zinc-400">
              Instantly receive a score, strengths, and improvement tips based on our AI rubric.
            </p>
          </div>

          {/* Step 4 */}
          <div className="flex flex-col items-center space-y-3">
            <FileText className="w-10 h-10 text-green-500" />
            <h3 className="text-lg font-semibold">4. Explore Results</h3>
            <p className="text-sm text-zinc-400">
              View your resume summary, job matches, grammar suggestions, and more.
            </p>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="text-center animate-fadeIn">
        <Link href="/signup">
          <button className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-md hover:bg-green-700 transition text-lg font-medium">
            <Sparkles className="w-5 h-5" />
            Sign Up Now!
          </button>
        </Link>
      </section>
    </main>
  );
}
