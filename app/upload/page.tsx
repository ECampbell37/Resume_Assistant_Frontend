'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, FileText, AlertTriangle } from 'lucide-react';

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

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
    if (!file || !previewUrl) return;

    setLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:8000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Resume analysis failed.');
      }

      const data = await res.json();

      const resultsWithPreview = {
        ...data,
        previewUrl,
      };

      localStorage.setItem('resumeResults', JSON.stringify(resultsWithPreview));
      router.push('/analysis');
    } catch (err) {
      console.error(err);
      setError('Something went wrong during resume analysis.');
    } finally {
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
            className="mt-4 w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              'Analyze Resume'
            )}
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

    </div>
  );
}
