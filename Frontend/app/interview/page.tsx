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
      <main style={pageStyle}>
        <div style={containerStyle}>
          <p style={{ color: "#a1a1aa" }}>Starting interview...</p>
        </div>
      </main>
    );
  }

  if (error && messages.length === 0) {
    return (
      <main style={pageStyle}>
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
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={gridStyle}>
          <aside style={sidebarStyle}>
            <div style={panelStyle}>
              <p style={mutedLabelStyle}>Candidate</p>
              <h2 style={{ marginTop: 8, marginBottom: 8 }}>
                {candidate?.member.name}
              </h2>
              <p style={{ color: "#d4d4d8", margin: 0 }}>
                {candidate?.member.jobRole}
              </p>
            </div>

            <div style={panelStyle}>
              <p style={mutedLabelStyle}>Interview Progress</p>
              <div style={{ fontSize: 30, fontWeight: 800, marginTop: 8 }}>
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

            <div style={panelStyle}>
              <p style={mutedLabelStyle}>Covered Curriculum Days</p>
              <div style={badgeWrapStyle}>
                {(meta?.coveredDays ?? []).length > 0 ? (
                  meta?.coveredDays.map((day) => (
                    <span key={day} style={dayBadgeStyle}>
                      Day {day}
                    </span>
                  ))
                ) : (
                  <span style={{ color: "#a1a1aa" }}>
                    Days will appear here as the interview progresses.
                  </span>
                )}
              </div>
            </div>

            <div style={panelStyle}>
              <p style={mutedLabelStyle}>Interview Mind Map</p>
              <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
                {(meta?.competencyMap ?? []).map((node) => (
                  <div key={node.topic}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 600 }}>{node.topic}</span>
                      <span
                        style={{
                          color:
                            node.level === "strong"
                              ? "#86efac"
                              : node.level === "average"
                              ? "#fde68a"
                              : "#fca5a5",
                          fontSize: 13,
                          textTransform: "capitalize",
                        }}
                      >
                        {node.level}
                      </span>
                    </div>
                    <div style={skillTrackStyle}>
                      <div
                        style={{
                          ...skillFillStyle,
                          width: `${node.score}%`,
                          background:
                            node.level === "strong"
                              ? "#16a34a"
                              : node.level === "average"
                              ? "#ca8a04"
                              : "#dc2626",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section style={chatPanelStyle}>
            <div style={chatHeaderStyle}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <h1 style={{ margin: 0, fontSize: 28 }}>Interview Workspace</h1>
                  <p style={{ color: "#a1a1aa", marginTop: 8 }}>
                    Respond naturally as if you are in a real technical interview.
                  </p>
                </div>

                {meta?.recommendation ? (
                  <span style={recommendationPillStyle}>
                    Signal: {meta.recommendation}
                  </span>
                ) : null}
              </div>
            </div>

            <div style={chatMessagesStyle}>
              {messages.map((message, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    justifyContent:
                      message.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "14px 16px",
                      borderRadius: 16,
                      background:
                        message.role === "user" ? "#0f766e" : "#18181b",
                      border:
                        message.role === "user"
                          ? "1px solid #14b8a6"
                          : "1px solid #27272a",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.5,
                    }}
                  >
                    {message.text}
                  </div>
                </div>
              ))}
            </div>

            {error && (
              <div style={{ ...errorCardStyle, marginTop: 12 }}>
                <p style={{ margin: 0 }}>{error}</p>
              </div>
            )}

            <div style={inputRowStyle}>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your interview answer..."
                rows={4}
                style={textareaStyle}
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                style={{
                  ...sendButtonStyle,
                  opacity: sending || !input.trim() ? 0.6 : 1,
                  cursor: sending || !input.trim() ? "not-allowed" : "pointer",
                }}
              >
                {sending ? "Sending..." : "Send Answer"}
              </button>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

const pageStyle: CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#ffffff",
  padding: "28px 18px",
};

const containerStyle: CSSProperties = {
  maxWidth: 1280,
  margin: "0 auto",
};

const gridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: 20,
};

const sidebarStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  alignSelf: "start",
};

const panelStyle: CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 20,
};

const chatPanelStyle: CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  minHeight: "82vh",
};

const chatHeaderStyle: CSSProperties = {
  borderBottom: "1px solid #27272a",
  paddingBottom: 14,
};

const chatMessagesStyle: CSSProperties = {
  flex: 1,
  display: "grid",
  gap: 14,
  paddingTop: 18,
  paddingBottom: 18,
  overflowY: "auto",
};

const inputRowStyle: CSSProperties = {
  borderTop: "1px solid #27272a",
  paddingTop: 16,
  display: "grid",
  gap: 12,
};

const textareaStyle: CSSProperties = {
  width: "100%",
  borderRadius: 14,
  border: "1px solid #3f3f46",
  background: "#09090b",
  color: "#fff",
  padding: 14,
  fontSize: 15,
  resize: "vertical",
  boxSizing: "border-box",
};

const sendButtonStyle: CSSProperties = {
  background: "#0891b2",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "14px 18px",
  fontWeight: 700,
  fontSize: 16,
};

const errorCardStyle: CSSProperties = {
  background: "#2a1111",
  border: "1px solid #7f1d1d",
  color: "#fecaca",
  padding: 16,
  borderRadius: 12,
};

const mutedLabelStyle: CSSProperties = {
  margin: 0,
  color: "#a1a1aa",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};

const progressTrackStyle: CSSProperties = {
  width: "100%",
  height: 10,
  background: "#27272a",
  borderRadius: 999,
  overflow: "hidden",
  marginTop: 14,
};

const progressFillStyle: CSSProperties = {
  height: "100%",
  background: "linear-gradient(90deg, #06b6d4, #3b82f6)",
  borderRadius: 999,
};

const badgeWrapStyle: CSSProperties = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  marginTop: 12,
};

const dayBadgeStyle: CSSProperties = {
  background: "#082f49",
  color: "#bae6fd",
  borderRadius: 999,
  padding: "6px 10px",
  fontSize: 12,
  border: "1px solid #0ea5e9",
};

const skillTrackStyle: CSSProperties = {
  width: "100%",
  height: 10,
  background: "#27272a",
  borderRadius: 999,
  overflow: "hidden",
};

const skillFillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
};

const recommendationPillStyle: CSSProperties = {
  background: "#1e293b",
  color: "#bfdbfe",
  border: "1px solid #3b82f6",
  borderRadius: 999,
  padding: "8px 12px",
  fontWeight: 700,
  fontSize: 13,
};