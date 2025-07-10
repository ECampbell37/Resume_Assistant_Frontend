'use client';

import Link from 'next/link';
import { Brain, Wand2, Briefcase, MessageSquareText } from 'lucide-react';

const tools = [
  { label: 'Analysis', href: '/analysis', icon: <Brain size={20} /> },
  { label: 'Job Match', href: '/job-match', icon: <Briefcase size={20} /> },
  { label: 'Chatbot', href: '/chat', icon: <MessageSquareText size={20} /> },
  { label: 'Suggestions', href: '/suggestions', icon: <Wand2 size={20} /> },
];

export default function ToolsNav() {
  return (
    <div className="mt-8 flex justify-center gap-4 flex-wrap">
      {tools.map((tool) => (
        <Link
          key={tool.href}
          href={tool.href}
          className="bg-zinc-800 hover:bg-green-700 text-green-200 px-4 py-2 rounded-xl flex items-center gap-2 transition"
        >
          {tool.icon}
          <span className="text-sm font-medium">{tool.label}</span>
        </Link>
      ))}
    </div>
  );
}
