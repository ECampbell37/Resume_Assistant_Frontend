/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/signup/page.tsx
 ************************************************************/


/**
 * SignUpPage.tsx – Registers new users through a custom API route.
 *
 * Features:
 * - Collects email and password from user input
 * - Sends a POST request to `/api/auth/signup` to create an account
 * - Handles and displays error messages from the API response
 * - Shows a brief success confirmation before redirecting
 * - Redirects users to the Sign In page after successful registration
 * - Provides a link to return to the Sign In page
 */



'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, LockKeyhole, UserPlus, CheckCircle2 } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSignup = async () => {
    setError('');
    setSubmitting(true);

    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();

    if (data.error) {
      setError(data.error);
      setSubmitting(false);
    } else {
      setSuccess(true);
    }
  };

  // Hold on the success state briefly so the confirmation actually registers,
  // then hand off to Sign In with a flag so that page can greet the user.
  useEffect(() => {
    if (!success) return;
    const timeout = setTimeout(() => {
      router.push('/signin?created=true');
    }, 1600);
    return () => clearTimeout(timeout);
  }, [success, router]);

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white flex justify-center items-center px-6">
      <div className="w-full max-w-md 2xl:max-w-lg bg-[#0f1720] p-8 rounded-2xl shadow-xl space-y-8 animate-fadeInUp relative overflow-hidden">
        {/* Success overlay */}
        <div
          className={`absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 bg-[#0f1720] px-8 text-center transition-all duration-500 ease-out ${
            success
              ? 'opacity-100 scale-100 pointer-events-auto'
              : 'opacity-0 scale-95 pointer-events-none'
          }`}
        >
          <div
            className={`flex items-center justify-center w-16 h-16 rounded-full bg-teal-400/10 border border-teal-400/30 transition-transform duration-500 ${
              success ? 'scale-100' : 'scale-75'
            }`}
          >
            <CheckCircle2 className="w-9 h-9 text-teal-400" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl 2xl:text-2xl font-bold">Account created</h2>
            <p className="text-sm 2xl:text-base text-gray-400">
              Taking you to sign in…
            </p>
          </div>
        </div>

        {/* Sign up form */}
        <div
          className={`transition-opacity duration-300 ${
            success ? 'opacity-0' : 'opacity-100'
          }`}
        >
          <div className="flex justify-center">
            <UserPlus className="w-12 h-12 2xl:w-16 2xl:h-16 text-teal-400 animate-pulse" />
          </div>

          <h1 className="text-3xl 2xl:text-4xl font-bold text-center mt-6">
            Create an Account
          </h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSignup();
            }}
            className="space-y-6 mt-8"
          >
            <div className="space-y-2">
              <label className="text-sm 2xl:text-base text-gray-300 flex items-center gap-2 font-medium">
                <Mail size={16} />
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm 2xl:text-base text-gray-300 flex items-center gap-2 font-medium">
                <LockKeyhole size={16} />
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={submitting}
                className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-60"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm 2xl:text-base text-center">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 2xl:text-lg w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform shadow-md disabled:opacity-70 disabled:hover:scale-100"
            >
              {submitting ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <p className="text-sm 2xl:text-base text-center text-gray-400 mt-8">
            Already have an account?{' '}
            <Link href="/signin" className="text-teal-400 hover:underline font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}