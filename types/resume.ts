// /types/resume.ts

export interface ExperienceEntry {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string; // "Present" allowed
  responsibilities: string; // free-form: "what did you do at this job?"
}

export interface EducationEntry {
  id: string;
  school: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  graduationDate: string;
  honors: string;
}

export interface ProjectEntry {
  id: string;
  name: string;
  description: string;
  technologies: string;
}

export interface ResumeFormData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    otherLinks: string;
  };
  summary: string; // optional — AI writes one if blank
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string; // optional, free-form — AI infers if blank/sparse
  projects: ProjectEntry[];
  certifications: string; // optional, free-form
}

export const emptyResumeFormData: ResumeFormData = {
  personalInfo: { fullName: '', email: '', phone: '', location: '', linkedin: '', otherLinks: '' },
  summary: '',
  experience: [],
  education: [],
  skills: '',
  projects: [],
  certifications: '',
};