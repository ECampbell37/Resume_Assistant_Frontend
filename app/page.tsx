/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/page.tsx
 ************************************************************/


/**
 * HomePage.tsx – Landing page for the Resume Assistant web app.
 * 
 * Features:
 * - Promotes key app benefits with animated hero section
 * - Describes the step-by-step process of resume analysis
 * - Provides CTAs for uploading a resume and signing up
 * - Includes animated icons and responsive layout for all devices
 * - Footer includes credit and copyright
 */



'use client';

import { UploadCloud, Sparkles, FileText, GaugeCircle, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="min-h-screen bg-black text-green-300 px-6 py-20 space-y-24 2xl:px-20 2xl:py-28">
      {/* Hero Section */}
      <section className="text-center max-w-2xl 2xl:max-w-4xl mx-auto animate-fadeInUp space-y-6">
        <div className="flex justify-center">
          <Sparkles className="w-10 h-10 text-green-400 animate-pulse" />
        </div>

        <h1 className="text-4xl md:text-5xl 2xl:text-6xl font-extrabold tracking-tight leading-tight">
          Empower Your Resume with AI
        </h1>

        <p className="text-lg md:text-xl 2xl:text-2xl text-green-400">
          Upload your resume to get instant feedback, actionable suggestions, and job-matching insights.
        </p>

        <Link href="/upload">
          <button className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-500 via-emerald-600 to-teal-500 text-white font-semibold py-3 px-8 2xl:py-4 2xl:px-10 rounded-full shadow-lg text-xl 2xl:text-2xl hover:scale-105 transition-transform duration-300">
            <UploadCloud className="w-5 h-5" />
            Upload Your Resume
          </button>
        </Link>

        <p className="mt-6 text-sm 2xl:text-base text-green-500">
          100% free · Built with AI · Secure by design
        </p>
      </section>

      {/* How It Works */}
      <section className="max-w-6xl 2xl:max-w-screen-xl mx-auto px-4 animate-fadeIn">
        <h2 className="text-3xl md:text-4xl 2xl:text-5xl font-bold text-center mb-12 text-green-400">
          How It Works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 2xl:gap-10">
          {[
            {
              icon: <UserCircle2 className="w-10 h-10 text-green-400" />,
              title: '1. Sign In',
              text: 'Create an account or sign in to get started. All you need is an email address.',
            },
            {
              icon: <UploadCloud className="w-10 h-10 text-green-400" />,
              title: '2. Upload Resume',
              text: 'Upload a PDF version of your resume — we’ll take care of the rest.',
            },
            {
              icon: <GaugeCircle className="w-10 h-10 text-green-400" />,
              title: '3. Get Your Analysis',
              text: 'Get instant feedback based on an all-inclusive AI-powered resume analysis.',
            },
            {
              icon: <FileText className="w-10 h-10 text-green-400" />,
              title: '4. Explore Results',
              text: 'Discover career tips, job suggestions, and a personalized resume chatbot tailored just for you.',
            },
          ].map((step, i) => (
            <div
              key={i}
              className="flex flex-col items-center text-center bg-black hover:bg-zinc-900 rounded-2xl p-6 shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200 space-y-4"
            >
              {step.icon}
              <h3 className="text-lg 2xl:text-xl font-semibold">{step.title}</h3>
              <p className="text-sm 2xl:text-base text-zinc-400">{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sign Up CTA */}
      <section className="text-center animate-fadeIn">
        <Link href="/signup">
          <button className="inline-flex items-center gap-2 text-lg 2xl:text-xl bg-transparent text-emerald-400 font-semibold py-3 px-8 2xl:py-4 2xl:px-10 rounded-full hover:bg-gradient-to-r hover:from-green-500 hover:via-emerald-600 hover:to-lime-500 hover:text-white hover:scale-105 transition-all duration-300 shadow-md">
            <Sparkles className="w-5 h-5" />
            Sign Up Now!
          </button>
        </Link>
      </section>

      {/* Footer Note */}
      <footer className="text-center text-sm 2xl:text-base text-zinc-500 pt-10 animate-fadeIn">
        Created by{' '}
        <a
          href="https://www.elijahcampbellihimportfolio.com"
          target="_blank"
          rel="noopener noreferrer"
          className="font-bold text-zinc-300 hover:text-emerald-400 underline"
        >
          Elijah Campbell-Ihim
        </a>{' '}
        | Resume Assistant © 2025
      </footer>
    </main>
  );
}
