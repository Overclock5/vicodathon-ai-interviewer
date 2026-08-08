export type Member = {
  id: string;
  name: string;
  jobRole: string;
  yearsExperience: number;
  education: string;
  status: string;
};

export type Mission = {
  day: number;
  title: string;
  passed?: boolean;
  attempts?: number;
  skipped?: boolean;
};

export type Signals = {
  commitDays: number;
  missionsCompleted: number;
  missionsFirstTry: number;
};

export type CandidateProfile = {
  member: Member;
  missions: Mission[];
  signals: Signals;
};

export type CandidatesResponse = {
  candidates: CandidateProfile[];
};

export type Feedback = {
  summary: string;
  strengths: string[];
  gaps: string[];
  next: string[];
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: Feedback | null;
};