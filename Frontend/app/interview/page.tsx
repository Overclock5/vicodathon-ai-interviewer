"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { continueInterview, startInterview } from "../../lib/api";
import type {
  CandidateProfile,
  Feedback,
  InterviewMeta,
} from "../../lib/types";

type ChatMessage = {
  role: "assistant" | "user";
  text: string;
};

function getQuestionNumber(text: string): number | null {
  const match = text.match(/Question\s+(\d+)\/8/i);
  if (!match) return null;
  return Number(match[1]);
}

function getRecommendationPillClass(label?: string | null) {
  if (!label) return "pill pill-cyan";
  const value = label.toLowerCase();
  if (value.includes("ready")) return "pill pill-green";
  if (value.includes("promising")) return "pill pill-yellow";
  return "pill pill-red";
}

function getDisplayRecommendationLabel(label?: string | null) {
  if (!label) return "Interview in Progress";
  if (label === "Needs Revision") return "Needs More Depth";
  return label;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function InterviewPage() {
  const router = useRouter();

  const [candidate, setCandidate] = useState<CandidateProfile | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [meta, setMeta] = useState<InterviewMeta | null>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

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
          currentQuestion: questionNumber ?? response.meta.currentQuestion,
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

  const completedAnswers = useMemo(
    () => messages.filter((message) => message.role === "user").length,
    [messages]
  );

  const progressPercent = meta
    ? Math.min((completedAnswers / meta.totalQuestions) * 100, 100)
    : 0;

  const strongestTopic = meta?.competencyMap?.[0];
  const coveredDaysCount = meta?.coveredDays?.length ?? 0;

  if (loading) {
    return (
      <main className="app-shell">
        <p className="muted-note">Starting interview...</p>
      </main>
    );
  }

  if (error && messages.length === 0) {
    return (
      <main className="app-shell">
        <div className="error-card">
          <h2 style={{ marginTop: 0 }}>Unable to start interview</h2>
          <p style={{ marginBottom: 0 }}>{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="interview-layout">
        <aside className="sidebar-stack">
          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Candidate</p>

              <div className="preview-person" style={{ marginTop: 14, marginBottom: 0 }}>
                <div className="avatar lg">
                  {candidate ? getInitials(candidate.member.name) : "AI"}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 28, lineHeight: 1.05 }}>
                    {candidate?.member.name}
                  </h3>
                  <p className="preview-role" style={{ marginTop: 8 }}>
                    {candidate?.member.jobRole}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Interview Progress</p>

              <div style={{ marginTop: 12, fontSize: 28, fontWeight: 820 }}>
                {meta?.currentQuestion || completedAnswers}/{meta?.totalQuestions || 8}
              </div>

              <p className="muted-note" style={{ marginTop: 8 }}>
                Answers submitted: {completedAnswers}
              </p>

              <div className="progress-track" style={{ marginTop: 16 }}>
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Covered Curriculum Days</p>

              <div className="badge-wrap">
                {(meta?.coveredDays ?? []).length > 0 ? (
                  meta?.coveredDays.map((day) => (
                    <span key={day} className="day-badge">
                      D{day}
                    </span>
                  ))
                ) : (
                  <span className="muted-note">
                    Days will appear here as the interview progresses.
                  </span>
                )}
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Interview Mind Map</p>

              <div className="skill-grid">
                {(meta?.competencyMap ?? []).map((node) => (
                  <div key={node.topic}>
                    <div className="skill-head">
                      <span className="skill-name">{node.topic}</span>
                      <span
                        className="skill-level"
                        style={{
                          color:
                            node.level === "strong"
                              ? "#86efac"
                              : node.level === "average"
                                ? "#fde68a"
                                : "#fca5a5",
                        }}
                      >
                        {node.level}
                      </span>
                    </div>

                    <div className="skill-track">
                      <div
                        className="skill-fill"
                        style={{
                          width: `${node.score}%`,
                          background:
                            node.level === "strong"
                              ? "#22c55e"
                              : node.level === "average"
                                ? "#eab308"
                                : "#ef4444",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Live Interview Signals</p>

              <div className="signal-grid">
                <SignalCard
                  title="Current Recommendation"
                  value={meta?.recommendation || "Building signal..."}
                />
                <SignalCard
                  title="Covered Days"
                  value={`${coveredDaysCount} topic day${coveredDaysCount === 1 ? "" : "s"}`}
                />
                <SignalCard
                  title="Strongest Current Topic"
                  value={
                    strongestTopic
                      ? `${strongestTopic.topic} (${strongestTopic.score}%)`
                      : "Will appear as the interview progresses"
                  }
                />
                <SignalCard
                  title="What the interviewer is testing"
                  value="Concept clarity, implementation detail, engineering trade-offs, and production thinking."
                />
              </div>
            </div>
          </section>
        </aside>

        <section className="glass-card chat-card">
          <div className="card-inner" style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div className="chat-header">
              <div>
                <h1 className="chat-title">Interview Workspace</h1>
                <p className="chat-subtitle">
                  Respond naturally as if you are in a real technical interview.
                </p>
              </div>

              {meta?.recommendation ? (
                <span className={getRecommendationPillClass(meta.recommendation)}>
                  {getDisplayRecommendationLabel(meta.recommendation)}
                </span>
              ) : (
                <span className="pill pill-cyan">Interview in Progress</span>
              )}
            </div>

            <div style={{ marginTop: 16 }}>
              <span className="pill pill-cyan">
                Adaptive follow-up in progress
              </span>
            </div>

            <div className="chat-scroll">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`chat-row ${message.role === "user" ? "user" : "assistant"}`}
                >
                  <div className="bubble-stack">
                    <p className="bubble-role">
                      {message.role === "user" ? "Candidate" : "Interviewer"}
                    </p>
                    <div
                      className={`chat-bubble ${message.role === "user" ? "user" : "assistant"}`}
                    >
                      {message.text}
                    </div>
                  </div>
                </div>
              ))}

              {sending && (
                <div className="chat-row assistant">
                  <div className="bubble-stack">
                    <p className="bubble-role">Interviewer</p>
                    <div className="chat-bubble assistant chat-thinking">
                      Interviewer is thinking...
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {error && (
              <div className="error-card" style={{ marginTop: 12 }}>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <div className="input-zone">
              <textarea
                className="input-textarea"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your interview answer..."
                disabled={sending}
              />

              <button
                className="primary-button"
                onClick={handleSend}
                disabled={sending || !input.trim()}
              >
                {sending ? "Sending..." : "Send Answer"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function SignalCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="signal-card">
      <p className="signal-title">{title}</p>
      <p className="signal-value">{value}</p>
    </div>
  );
}