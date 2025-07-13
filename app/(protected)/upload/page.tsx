'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { UploadCloud, FileText, AlertTriangle } from 'lucide-react';

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
      setError('Only PDF resumes are supported.');
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
        const errorText = await res.text();
        throw new Error(`Backend error: ${errorText}`);
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
      setError('Something went wrong during resume analysis.');
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
              <FileText size={18} />
              <span className="truncate">{file.name}</span>
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
          <p className="text-red-400 text-sm mt-2 flex items-center justify-center gap-2">
            <AlertTriangle size={16} />
            {error}
          </p>
        )}

        {file && (
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition font-semibold"
          >
            Analyze Resume
          </button>
        )}
      </div>

      {file && previewUrl && (
        <div className="mt-6 animate-fadeInUp">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="px-4 py-2 rounded-lg bg-green-700 hover:bg-green-600 transition text-white font-semibold"
          >
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
