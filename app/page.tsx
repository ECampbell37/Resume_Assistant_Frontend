'use client';

import { UploadCloud, Sparkles } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-black text-green-300 px-6">
      <div className="text-center max-w-2xl animate-fadeInUp">
        {/* Sparkle Icon */}
        <div className="flex justify-center mb-4">
          <Sparkles className="w-10 h-10 text-green-400 animate-pulse" />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight leading-tight">
          Empower Your Resume with AI
        </h1>

        {/* Subtext */}
        <p className="text-lg md:text-xl text-green-400 mb-8">
          Upload your resume to get instant feedback, actionable suggestions, and job-matching insights.
        </p>

        {/* CTA */}
        <Link href="/upload">
          <button className="inline-flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-xl shadow-lg hover:bg-green-700 transition-all text-lg font-medium">
            <UploadCloud className="w-5 h-5" />
            Upload Your Resume
          </button>
        </Link>

        {/* Footer */}
        <p className="mt-6 text-sm text-green-500">
          100% free · No login required (yet) · Built with AI
        </p>
      </div>
    </main>
  );
}
