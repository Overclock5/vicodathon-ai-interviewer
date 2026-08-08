"use client";

import type { CSSProperties } from "react";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { continueInterview, startInterview } from "../../lib/api";
import type {
  CandidateProfile,
  InterviewMeta,
  Feedback,
} from "../../lib/types";
import { useResponsive } from "../../lib/useResponsive";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

function getQuestionNumber(text: string): number | null {
  const match = text.match(/Question\s+(\d+)\/8/i);
  if (!match) return null;
  return Number(match[1]);
}

export default function InterviewPage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meta, setMeta] = useState<InterviewMeta | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const rawCandidate = localStorage.getItem("selectedCandidate");

    if (!rawCandidate) {
      router.push("/");
      return;
    }

    const parsedCandidate: CandidateProfile = JSON.parse(rawCandidate);
    setCandidate(parsedCandidate);

    const newSessionId =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : `session-${Date.now()}`;

    setSessionId(newSessionId);

    async function begin() {
      try {
        const response = await startInterview(newSessionId, parsedCandidate);
        setMessages([{ role: "assistant", text: response.reply }]);
        setMeta(response.meta ?? null);

        const questionNumber = getQuestionNumber(response.reply);
        if (questionNumber && response.meta) {
          setMeta({
            ...response.meta,
            currentQuestion: questionNumber,
          });
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to start interview."
        );
      } finally {
        setLoading(false);
      }
    }

    begin();
  }, [router]);

  async function handleSend() {
    if (!input.trim() || !sessionId || sending) return;

    const userText = input.trim();
    setInput("");
    setSending(true);
    setError("");

    const nextMessages = [...messages, { role: "user" as const, text: userText }];
    setMessages(nextMessages);

    try {
      const response = await continueInterview(sessionId, userText);

      const updatedMessages = [
        ...nextMessages,
        { role: "assistant" as const, text: response.reply },
      ];
      setMessages(updatedMessages);

      if (response.meta) {
        const questionNumber = getQuestionNumber(response.reply);
        setMeta({
          ...response.meta,
          currentQuestion:
            questionNumber ?? response.meta.currentQuestion,
        });
      }

      if (response.done && response.feedback) {
        const payload = {
          candidate,
          feedback: response.feedback as Feedback,
          transcript: updatedMessages,
          meta: response.meta ?? meta,
        };

        localStorage.setItem("interviewFeedback", JSON.stringify(payload));
        router.push("/report");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to continue interview."
      );
    } finally {
      setSending(false);
    }
  }

  const completedAnswers = useMemo(() => {
    return messages.filter((message) => message.role === "user").length;
  }, [messages]);

  const progressPercent = meta
    ? Math.min((completedAnswers / meta.totalQuestions) * 100, 100)
    : 0;

  if (loading) {
    return (
      <main style={pageStyle(isMobile)}>
        <div style={containerStyle}>
          <p style={{ color: "#a1a1aa" }}>Starting interview...</p>
        </div>
      </main>
    );
  }

  if (error && messages.length === 0) {
    return (
      <main style={pageStyle(isMobile)}>
        <div style={containerStyle}>
          <div style={errorCardStyle}>
            <h2 style={{ marginTop: 0 }}>Unable to start interview</h2>
            <p>{error}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle(isMobile)}>
      <div style={containerStyle}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "320px 1fr" : "1fr",
            gap: 20,
          }}
        >
          <aside
            style={{
              display: "grid",
              gap: 16,
              alignSelf: "start",
            }}
          >
            <div style={panelStyle(isMobile)}>
              <p style={mutedLabelStyle}>Candidate</p>
              <h2 style={{ marginTop: 8, marginBottom: 8 }}>
                {candidate?.member.name}
              </h2>
              <p style={{ color: "#d4d4d8", margin: 0 }}>
                {candidate?.member.jobRole}
              </p>
            </div>

            <div style={panelStyle(isMobile)}>
              <p style={mutedLabelStyle}>Interview Progress</p>
              <div
                style={{
                  fontSize: isMobile ? 24 : 30,
                  fontWeight: 800,
                  marginTop: 8,
                }}
              >
                {meta?.currentQuestion || completedAnswers}/
                {meta?.totalQuestions || 8}
              </div>
              <p style={{ color: "#a1a1aa", marginTop: 8 }}>
                Answers submitted: {completedAnswers}
              </p>

              <div style={progressTrackStyle}>
                <div
                  style={{
                    ...progressFillStyle,
                    width: `${progressPercent}%`,
                  }}
                />
              </div>
            </div>

            <div style={panelStyle(isMobile)}>
              <p