/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * Date:    August 2025
 * File:    /components/ToolsNav.tsx
 ************************************************************/

/**
 * ToolsNav.tsx – Navigation for core app tools.
 *
 * Upgrades:
 * - Matches new brand colors & rounded pill style
 * - Smooth hover animations and subtle glow effect
 * - Active state with gradient background and scale
 * - Better spacing and mobile responsiveness
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Brain, Wand2, Briefcase, MessageSquareText } from 'lucide-react';

const tools = [
  { label: 'Analysis', href: '/analysis', icon: <Brain size={18} /> },
  { label: 'Job Match', href: '/job-match', icon: <Briefcase size={18} /> },
  { label: 'Chatbot', href: '/chat', icon: <MessageSquareText size={18} /> },
  { label: 'Revision', href: '/revision', icon: <Wand2 size={18} /> },
];

export default function ToolsNav() {
  const pathname = usePathname();

  return (
    <div className="mt-8 mb-8 flex justify-center gap-4 flex-wrap">
      {tools.map((tool) => {
        const isActive = pathname === tool.href;

        return (
          <Link
            key={tool.href}
            href={tool.href}
            className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-sm 2xl:text-base font-medium transition-all duration-300
              ${
                isActive
                  ? 'bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black shadow-lg scale-105'
                  : 'bg-[#0f1720] text-gray-300 border border-white/5 hover:bg-gradient-to-r hover:from-teal-400 hover:via-cyan-400 hover:to-emerald-500 hover:text-black hover:shadow-lg hover:scale-105'
              }`}
          >
            {tool.icon}
            {tool.label}
          </Link>
        );
      })}
    </div>
  );
}
