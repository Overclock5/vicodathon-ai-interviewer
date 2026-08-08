import type {
  CandidateProfile,
  CandidatesResponse,
  InterviewResponse,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export async function fetchCandidates(): Promise<CandidateProfile[]> {
  const response = await fetch(`${API_BASE_URL}/api/candidates`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error("Failed to load candidates from backend.");
  }

  const data: CandidatesResponse = await response.json();
  return data.candidates;
}

export async function startInterview(
  sessionId: string,
  candidate: CandidateProfile
): Promise<InterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      candidate,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to start interview: ${text}`);
  }

  return response.json();
}

export async function continueInterview(
  sessionId: string,
  message: string
): Promise<InterviewResponse> {
  const response = await fetch(`${API_BASE_URL}/api/interview`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sessionId,
      message,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to continue interview: ${text}`);
  }

  return response.json();
}