'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Send } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatPage() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchResume = async () => {
      const userId = session?.user?.id;
      if (!userId) return;

      const { data, error } = await supabase
        .from('resume_results')
        .select('file_url')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        router.push('/upload');
        return;
      }

      setPreviewUrl(data.file_url);
      await uploadResumeForChatbot(data.file_url, userId);
    };

    const uploadResumeForChatbot = async (fileUrl: string, userId: string) => {
      const res = await fetch(fileUrl);
      const blob = await res.blob();
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('file', new File([blob], 'resume.pdf', { type: 'application/pdf' }));

      await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/chatbot/load`, {
        method: 'POST',
        body: formData,
      });
    };

    fetchResume();
  }, [session, supabase, router]);


  const sendMessage = async () => {
    const userId = session?.user?.id;
    if (!input.trim() || !userId) return;

    setLoading(true);
    const userMessage: ChatMessage = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');

    try {
      const formData = new FormData();
      formData.append('user_id', userId);
      formData.append('message', input);

      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/chatbot/respond`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Failed to fetch chatbot response');
      }

      const data = await res.json();
      const assistantMessage: ChatMessage = { role: 'assistant', content: data.response };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chatbot error:', err);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '❌ Something went wrong. Please try again.' },
      ]);
    }

    setLoading(false);
  };


  return (
  <div className="min-h-screen flex flex-col items-center bg-black text-green-300 px-4 py-2">
    {/* Welcome Header */}
<div className="w-full max-w-4xl text-center mb-10 animate-fadeInUp space-y-4">
  <h1 className="text-3xl md:text-4xl font-bold text-green-300">
    Resume Chatbot 🤖
  </h1>
  <p className="text-green-400 text-base md:text-lg font-medium leading-relaxed">
    Ask questions about your resume and get personalized feedback from an AI assistant.
    Try things like{' '}
    <span className="bg-zinc-800 text-green-300 font-mono px-2 py-1 mx-1 my-1 rounded-md text-sm inline-block">
      What skills should I earn next?
    </span>
    or
    <span className="bg-zinc-800 text-green-300 font-mono px-2 py-1 mx-1 my-1 rounded-md text-sm inline-block">
      How do I get a job as a ___?
    </span>
  </p>
</div>
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-7xl animate-fadeInUp">
      {/* Chatbot Section */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 md:p-6 rounded-2xl shadow-xl h-[500px]">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Resume Chatbot</h2>

        <div className="flex-1 bg-zinc-800 p-4 rounded-xl overflow-y-auto space-y-4">
          {messages.length === 0 && (
            <p className="text-center text-green-400 italic">
              Ask any question about your resume…
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${
                msg.role === 'user' ? 'justify-end' : 'justify-start'
              } animate-fadeIn`}
            >
              <div
                className={`max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-md break-words ${
                  msg.role === 'user'
                    ? 'bg-emerald-600 text-black rounded-br-none'
                    : 'bg-zinc-700 text-green-100 rounded-bl-none'
                }`}
              >
                <MarkdownRenderer content={msg.content} />
              </div>
            </div>
          ))}

          {loading && (
    <div className="flex justify-start animate-fadeIn">
      <div className="max-w-xs md:max-w-sm lg:max-w-md px-4 py-3 rounded-2xl text-sm shadow-md bg-zinc-700 text-green-100 rounded-bl-none">
        <div className="flex items-center gap-2">
          <span>AI is typing</span>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce [animation-delay:0s]" />
            <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce [animation-delay:.15s]" />
            <div className="w-2 h-2 bg-green-300 rounded-full animate-bounce [animation-delay:.3s]" />
          </div>
        </div>
      </div>
    </div>
  )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <div className="mt-4 flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your resume..."
            className="flex-1 bg-zinc-700 text-green-200 px-4 py-2 rounded-full outline-none border border-green-600 focus:ring-2 focus:ring-green-400 transition"
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className={`p-2 rounded-full transition ${
              loading || !input.trim()
                ? 'bg-zinc-600 cursor-not-allowed'
                : 'bg-green-600 hover:bg-green-500 text-black'
            }`}
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Resume Preview */}
      <div className="w-full lg:w-1/2 flex flex-col bg-zinc-900 p-4 rounded-2xl shadow-xl h-[500px]">
        <h3 className="text-lg font-semibold mb-4 text-center">Resume Preview</h3>
        <div className="flex-1 overflow-hidden rounded-lg border border-green-700 bg-zinc-800">
          {previewUrl ? (
            <iframe
              src={`${previewUrl}#view=FitH`}
              className="w-full h-full rounded-lg"
              title="Resume Preview"
              style={{ border: 'none' }}
            />
          ) : (
            <p className="text-center text-green-400 py-20">Loading resume...</p>
          )}
        </div>
      </div>
    </div>

    {/* Tools Navigation */}
    <div className="mt-10 w-full">
      <ToolsNav />
    </div>
  </div>
);

}
