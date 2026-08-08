"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { continueInterview, startInterview } from "../../lib/api";
import type { CandidateProfile, Feedback } from "../../lib/types";

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
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestion, setCurrentQuestion] = useState(0);

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

        const questionNumber = getQuestionNumber(response.reply);
        if (questionNumber) setCurrentQuestion(questionNumber);
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

      const questionNumber = getQuestionNumber(response.reply);
      if (questionNumber) setCurrentQuestion(questionNumber);

      if (response.done && response.feedback) {
        const payload = {
          candidate,
          feedback: response.feedback,
          transcript: updatedMessages,
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
                {currentQuestion || completedAnswers}/8
              </div>
              <p style={{ color: "#a1a1aa", marginTop: 8 }}>
                Answers submitted: {completedAnswers}
              </p>
            </div>

            <div style={panelStyle}>
              <p style={mutedLabelStyle}>Signature Features</p>
              <ul style={{ color: "#d4d4d8", paddingLeft: 18, marginBottom: 0 }}>
                <li>Dynamic Interview Path</li>
                <li>Interview Mind Map</li>
                <li>Hiring Recommendation</li>
              </ul>
            </div>
          </aside>

          <section style={chatPanelStyle}>
            <div style={chatHeaderStyle}>
              <h1 style={{ margin: 0, fontSize: 28 }}>Interview Workspace</h1>
              <p style={{ color: "#a1a1aa", marginTop: 8 }}>
                Respond naturally as if you are in a real technical interview.
              </p>
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

const pageStyle: React.CSSProperties = {
  minHeight: "100vh",
  background: "#050505",
  color: "#ffffff",
  padding: "28px 18px",
};

const containerStyle: React.CSSProperties = {
  maxWidth: 1200,
  margin: "0 auto",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "320px 1fr",
  gap: 20,
};

const sidebarStyle: React.CSSProperties = {
  display: "grid",
  gap: 16,
  alignSelf: "start",
};

const panelStyle: React.CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 20,
};

const chatPanelStyle: React.CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 20,
  display: "flex",
  flexDirection: "column",
  minHeight: "80vh",
};

const chatHeaderStyle: React.CSSProperties = {
  borderBottom: "1px solid #27272a",
  paddingBottom: 14,
};

const chatMessagesStyle: React.CSSProperties = {
  flex: 1,
  display: "grid",
  gap: 14,
  paddingTop: 18,
  paddingBottom: 18,
  overflowY: "auto",
};

const inputRowStyle: React.CSSProperties = {
  borderTop: "1px solid #27272a",
  paddingTop: 16,
  display: "grid",
  gap: 12,
};

const textareaStyle: React.CSSProperties = {
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

const sendButtonStyle: React.CSSProperties = {
  background: "#0891b2",
  color: "#fff",
  border: "none",
  borderRadius: 12,
  padding: "14px 18px",
  fontWeight: 700,
  fontSize: 16,
};

const errorCardStyle: React.CSSProperties = {
  background: "#2a1111",
  border: "1px solid #7f1d1d",
  color: "#fecaca",
  padding: 16,
  borderRadius: 12,
};

const mutedLabelStyle: React.CSSProperties = {
  margin: 0,
  color: "#a1a1aa",
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
};