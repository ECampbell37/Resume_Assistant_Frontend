'use client';

import Link from 'next/link';
import { FileText, User2 } from 'lucide-react';

export default function NavBar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 text-green-400 shadow-md">
      <nav className="flex justify-between items-center px-4 py-3">
        {/* Logo */}
        <Link href="/" className="flex items-center text-xl font-bold hover:text-green-300 transition">
          <FileText size={24} className="text-green-400" />
          <span className="ml-2">Resume Assistant</span>
        </Link>

        {/* Account button */}
        <Link href="/account" className="hover:text-green-300 transition flex items-center gap-2">
          <User2 size={20} />
          <span className="hidden sm:inline text-sm">Account</span>
        </Link>
      </nav>
    </header>
  );
}
