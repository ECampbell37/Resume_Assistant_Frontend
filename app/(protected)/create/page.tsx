/************************************************************
 * Name:    Elijah Campbell-Ihim
 * Project: Resume Assistant
 * File:    /app/(protected)/create/page.tsx
 ************************************************************/

'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  User,
  FileText,
  Briefcase,
  GraduationCap,
  ListChecks,
  ClipboardCheck,
  FolderKanban,
  AlertCircle,
  ScrollText,
  Info,
} from 'lucide-react';
import ToolsNav from '@/components/ToolsNav';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { checkApiAllowance } from '@/lib/checkApiAllowance';
import { copyMarkdownAsRichText } from '@/lib/copyMarkdownAsRichText';
import { ResumeFormData, emptyResumeFormData } from '@/types/resume';

const STEPS = [
  { label: 'Personal Info', icon: User },
  { label: 'Summary', icon: FileText },
  { label: 'Experience', icon: Briefcase },
  { label: 'Education', icon: GraduationCap },
  { label: 'Skills & Projects', icon: ListChecks },
  { label: 'Review', icon: ClipboardCheck },
] as const;

const uid = () => Math.random().toString(36).slice(2, 10);
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

export default function CreateResumePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ResumeFormData>(emptyResumeFormData);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');

  const { data: session } = useSession();
  const router = useRouter();

  // ---------- Validation ----------
  const validateStep = (s: number, f: ResumeFormData = form): string | null => {
    switch (s) {
      case 0: {
        if (!f.personalInfo.fullName.trim()) return 'Please enter your full name.';
        if (!f.personalInfo.email.trim()) return 'Please enter your email.';
        if (!isValidEmail(f.personalInfo.email)) return 'Please enter a valid email address.';
        if (!f.personalInfo.location.trim()) return 'Please enter your location.';
        return null;
      }
      case 2: {
        if (f.experience.length === 0) return 'Add at least one job.';
        if (f.experience.some((e) => !e.jobTitle.trim() || !e.company.trim()))
          return 'Each job needs at least a title and company.';
        return null;
      }
      case 3: {
        if (f.education.length === 0) return 'Add at least one school.';
        if (f.education.some((e) => !e.school.trim())) return 'Each school entry needs at least a school name.';
        return null;
      }
      default:
        return null;
    }
  };

  const next = () => {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError('');
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const back = () => {
    setStepError('');
    setStep((s) => Math.max(s - 1, 0));
  };

  // ---------- Field helpers ----------
  const updatePersonal = (field: keyof ResumeFormData['personalInfo'], value: string) =>
    setForm((f) => ({ ...f, personalInfo: { ...f.personalInfo, [field]: value } }));

  const addExperience = () =>
    setForm((f) => ({
      ...f,
      experience: [
        ...f.experience,
        { id: uid(), jobTitle: '', company: '', location: '', startDate: '', endDate: '', responsibilities: '' },
      ],
    }));

  const updateExperience = (id: string, field: string, value: string) =>
    setForm((f) => ({
      ...f,
      experience: f.experience.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const removeExperience = (id: string) =>
    setForm((f) => ({ ...f, experience: f.experience.filter((e) => e.id !== id) }));

  const addEducation = () =>
    setForm((f) => ({
      ...f,
      education: [
        ...f.education,
        { id: uid(), school: '', degree: '', fieldOfStudy: '', location: '', graduationDate: '', honors: '' },
      ],
    }));

  const updateEducation = (id: string, field: string, value: string) =>
    setForm((f) => ({
      ...f,
      education: f.education.map((e) => (e.id === id ? { ...e, [field]: value } : e)),
    }));

  const removeEducation = (id: string) =>
    setForm((f) => ({ ...f, education: f.education.filter((e) => e.id !== id) }));

  const addProject = () =>
    setForm((f) => ({
      ...f,
      projects: [...f.projects, { id: uid(), name: '', description: '', technologies: '' }],
    }));

  const updateProject = (id: string, field: string, value: string) =>
    setForm((f) => ({
      ...f,
      projects: f.projects.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    }));

  const removeProject = (id: string) =>
    setForm((f) => ({ ...f, projects: f.projects.filter((p) => p.id !== id) }));

  // ---------- Generate ----------
  const handleGenerate = async () => {
    // Safety net in case a required field was cleared after its step was already passed
    const firstBadStep = [0, 2, 3].find((s) => validateStep(s));
    if (firstBadStep !== undefined) {
      setStep(firstBadStep);
      setStepError(validateStep(firstBadStep) || '');
      return;
    }

    const userId = session?.user?.id;
    if (!userId) {
      router.push('/signup');
      return;
    }

    const allowed = await checkApiAllowance(userId, 1);
    if (!allowed) {
      setError('❌ You’ve hit your daily usage limit. Please try again tomorrow.');
      return;
    }

    setGenerating(true);
    setError('');
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_PYTHON_API}/generate-resume`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error(await res.text());
      const text = await res.text();
      setResult(text);
    } catch (err) {
      console.error(err);
      setError('❌ Something went wrong generating your resume. Please try again.');
    }
    setGenerating(false);
  };

  const handleCopy = async () => {
    await copyMarkdownAsRichText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const inputClass =
    'w-full bg-zinc-800 text-emerald-200 px-4 py-2 rounded-lg border border-teal-600/30 focus:outline-none focus:ring-2 focus:ring-teal-400/60 focus:border-teal-400/60 transition-all duration-200 text-sm placeholder:text-gray-600';
  const invalidClass = 'border-red-500/60 focus:ring-red-400/60 focus:border-red-400/60';
  const labelClass = 'text-xs font-semibold text-teal-300 mb-1 block';
  const addButtonClass =
    'inline-flex items-center gap-1.5 text-sm bg-teal-600/15 text-teal-300 px-3.5 py-2 rounded-lg border border-teal-600/20 hover:bg-teal-600/25 hover:border-teal-500/40 transition-all duration-200';
  const cardClass =
    'group bg-zinc-800 p-4 rounded-xl space-y-3 border border-zinc-700 hover:border-teal-700/50 transition-colors duration-200';
  const badgeClass =
    'inline-flex items-center gap-1.5 text-xs font-semibold text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-full';
  const deleteButtonClass =
    'p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200';

  // Field-level invalid helpers — only show red once the user has tried to advance on this step
  const personalInvalid = !!stepError && step === 0;
  const expInvalid = !!stepError && step === 2;
  const eduInvalid = !!stepError && step === 3;

  const EmptyState = ({
    icon: Icon,
    label,
    onClick,
  }: {
    icon: React.ElementType;
    label: string;
    onClick: () => void;
  }) => (
    <button
      onClick={onClick}
      className="w-full flex flex-col items-center justify-center gap-2 py-10 rounded-xl border-2 border-dashed border-zinc-700 text-gray-500 hover:border-teal-500/50 hover:text-teal-300 hover:bg-teal-500/5 transition-all duration-200"
    >
      <Icon className="w-8 h-8" />
      <span className="text-sm font-medium">{label}</span>
    </button>
  );

  // ---------- Result view ----------
  if (result) {
    return (
      <div className="min-h-screen flex flex-col items-center bg-[#0b0f14] text-teal-300 px-4 py-8 pt-16">
        <div className="w-full max-w-4xl text-center mb-10 space-y-3 animate-fadeInUp">
          <h1 className="text-4xl font-extrabold tracking-tight text-white">Your Resume ✨</h1>
          <p className="text-emerald-300 text-base md:text-lg">
            Copy the text below into your favorite document editor to finish formatting.
          </p>
        </div>

        <div className="w-full max-w-4xl flex flex-col bg-zinc-900 p-6 rounded-3xl shadow-xl animate-fadeInUp">
          <div className="max-h-[540px] overflow-y-auto bg-zinc-800 p-6 rounded-xl prose prose-invert max-w-none">
            <MarkdownRenderer content={result} />
          </div>
          <div className="mt-4 flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleCopy}
              className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black font-semibold py-3 rounded-xl hover:brightness-110 hover:scale-[1.01] shadow-lg shadow-teal-500/20 transition-all duration-200"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy to Clipboard'}
            </button>
            <button
              onClick={() => setResult('')}
              className="flex-1 border border-white/20 text-white font-semibold py-3 rounded-xl hover:bg-white/10 hover:border-white/30 transition-all duration-200"
            >
              Edit Details
            </button>
          </div>
        </div>

        <div className="mt-12 w-full">
          <ToolsNav />
        </div>
      </div>
    );
  }

  // ---------- Wizard view ----------
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#0b0f14] text-teal-300 px-4 py-8">
      <div className="w-full max-w-3xl text-center mb-8 space-y-3 animate-fadeInUp">
        <div className="flex justify-center">
          <Sparkles className="w-8 h-8 text-teal-400 animate-pulse" />
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white">Create Your Resume</h1>
        <p className="text-emerald-300 text-base md:text-lg">
          Fill out each step — our AI will strengthen your wording and format everything for you.
        </p>
      </div>

      {/* Step indicator */}
      <div className="w-full max-w-3xl mb-10 px-2">
        <div className="relative flex items-center justify-between">
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-zinc-800" />
          <div
            className="absolute top-4 left-0 h-0.5 bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500 ease-out"
            style={{ width: `${(step / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map(({ label, icon: Icon }, i) => (
            <div key={label} className="relative z-10 flex-1 flex flex-col items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  i === step
                    ? 'bg-gradient-to-r from-teal-400 to-emerald-500 text-black shadow-[0_0_12px_rgba(45,212,191,0.6)] scale-110'
                    : i < step
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-800 text-gray-500 border border-zinc-700'
                }`}
              >
                {i < step ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              <span
                className={`text-[10px] hidden sm:block text-center transition-colors duration-300 ${
                  i === step ? 'text-teal-300 font-semibold' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="w-full max-w-3xl bg-zinc-900 p-6 md:p-8 rounded-3xl shadow-xl min-h-[420px] flex flex-col">
        <div className="flex-1 space-y-5">
          {/* Step 0: Personal Info */}
          {step === 0 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <User className="w-5 h-5 text-teal-400" /> Personal Info
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    className={`${inputClass} ${personalInvalid && !form.personalInfo.fullName.trim() ? invalidClass : ''}`}
                    placeholder="Jane Doe"
                    value={form.personalInfo.fullName}
                    onChange={(e) => updatePersonal('fullName', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Email *</label>
                  <input
                    className={`${inputClass} ${
                      personalInvalid && (!form.personalInfo.email.trim() || !isValidEmail(form.personalInfo.email))
                        ? invalidClass
                        : ''
                    }`}
                    placeholder="jane@email.com"
                    value={form.personalInfo.email}
                    onChange={(e) => updatePersonal('email', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>Phone</label>
                  <input className={inputClass} placeholder="555-123-4567" value={form.personalInfo.phone} onChange={(e) => updatePersonal('phone', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Location (City, State) *</label>
                  <input
                    className={`${inputClass} ${personalInvalid && !form.personalInfo.location.trim() ? invalidClass : ''}`}
                    placeholder="Waldwick, NJ"
                    value={form.personalInfo.location}
                    onChange={(e) => updatePersonal('location', e.target.value)}
                  />
                </div>
                <div>
                  <label className={labelClass}>LinkedIn</label>
                  <input className={inputClass} placeholder="linkedin.com/in/janedoe" value={form.personalInfo.linkedin} onChange={(e) => updatePersonal('linkedin', e.target.value)} />
                </div>
                <div>
                  <label className={labelClass}>Other Links (Portfolio, GitHub)</label>
                  <input className={inputClass} placeholder="janedoe.com" value={form.personalInfo.otherLinks} onChange={(e) => updatePersonal('otherLinks', e.target.value)} />
                </div>
              </div>
            </div>
          )}

          {/* Step 1: Summary */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-teal-400" /> Professional Summary
              </h2>
              <p className="text-sm text-gray-400">
                Optional — leave blank and the AI will write one for you based on your experience.
              </p>
              <textarea
                className={`${inputClass} h-40`}
                value={form.summary}
                onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                placeholder="e.g. Recent CS grad with a passion for full-stack development..."
              />
            </div>
          )}

          {/* Step 2: Experience */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-teal-400" /> Work Experience *
                </h2>
                {form.experience.length > 0 && (
                  <button onClick={addExperience} className={addButtonClass}>
                    <Plus className="w-4 h-4" /> Add Job
                  </button>
                )}
              </div>

              {form.experience.length === 0 && (
                <EmptyState icon={Briefcase} label="No jobs added yet — click to add your first one" onClick={addExperience} />
              )}

              {form.experience.map((exp, idx) => (
                <div key={exp.id} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className={badgeClass}>
                      <Briefcase className="w-3 h-3" /> Job {idx + 1}
                    </span>
                    <button onClick={() => removeExperience(exp.id)} className={deleteButtonClass} aria-label="Remove job">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className={`${inputClass} ${expInvalid && !exp.jobTitle.trim() ? invalidClass : ''}`}
                      placeholder="Job Title *"
                      value={exp.jobTitle}
                      onChange={(e) => updateExperience(exp.id, 'jobTitle', e.target.value)}
                    />
                    <input
                      className={`${inputClass} ${expInvalid && !exp.company.trim() ? invalidClass : ''}`}
                      placeholder="Company *"
                      value={exp.company}
                      onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                    />
                    <input className={inputClass} placeholder="Location" value={exp.location} onChange={(e) => updateExperience(exp.id, 'location', e.target.value)} />
                    <div className="grid grid-cols-2 gap-3">
                      <input className={inputClass} placeholder="Start Date" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                      <input className={inputClass} placeholder="End Date" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>What did you do at this job?</label>
                    <p className="text-xs text-gray-500 mb-2">
                      Just describe it in your own words — day-to-day tasks, projects, anything you&apos;re proud of.
                      We&apos;ll turn it into polished bullet points for you.
                    </p>
                    <textarea
                      className={`${inputClass} h-28`}
                      placeholder="e.g. I helped run the front counter, trained new hires, handled customer complaints, and closed the store most nights..."
                      value={exp.responsibilities}
                      onChange={(e) => updateExperience(exp.id, 'responsibilities', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 3: Education */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5 text-teal-400" /> Education *
                </h2>
                {form.education.length > 0 && (
                  <button onClick={addEducation} className={addButtonClass}>
                    <Plus className="w-4 h-4" /> Add School
                  </button>
                )}
              </div>

              {form.education.length === 0 && (
                <EmptyState icon={GraduationCap} label="No education added yet — click to add your first one" onClick={addEducation} />
              )}

              {form.education.map((ed, idx) => (
                <div key={ed.id} className={cardClass}>
                  <div className="flex items-center justify-between">
                    <span className={badgeClass}>
                      <GraduationCap className="w-3 h-3" /> School {idx + 1}
                    </span>
                    <button onClick={() => removeEducation(ed.id)} className={deleteButtonClass} aria-label="Remove school">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      className={`${inputClass} ${eduInvalid && !ed.school.trim() ? invalidClass : ''}`}
                      placeholder="School *"
                      value={ed.school}
                      onChange={(e) => updateEducation(ed.id, 'school', e.target.value)}
                    />
                    <input className={inputClass} placeholder="Degree (e.g. B.S.)" value={ed.degree} onChange={(e) => updateEducation(ed.id, 'degree', e.target.value)} />
                    <input className={inputClass} placeholder="Field of Study" value={ed.fieldOfStudy} onChange={(e) => updateEducation(ed.id, 'fieldOfStudy', e.target.value)} />
                    <input className={inputClass} placeholder="Location" value={ed.location} onChange={(e) => updateEducation(ed.id, 'location', e.target.value)} />
                    <input className={inputClass} placeholder="Graduation Date" value={ed.graduationDate} onChange={(e) => updateEducation(ed.id, 'graduationDate', e.target.value)} />
                    <input className={inputClass} placeholder="Honors / GPA (optional)" value={ed.honors} onChange={(e) => updateEducation(ed.id, 'honors', e.target.value)} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Skills & Projects */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <ListChecks className="w-5 h-5 text-teal-400" /> Skills
                </h2>
                <p className="text-xs text-gray-400 mb-2">
                  Optional — list any you&apos;d like included. If you leave this blank, we&apos;ll infer relevant
                  skills from your experience, projects, and education.
                </p>
                <textarea
                  className={`${inputClass} h-20`}
                  placeholder="e.g. Python, customer service, Excel..."
                  value={form.skills}
                  onChange={(e) => setForm((f) => ({ ...f, skills: e.target.value }))}
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <ScrollText className="w-5 h-5 text-teal-400" /> Certifications</h2>
                <p className="text-xs text-gray-400 mb-2">Optional</p>
                <textarea
                  className={`${inputClass} h-16`}
                  value={form.certifications}
                  onChange={(e) => setForm((f) => ({ ...f, certifications: e.target.value }))}
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <FolderKanban className="w-5 h-5 text-teal-400" /> Projects
                  </h2>
                  {form.projects.length > 0 && (
                    <button onClick={addProject} className={addButtonClass}>
                      <Plus className="w-4 h-4" /> Add Project
                    </button>
                  )}
                </div>

                {form.projects.length === 0 && (
                  <EmptyState icon={FolderKanban} label="No projects added yet — click to add one (optional)" onClick={addProject} />
                )}

                {form.projects.map((p, idx) => (
                  <div key={p.id} className={`${cardClass} mb-3`}>
                    <div className="flex items-center justify-between">
                      <span className={badgeClass}>
                        <FolderKanban className="w-3 h-3" /> Project {idx + 1}
                      </span>
                      <button onClick={() => removeProject(p.id)} className={deleteButtonClass} aria-label="Remove project">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <input className={inputClass} placeholder="Project Name" value={p.name} onChange={(e) => updateProject(p.id, 'name', e.target.value)} />
                    <input className={inputClass} placeholder="Technologies Used" value={p.technologies} onChange={(e) => updateProject(p.id, 'technologies', e.target.value)} />
                    <textarea className={`${inputClass} h-20`} placeholder="Description" value={p.description} onChange={(e) => updateProject(p.id, 'description', e.target.value)} />
                  </div>
                ))}
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Info className="w-5 h-5 text-teal-400" /> Additional Information</h2>
                <p className="text-xs text-gray-400 mb-2">
                  Optional — mention a job you&apos;re targeting and we&apos;ll tailor the resume toward it, or
                  add anything else that didn&apos;t fit above (like volunteer work, extracurriculars, leadership experience, etc.).
                </p>
                <textarea
                  className={`${inputClass} h-24`}
                  placeholder="e.g. I'm applying for Frontend Developer roles. I also coach youth soccer."
                  value={form.additionalNotes}
                  onChange={(e) => setForm((f) => ({ ...f, additionalNotes: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {step === 5 && (
            <div className="space-y-4 animate-fadeIn">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-teal-400" /> Review & Generate
              </h2>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-800 text-teal-300 px-3 py-1.5 rounded-full border border-zinc-700">
                  <User className="w-3.5 h-3.5" /> {form.personalInfo.fullName || 'Unnamed'}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-800 text-teal-300 px-3 py-1.5 rounded-full border border-zinc-700">
                  <Briefcase className="w-3.5 h-3.5" /> {form.experience.length} job{form.experience.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-800 text-teal-300 px-3 py-1.5 rounded-full border border-zinc-700">
                  <GraduationCap className="w-3.5 h-3.5" /> {form.education.length} school{form.education.length !== 1 ? 's' : ''}
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-zinc-800 text-teal-300 px-3 py-1.5 rounded-full border border-zinc-700">
                  <FolderKanban className="w-3.5 h-3.5" /> {form.projects.length} project{form.projects.length !== 1 ? 's' : ''}
                </span>
              </div>

              <p className="text-sm text-emerald-300">
                Click generate and our AI will polish your wording and format everything into a clean resume.
              </p>
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button
                onClick={handleGenerate}
                disabled={generating}
                className={`relative w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl font-semibold transition-all duration-300 ${
                  generating
                    ? 'bg-zinc-700 text-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-teal-400 via-cyan-400 to-emerald-500 text-black hover:brightness-110 hover:scale-[1.01] shadow-lg shadow-teal-500/20'
                }`}
              >
                <Sparkles className={`w-5 h-5 ${generating ? 'animate-spin' : ''}`} />
                {generating ? 'Generating your resume...' : 'Generate Resume'}
              </button>
            </div>
          )}
        </div>

        {/* Error banner */}
        {stepError && step < 5 && (
          <div className="mt-4 flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2.5 rounded-lg animate-fadeIn">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            {stepError}
          </div>
        )}

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={back}
            disabled={step === 0}
            className={`px-6 py-2.5 rounded-lg flex items-center gap-1 font-semibold text-sm transition-all duration-200 ${
              step === 0 ? 'bg-zinc-700 text-gray-400 cursor-not-allowed' : 'bg-zinc-700 text-white hover:bg-zinc-600'
            }`}
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </button>
          {step < STEPS.length - 1 && (
            <button
              onClick={next}
              className="px-6 py-2.5 rounded-lg flex items-center gap-1 font-semibold text-sm bg-gradient-to-r from-teal-500 to-emerald-500 text-black hover:brightness-110 hover:scale-[1.02] transition-all duration-200"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mt-12 w-full">
        <ToolsNav />
      </div>
    </div>
  );
}