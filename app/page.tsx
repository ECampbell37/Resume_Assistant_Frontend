/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * Date:    August 2025
 * File:    /app/page.tsx
 ************************************************************/

/**
 * HomePage.tsx – Landing page for the Resume Assistant web app.
 *
 * Upgrades:
 * - Modern hero layout with two-column option for larger screens
 * - Branded gradient accents and improved typography hierarchy
 * - Animated hover effects for CTAs
 * - Cleaner "How It Works" section with consistent card design
 * - Fully responsive with mobile-first approach
 */

'use client';

import { UploadCloud, Sparkles, FileText, GaugeCircle, UserCircle2 } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#0b0f14] text-white pt-24 pb-20 px-6 2xl:px-20 space-y-24 animate-fadeInUp">
      {/* Hero Section */}
      <section className="max-w-6xl 2xl:max-w-7xl mx-auto text-center md:text-left md:flex md:items-center md:justify-between gap-12 2xl:gap-16">
        <div className="space-y-6 md:max-w-xl 2xl:max-w-2xl">
          <div className="flex justify-center md:justify-start">
            <Sparkles className="w-10 h-10 text-teal-400 animate-pulse" />
          </div>

          <h1 className="text-4xl md:text-5xl 2xl:text-6xl font-extrabold leading-tight">
            Empower Your <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 bg-clip-text text-transparent">Resume</span> with AI
          </h1>

          <p className="text-lg md:text-xl 2xl:text-2xl text-gray-300 max-w-lg 2xl:max-w-xl">
            Upload your resume to get instant feedback, actionable suggestions, and job-matching insights — all powered by AI.
          </p>

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 2xl:gap-6">
            <Link href="/upload">
              <button className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 px-8 2xl:py-4 2xl:px-10 rounded-full shadow-lg text-lg 2xl:text-xl hover:scale-105 transition-transform duration-300">
                <UploadCloud className="w-5 h-5" />
                Upload Your Resume
              </button>
            </Link>
            <Link href="/signup">
              <button className="inline-flex items-center gap-2 border border-white/20 text-white font-semibold py-3 px-8 2xl:py-4 2xl:px-10 rounded-full hover:bg-white/10 transition-all duration-300">
                <Sparkles className="w-5 h-5" />
                Sign Up Free
              </button>
            </Link>
          </div>

          <p className="mt-3 text-sm 2xl:text-base text-gray-400">
            100% free · Built with AI · Secure by design
          </p>
        </div>

        {/* Hero Image */}
        <div className="hidden md:block md:flex-1 animate-fadeIn">
          <div className="relative w-full h-108 2xl:h-[500px] rounded-2xl overflow-hidden shadow-xl border border-white/5">
          <Image
            src="/hero.png"
            alt="Resume Assistant Illustration"
            width={800}
            height={500}
            className="w-full h-full object-cover"
          />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl 2xl:max-w-7xl mx-auto px-4 2xl:px-0">
        <h2 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-teal-400 to-emerald-500 bg-clip-text text-transparent">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-10">
          {[
            {
              icon: <UserCircle2 className="w-10 h-10 text-teal-400" />,
              title: '1. Sign In',
              text: 'Create an account or sign in with just your email to get started.',
            },
            {
              icon: <UploadCloud className="w-10 h-10 text-teal-400" />,
              title: '2. Upload Resume',
              text: 'Upload your PDF resume — we’ll take care of the rest.',
            },
            {
              icon: <GaugeCircle className="w-10 h-10 text-teal-400" />,
              title: '3. Get Your Analysis',
              text: 'Receive instant AI-powered feedback on your resume.',
            },
            {
              icon: <FileText className="w-10 h-10 text-teal-400" />,
              title: '4. Explore Results',
              text: 'Discover tips, job suggestions, and use our AI chatbot for guidance.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center bg-[#0f1720] rounded-2xl p-6 2xl:p-8 shadow-md border border-white/5 hover:shadow-lg hover:scale-[1.02] transition-all duration-200 space-y-4"
            >
              {step.icon}
              <h3 className="text-lg 2xl:text-xl font-semibold">{step.title}</h3>
              <p className="text-sm 2xl:text-base text-gray-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <footer className="text-center text-sm 2xl:text-base text-gray-500 pt-10">
        Created by{' '}
        <a
          href="https://www.elijahcampbellihimportfolio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-gray-300 hover:text-teal-400 underline"
        >
          Elijah Campbell-Ihim
        </a>{' '}
        | Resume Assistant © 2025
      </footer>
    </main>
  );
}
