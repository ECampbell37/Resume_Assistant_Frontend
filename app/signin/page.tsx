/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/signin/page.tsx
 ************************************************************/


/**
 * SignInPage.tsx – Authenticates users using email and password via NextAuth credentials provider.
 * 
 * Features:
 * - Accepts user input for email and password
 * - Uses `signIn()` with redirect disabled for client-side handling
 * - Displays inline error message for invalid credentials
 * - Redirects to the account dashboard upon successful login
 * - Includes a link to the Sign Up page for new users
 */



'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserCircle, Mail, LockKeyhole } from 'lucide-react';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    const result = await signIn('credentials', {
      redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError("Invalid email or password.");
    } else {
      router.push('/account');
    }
  };

  return (
    <main className="min-h-screen bg-[#0b0f14] text-white flex justify-center items-center px-6">
      <div className="w-full max-w-md 2xl:max-w-lg bg-[#0f1720] p-8 rounded-2xl shadow-xl space-y-8 animate-fadeInUp">
        <div className="flex justify-center">
          <UserCircle className="w-12 2xl:w-16 h-12 2xl:h-16 text-teal-400 animate-pulse" />
        </div>

        <h1 className="text-3xl 2xl:text-4xl font-bold text-center">Sign In</h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
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
              className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              className="w-full px-4 py-3 rounded-lg bg-[#111827] text-white placeholder-gray-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-teal-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm 2xl:text-base text-center">{error}</p>
          )}

          <button
            type="submit"
            className="mt-2 2xl:text-lg w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 rounded-full hover:scale-105 transition-transform shadow-md"
          >
            Sign In
          </button>
        </form>

        <p className="text-sm 2xl:text-base text-center text-gray-400">
          New here?{' '}
          <Link href="/signup" className="text-teal-400 hover:underline font-medium">
            Create an account
          </Link>
        </p>
      </div>
    </main>
  );
}
