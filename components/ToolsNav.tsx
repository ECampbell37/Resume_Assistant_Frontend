/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /components/ToolsNav.tsx
 ************************************************************/


/**
 * ToolsNav.tsx – Renders a navigation bar for accessing core app tools.
 * 
 * Features:
 * - Displays buttons for Analysis, Job Match, Chatbot, and Revision pages
 * - Highlights the active tool based on current route
 * - Uses Lucide icons with consistent styling for each tool
 * - Fully responsive and mobile-friendly with wrap support
 * - Styled to match the app's green/black theme with dynamic hover effects
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
            className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 shadow-sm
              ${
                isActive
                  ? 'bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white shadow-lg scale-105'
                  : 'bg-zinc-800 text-green-300 hover:bg-gradient-to-r hover:from-green-500 hover:via-emerald-600 hover:to-teal-500 hover:text-white hover:scale-105'
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
