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

export type CompetencyNode = {
  topic: string;
  score: number;
  level: "strong" | "average" | "weak";
};

export type ScoreBreakdown = {
  technical: number;
  communication: number;
  reasoning: number;
};

export type InterviewMeta = {
  sessionId: string;
  currentQuestion: number;
  totalQuestions: number;
  coveredDays: number[];
  competencyMap: CompetencyNode[];
  recommendation?: string | null;
  scoreBreakdown?: ScoreBreakdown | null;
};

export type InterviewResponse = {
  reply: string;
  done: boolean;
  feedback?: Feedback | null;
  meta?: InterviewMeta | null;
};