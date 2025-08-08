/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * Date:    August 2025
 * File:    /components/NavBar.tsx
 ************************************************************/

/**
 * NavBar.tsx – Fixed top navigation bar for branding and account access.
 *
 * Upgrades:
 * - Cleaner, more professional layout with branding card
 * - Responsive with mobile drawer menu
 * - Uses gradient accent for icon and call-to-action button
 * - Accessible focus styles
 */


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, FileText, User2 } from 'lucide-react';

export default function NavBar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const navItems = [
    { name: 'Upload', href: '/upload' },
    { name: 'Analysis', href: '/analysis' },
    { name: 'Job Match', href: '/job-match' },
    { name: 'Chat', href: '/chat' },
    { name: 'Revision', href: '/revision' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#0b0f14]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-screen mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo & Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-teal-400 to-emerald-500 shadow-sm group-hover:scale-105 transition-transform">
            <FileText className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="text-lg 2xl:text-xl font-semibold text-white">Resume Assistant</div>
            <div className="text-xs 2xl:text-sm text-gray-400 -mt-0.5">AI-powered insights</div>
          </div>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-5 text-md 2xl:text-lg mr-20">
          {navItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`${
                pathname === item.href ? 'text-white' : 'text-gray-300'
              } hover:text-white transition`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/account"
            className="hidden sm:inline-flex 2xl:text-lg items-center gap-2 bg-gradient-to-r from-teal-400 to-emerald-500 text-black font-medium px-4 py-2 rounded-full shadow-lg hover:scale-105 transition-transform"
          >
            <User2 className="w-4 h-4" />
            Account
          </Link>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setOpen((s) => !s)}
            className="md:hidden p-2 rounded-md bg-white/5 hover:bg-white/10 transition"
            aria-label="Toggle menu"
          >
            <div className="relative w-6 h-6">
              <Menu
                className={`absolute transition-all duration-300 ease-in-out transform ${
                  open ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100'
                } text-white`}
                strokeWidth={2.2}
              />
              <X
                className={`absolute transition-all duration-300 ease-in-out transform ${
                  open ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-75'
                } text-white`}
                strokeWidth={2.2}
              />
            </div>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <div
        className={`md:hidden z-40 absolute top-16 right-4 w-56 rounded-xl bg-[#111827] border border-white/10 shadow-2xl transform transition-all duration-300 ease-in-out ${
          open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-4 pointer-events-none'
        }`}
      >
        <ul className="p-4 space-y-2">
          {navItems.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={`block w-full px-4 py-2 rounded-lg font-medium text-sm tracking-wide transition-colors ${
                  pathname === item.href
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'text-gray-200 hover:bg-white/5 hover:text-white'
                }`}
                onClick={() => setOpen(false)}
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/account"
              className="flex items-center justify-center gap-2 w-2/3 px-4 py-2 mt-2 text-sm font-semibold text-black bg-gradient-to-r from-teal-400 to-emerald-500 rounded-full shadow-md hover:scale-[1.03] transition-transform"
              onClick={() => setOpen(false)}
            >
              <User2 className="w-4 h-4" />
              Account
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
