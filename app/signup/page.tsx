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
 * - Redirects users to the Sign In page after successful registration
 * - Provides a link to return to the Sign In page
 */



'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, LockKeyhole, UserPlus } from 'lucide-react';

export default function SignUpPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async () => {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await res.json();
    if (data.error) {
      setError(data.error);
    } else {
      router.push('/signin');
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white flex justify-center items-center px-6">
      <div className="w-full max-w-md 2xl:max-w-lg bg-[#0f1720] p-8 rounded-2xl shadow-xl space-y-8 animate-fadeInUp">
        <div className="flex justify-center">
          <UserPlus className="w-12 h-12 2xl:w-16 2xl:h-16 text-teal-400 animate-pulse" />
        </div>

        <h1 className="text-3xl 2xl:text-4xl font-bold text-center">Create an Account</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSignup();
          }}
          className="space-y-6"
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
              className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
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
              className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm 2xl:text-base text-center">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 2xl:text-lg w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform shadow-md"
          >
            Sign Up
          </button>
        </form>

        <p className="text-sm 2xl:text-base text-center text-gray-400">
          Already have an account?{' '}
          <Link href="/signin" className="text-teal-400 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
