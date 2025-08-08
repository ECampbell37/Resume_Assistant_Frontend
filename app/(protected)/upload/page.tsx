/************************************************************
 * Name:    Elijah Campbell‑Ihim
 * Project: Resume Assistant
 * Date:    July 2025
 * File:    /app/(protected)/upload/page.tsx
 ************************************************************/


/**
 * UploadPage.tsx – Handles resume upload, validation, analysis, and storage.
 * 
 * Features:
 * - Validates PDF uploads (type and size) with error handling
 * - Deletes previous resume from Supabase Storage (if exists)
 * - Uploads new resume to Supabase and stores public URL
 * - Sends the resume to the backend for analysis
 * - Saves analysis results in the `resume_results` table
 * - Displays an animated loading screen during analysis
 * - Provides resume preview and graceful fallback UI
 * - Enforces daily API usage limits before proceeding
 */



'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { checkApiAllowance } from '@/lib/checkApiAllowance';
import { UploadCloud, FileText, AlertTriangle, Eye, EyeOff } from 'lucide-react';

// Loading screen after resume upload
function LoadingScreen() {
  const messages = [
    "Parsing your resume through an ATS lens...",
    "Checking formatting and structure for readability...",
    "Identifying standout skills and achievements...",
    "Scanning for tone, clarity, and consistency...",
    "Highlighting your professional strengths...",
    "Spotting areas for improvement...",
    "Checking typos and grammar...",
    "Generating personalized career advice...",
    "Matching your resume to modern job market trends...",
    "Finalizing...",
  ];

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex >= messages.length - 1) return; // stop at last message

    const interval = setInterval(() => {
      setCurrentIndex((prev) => prev + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [currentIndex, messages.length]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0b0f14] text-white animate-fadeIn px-4">
      {/* Bouncing Resume Icon */}
      <div className="mb-6">
        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center shadow-lg animate-bounce">
          <FileText className="w-7 h-7 text-black" />
        </div>
      </div>

      {/* Header */}
      <h2 className="text-2xl font-bold text-emerald-400 mb-2">
        Analyzing Your Resume
      </h2>

      {/* Subtext */}
      <p className="text-sm text-gray-400 text-center mb-6">
        This may take a few moments. Hang tight!
      </p>

      {/* Progress Bar */}
      <div className="w-72 h-2 rounded-full bg-white/10 overflow-hidden shadow-inner">
        <div
          className="h-full bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-500 animate-progress45"
          style={{ animationFillMode: 'forwards' }}
        />
      </div>

      {/* Final Message Display */}
      <p className="text-sm text-gray-500 mt-4 text-center h-5 transition-opacity duration-500 ease-in-out">
        {messages[currentIndex]}
      </p>
    </div>
  );
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const { data: session } = useSession();
  const supabase = createClientComponentClient();

  // Handles when user uploads resume
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploaded = e.target.files?.[0] || null;
    setFile(null);
    setPreviewUrl(null);
    setError('');
    setShowPreview(false);

    if (!uploaded) return;

    if (uploaded.type !== 'application/pdf') {
      setError('Only PDF resumes are supported. Please upload your resume as a .pdf file.');
      return;
    }

    const url = URL.createObjectURL(uploaded);
    setFile(uploaded);
    setPreviewUrl(url);
  };

  // Handles when user clicks analyze resume
  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User not authenticated');

      // API usage check (cost = 10)
      const allowed = await checkApiAllowance(userId, 10);
      if (!allowed) {
        throw new Error('Daily usage limit reached');
      }

      // Delete previous resume file (if it exists)
      const { data: oldResult } = await supabase
        .from('resume_results')
        .select('file_url')
        .eq('user_id', userId)
        .order('uploaded_at', { ascending: false })
        .limit(1)
        .single();

      if (oldResult?.file_url) {
        const oldPath = oldResult.file_url.split('/resumes/')[1];
        if (oldPath) {
          console.log('Deleting old file at:', oldPath);
          await supabase.storage.from('resumes').remove([oldPath]);
        }
      }

      // Upload new resume to Supabase Storage
      const filePath = `${userId}/${Date.now()}_${file.name}`;
      console.log('Uploading to Supabase Storage:', filePath);

      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(filePath, file);
      if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

      const { data: fileUrlData } = supabase.storage.from('resumes').getPublicUrl(filePath);
      const fileUrl = fileUrlData.publicUrl;
      console.log('File uploaded. Public URL:', fileUrl);

      // Analyze resume via backend
      const formData = new FormData();
      formData.append('file', file);
      formData.append('user_id', userId);

      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/analyze`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let message = 'Unknown error';
        try {
          const errorData = await res.json();
          message = errorData.detail || JSON.stringify(errorData);
        } catch {
          message = await res.text();
        }
        throw new Error(message);
      }

      const analysis = await res.json();
      console.log('Analysis complete:', analysis);

      const { error: dbError } = await supabase
        .from('resume_results')
        .upsert(
          {
            user_id: userId,
            file_url: fileUrl,
            file_name: file.name,
            analysis,
          },
          { onConflict: 'user_id' }
        );
      if (dbError) throw new Error(`Insert failed: ${dbError.message}`);

      router.push('/analysis');
    } catch (err) {
      console.error('Error during analysis:', err);

      let friendlyMessage = 'Something went wrong. Please try again.';

      // User-friendly error message outputs
      if (err instanceof Error) {
        if (err.message.includes('User not authenticated')) {
          friendlyMessage = 'You must be signed in to upload a resume.';
        } else if (err.message.includes('No resume')) {
          friendlyMessage = 'Sorry, we could not find your resume. Please retry.';
        } else if (err.message.includes('page limit')) {
          friendlyMessage = 'Your resume has too many pages. Max allowed is 3.';
        } else if (err.message.includes('Only PDF')) {
          friendlyMessage = 'Only PDF resumes are supported.';
        } else if (err.message.includes('Upload failed')) {
          friendlyMessage = 'There was a problem uploading your file. Try again.';
        } else if (err.message.includes('Insert failed')) {
          friendlyMessage = 'There was an issue saving your results. Please retry.';
        } else if (err.message.includes('Failed to parse')) {
          friendlyMessage = 'Unexpected server response. Please retry.';
        } else if (err.message.includes('file is too large')) {
          friendlyMessage = 'Your file is too large. Max allowed size is 2MB.';
        } else if (err.message.includes('Analysis failed')) {
          friendlyMessage = 'Something went wrong while analyzing your resume. Please try again.';
        } else if (err.message.includes('Daily usage limit')) {
          friendlyMessage = '❌ You’ve hit your daily usage limit. Try again tomorrow.';
        }
      }

      setError(friendlyMessage);
      setLoading(false);
    }
  };


  return (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#0b0f14] text-white px-6 py-12">
    {/* Page Header */}
    <section className="w-full max-w-4xl 2xl:max-w-5xl text-center mb-10 animate-fadeInUp">
      <h1 className="text-3xl sm:text-4xl 2xl:text-5xl font-extrabold text-emerald-400 leading-tight mb-4">
        Ready to Level Up Your Resume?
      </h1>
      <p className="text-base sm:text-lg 2xl:text-xl text-gray-300 max-w-xl mx-auto">
        Upload your PDF and get instant, AI-powered insights to improve your resume and stand out from the crowd.
      </p>
    </section>

    <div className="w-full max-w-md 2xl:max-w-lg bg-[#0f1720] rounded-2xl shadow-2xl p-8 space-y-6 2xl:space-y-8 animate-fadeInUp">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <UploadCloud className="w-10 h-10 text-teal-400 mx-auto animate-pulse" />
        <h1 className="text-2xl 2xl:text-3xl font-bold">Upload Your Resume</h1>
        <p className="text-sm 2xl:text-lg text-gray-400">PDF only · Max 3 pages</p>
      </div>

      {/* Drop Zone */}
      <label
        htmlFor="resume-upload"
        className="cursor-pointer flex flex-col items-center justify-center gap-2 border-2 border-dashed border-teal-500 py-6 px-4 rounded-xl hover:border-emerald-400 hover:bg-white/5 transition text-center"
      >
        {file ? (
          <div className="flex items-center gap-2 text-teal-300 truncate">
            <FileText size={18} />
            <span className="break-words">{file.name}</span>
          </div>
        ) : (
          <>
            <UploadCloud size={24} className="text-teal-400" />
            <span className="text-sm 2xl:text-lg text-gray-300">Click to upload your PDF resume</span>
          </>
        )}
      </label>

      <input
        id="resume-upload"
        type="file"
        accept=".pdf"
        className="hidden"
        onChange={handleChange}
      />

      {/* Error Box */}
      {error && (
        <div className="bg-red-900/60 border border-red-600 text-red-200 p-4 rounded-lg shadow-md animate-fadeIn">
          <div className="flex items-center gap-2 mb-1 font-semibold">
            <AlertTriangle size={20} className="text-red-400" />
            Error Uploading Resume
          </div>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Analyze Button */}
      {file && (
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className="w-full bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 rounded-full hover:scale-105 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Analyze Resume
        </button>
      )}
    </div>

    {/* Show Preview Toggle */}
    {file && previewUrl && (
      <div className="mt-6">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="inline-flex items-center gap-2 text-sm px-5 py-2 border border-white/10 rounded-full text-gray-300 hover:bg-white/5 transition-all"
        >
          {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
          {showPreview ? 'Hide Resume Preview' : 'Show Resume Preview'}
        </button>
      </div>
    )}

    {/* Resume Preview */}
    {showPreview && previewUrl && (
      <div className="mt-10 w-full max-w-4xl bg-[#0f1720] p-4 rounded-xl shadow-xl border border-white/10 animate-fadeIn">
        <h2 className="text-lg font-semibold text-center mb-2">Resume Preview</h2>
        <iframe
          src={`${previewUrl}#view=FitH`}
          className="w-full h-[600px] rounded-lg border border-teal-600"
          title="Resume Preview"
        />
      </div>
    )}

    {/* Loading Screen */}
    {loading && <LoadingScreen />}
  </div>
);
}
