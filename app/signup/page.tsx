'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-300 px-6 py-10">
      <div className="bg-zinc-900 p-8 rounded-xl shadow-lg w-full max-w-sm space-y-6 animate-fadeInUp">
        <h1 className="text-3xl font-bold text-center">Create an Account</h1>
        <input
          type="email"
          placeholder="Email"
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-zinc-800 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-400 text-sm text-center">{error}</p>}
        <button
          onClick={handleSignup}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded transition"
        >
          Sign Up
        </button>
        <p className="text-sm text-center text-zinc-400">
          Already have an account?{' '}
          <Link href="/signin" className="text-green-400 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
