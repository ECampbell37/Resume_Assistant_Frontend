'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UploadCloud, FileText, AlertTriangle, Eye, EyeOff } from 'lucide-react';

function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black text-green-300 animate-fadeIn">
      <FileText className="w-12 h-12 text-green-400 animate-bounce mb-6" />
      <h2 className="text-xl font-semibold mb-4">Analyzing your resume...</h2>
      <div className="w-64 h-2 bg-zinc-700 rounded-full overflow-hidden">
        <div className="bg-green-500 h-full animate-progress45" style={{ animationFillMode: 'forwards' }} />
      </div>
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

  const handleAnalyze = async () => {
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const userId = session?.user?.id;
      if (!userId) throw new Error('User not authenticated');

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
          const errorData = await res.json(); // <-- try to parse error response
          message = errorData.detail || JSON.stringify(errorData);
        } catch {
          message = await res.text(); // fallback for non-JSON responses
        }
        throw new Error(message); // throw with actual message
      }

      const analysis = await res.json();
      console.log('Analysis complete:', analysis);

      // Upsert new analysis result into DB
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

      // Redirect to analysis screen
      router.push('/analysis');
    } catch (err) {
      console.error('Error during analysis:', err);

      let friendlyMessage = 'Something went wrong. Please try again.';

      if (err instanceof Error) {
        // Check for expected patterns
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
        }
      }

      setError(friendlyMessage);
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-green-300 px-6 py-10">
      <div className="bg-zinc-900 p-8 rounded-2xl shadow-lg w-full max-w-md text-center animate-fadeInUp">
        <UploadCloud className="w-10 h-10 text-green-400 mx-auto mb-4 animate-pulse" />
        <h1 className="text-2xl font-bold mb-2">Upload Your Resume</h1>
        <p className="text-green-500 mb-6">PDF format only. Max file size of 3 pages.</p>

        <label
          htmlFor="resume-upload"
          className="cursor-pointer flex flex-col items-center border-2 border-dashed border-green-500 py-6 px-4 rounded-xl hover:border-green-400 transition mb-4"
        >
          {file ? (
            <div className="flex items-center gap-2 text-green-200 truncate">
              <FileText size={18} className="shrink-0" />
              <span className="text-green-200 break-words whitespace-normal">
                {file.name}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-green-400">
              <UploadCloud size={24} />
              <span className="mt-2 text-sm">Click to upload your PDF resume</span>
            </div>
          )}
        </label>

        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          className="hidden"
          onChange={handleChange}
        />

        {error && (
          <div className="mt-4 w-full max-w-md bg-red-900 border border-red-600 text-red-200 p-4 rounded-lg shadow-lg animate-fadeIn space-y-2">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-red-400" size={20} />
              <h2 className="font-semibold text-red-300 text-base">Error Uploading Resume</h2>
            </div>
            <p className="text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {file && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 text-white text-lg font-semibold py-3 rounded-full hover:scale-105 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Analyze Resume
          </button>
        )}
      </div>

      {file && previewUrl && (
        <div className="mt-6 animate-fadeInUp">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="inline-flex items-center gap-2 px-6 py-2 bg-transparent text-zinc-300 rounded-full font-semibold hover:bg-gradient-to-r hover:from-zinc-500 hover:via-zinc-600 hover:to-zinc-500 hover:text-white hover:scale-105 transition-all duration-300"
          >
            {showPreview ? <EyeOff size={18} /> : <Eye size={18} />}
            {showPreview ? 'Hide Resume Preview' : 'Show Resume Preview'}
          </button>
        </div>
      )}

      {showPreview && previewUrl && (
        <div className="mt-8 bg-zinc-800 p-4 rounded-xl shadow max-w-4xl w-full animate-fadeIn">
          <h2 className="text-lg font-semibold mb-2 text-center">Your Resume</h2>
          <iframe
            src={`${previewUrl}#view=FitH`}
            className="w-full h-[1000px] rounded-lg border border-green-700"
            title="Resume Preview"
          />
        </div>
      )}

      {loading && <LoadingScreen />}
    </div>
  );
}
