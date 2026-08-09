"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCandidates } from "../lib/api";
import type { CandidateProfile } from "../lib/types";
import { useResponsive } from "../lib/useResponsive";

export default function HomePage() {
  const router = useRouter();
  const { isMobile, isTablet, isDesktop } = useResponsive();

  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedId, setSelectedId] = useState("");

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchCandidates();
        setCandidates(data);
        if (data.length > 0) {
          setSelectedId(data[0].member.id);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Unable to load candidates."
        );
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const selectedCandidate = useMemo(
    () => candidates.find((candidate) => candidate.member.id === selectedId),
    [candidates, selectedId]
  );

  function startInterviewFlow() {
    if (!selectedCandidate) return;

    localStorage.setItem(
      "selectedCandidate",
      JSON.stringify(selectedCandidate)
    );
    localStorage.removeItem("interviewFeedback");
    router.push("/interview");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#050505",
        color: "#ffffff",
        padding: isMobile ? "20px 14px" : "32px 20px",
      }}
    >
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <p
          style={{
            color: "#67e8f9",
            textTransform: "uppercase",
            letterSpacing: "0.18em",
            fontSize: 12,
          }}
        >
          ViCodathon Project
        </p>

        <h1
          style={{
            fontSize: isMobile ? 34 : isTablet ? 40 : 48,
            fontWeight: 800,
            marginTop: 16,
            marginBottom: 12,
            lineHeight: 1.1,
            letterSpacing: "-0.03em",
          }}
        >
          Adaptive AI Interview Agent
        </h1>

        <p
          style={{
            color: "#d4d4d8",
            fontSize: isMobile ? 15 : 18,
            maxWidth: 900,
            lineHeight: 1.6,
          }}
        >
          A personalized technical interviewer that adapts to each candidate’s
          AI cohort journey, asks intelligent follow-up questions, tracks topic
          mastery, and generates structured feedback.
        </p>

        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: isDesktop ? "1.2fr 1fr" : "1fr",
            marginTop: 32,
            alignItems: "start",
          }}
        >
          <section
            style={{
              background: "#111111",
              border: "1px solid #27272a",
              borderRadius: 18,
              padding: isMobile ? 18 : 24,
            }}
          >
            <h2
              style={{
                fontSize: isMobile ? 24 : 28,
                marginBottom: 16,
              }}
            >
              Choose a Candidate
            </h2>

            {loading && <p style={{ color: "#a1a1aa" }}>Loading candidates...</p>}

            {error && (
              <div
                style={{
                  background: "#2a1111",
                  border: "1px solid #7f1d1d",
                  color: "#fecaca",
                  padding: 16,
                  borderRadius: 12,
                }}
              >
                <p style={{ margin: 0, fontWeight: 600 }}>Backend not reachable</p>
                <p style={{ marginTop: 8 }}>{error}</p>
                <p style={{ marginTop: 8, color: "#fda4af" }}>
                  Make sure FastAPI is running or the deployed backend URL is correctly configured.
                </p>
              </div>
            )}

            {!loading && !error && (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  maxHeight: isDesktop ? 760 : "none",
                  overflowY: isDesktop ? "auto" : "visible",
                  paddingRight: isDesktop ? 6 : 0,
                }}
              >
                {candidates.map((candidate) => {
                  const isSelected = candidate.member.id === selectedId;
                  return (
                    <button
                      key={candidate.member.id}
                      onClick={() => setSelectedId(candidate.member.id)}
                      style={{
                        textAlign: "left",
                        width: "100%",
                        background: isSelected ? "#0f172a" : "#18181b",
                        border: isSelected
                          ? "1px solid #38bdf8"
                          : "1px solid #27272a",
                        color: "#fff",
                        borderRadius: 14,
                        padding: 16,
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          flexDirection: isMobile ? "column" : "row",
                          justifyContent: "space-between",
                          alignItems: isMobile ? "flex-start" : "center",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: isMobile ? 16 : 18,
                              fontWeight: 700,
                            }}
                          >
                            {candidate.member.name}
                          </div>
                          <div style={{ color: "#a1a1aa", marginTop: 4 }}>
                            {candidate.member.jobRole} •{" "}
                            {candidate.member.yearsExperience} years
                          </div>
                        </div>

                        <div
                          style={{
                            padding: "6px 10px",
                            borderRadius: 999,
                            background: "#0c4a6e",
                            color: "#bae6fd",
                            fontSize: 12,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {candidate.member.id}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <div
            style={{
              display: "grid",
              gap: 20,
              position: isDesktop ? "sticky" : "static",
              top: isDesktop ? 24 : "auto",
              alignSelf: "start",
            }}
          >
            <section
              style={{
                background: "#111111",
                border: "1px solid #27272a",
                borderRadius: 18,
                padding: isMobile ? 18 : 24,
              }}
            >
              <h2
                style={{
                  fontSize: isMobile ? 24 : 28,
                  marginBottom: 16,
                }}
              >
                Interview Preview
              </h2>

              {selectedCandidate ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <p style={{ margin: 0, color: "#a1a1aa" }}>Candidate</p>
                    <h3
                      style={{
                        marginTop: 8,
                        marginBottom: 8,
                        fontSize: isMobile ? 22 : 24,
                      }}
                    >
                      {selectedCandidate.member.name}
                    </h3>
                    <p style={{ color: "#d4d4d8", margin: 0, lineHeight: 1.5 }}>
                      {selectedCandidate.member.jobRole} •{" "}
                      {selectedCandidate.member.education}
                    </p>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: 12,
                      marginBottom: 20,
                    }}
                  >
                    <MetricCard
                      label="Missions Completed"
                      value={selectedCandidate.signals.missionsCompleted}
                    />
                    <MetricCard
                      label="Commit Days"
                      value={selectedCandidate.signals.commitDays}
                    />
                    <MetricCard
                      label="First-Try Missions"
                      value={selectedCandidate.signals.missionsFirstTry}
                    />
                  </div>

                  <button
                    onClick={startInterviewFlow}
                    style={{
                      width: "100%",
                      background: "#0891b2",
                      color: "#fff",
                      border: "none",
                      borderRadius: 12,
                      padding: "14px 18px",
                      fontWeight: 700,
                      fontSize: 16,
                      cursor: "pointer",
                    }}
                  >
                    Start Interview
                  </button>
                </>
              ) : (
                <p style={{ color: "#a1a1aa" }}>
                  Select a candidate to begin.
                </p>
              )}
            </section>

            <section
              style={{
                background: "#111111",
                border: "1px solid #27272a",
                borderRadius: 18,
                padding: isMobile ? 18 : 22,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#67e8f9",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                How the Agent Thinks
              </p>

              <div style={{ display: "grid", gap: 12, marginTop: 14 }}>
                <ThinkingStep
                  number="01"
                  title="Reads candidate journey"
                  text="Uses completed, skipped, and retry-heavy missions."
                />
                <ThinkingStep
                  number="02"
                  title="Plans adaptive questions"
                  text="Chooses topics across multiple curriculum days."
                />
                <ThinkingStep
                  number="03"
                  title="Generates follow-ups"
                  text="Changes depth based on the previous answer quality."
                />
                <ThinkingStep
                  number="04"
                  title="Builds final recommendation"
                  text="Summarizes strengths, gaps, next steps, and readiness."
                />
              </div>
            </section>

            <section
              style={{
                background: "#111111",
                border: "1px solid #27272a",
                borderRadius: 18,
                padding: isMobile ? 18 : 22,
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#67e8f9",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.12em",
                }}
              >
                Evaluation Dimensions
              </p>

              <div
                style={{
                  display: "grid",
                  gap: 12,
                  marginTop: 16,
                }}
              >
                <MiniDimension
                  title="Technical"
                  text="How correctly the candidate explains systems, tools, and concepts."
                  color="#93c5fd"
                />
                <MiniDimension
                  title="Communication"
                  text="How clearly the candidate structures and delivers answers."
                  color="#86efac"
                />
                <MiniDimension
                  title="Reasoning"
                  text="How well the candidate discusses trade-offs, design choices, and risk."
                  color="#fde68a"
                />
              </div>
            </section>
          </div>
        </div>

        <div
          style={{
            marginTop: 28,
            display: "grid",
            gap: 14,
            gridTemplateColumns: isMobile
              ? "1fr"
              : isTablet
              ? "1fr 1fr"
              : "repeat(3, minmax(0, 1fr))",
          }}
        >
          <FeatureCard
            title="Dynamic Interview Path"
            text="Adaptive questioning, smart follow-ups, and difficulty scaling."
          />
          <FeatureCard
            title="Interview Mind Map"
            text="Live competency tracking across strong, average, and weak topics."
          />
          <FeatureCard
            title="Final Recommendation"
            text="Technical, communication, and reasoning signals with actionable feedback."
          />
        </div>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div style={{ color: "#a1a1aa", fontSize: 13 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{value}</div>
    </div>
  );
}

function ThinkingStep({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "46px 1fr",
        gap: 12,
        alignItems: "start",
      }}
    >
      <div
        style={{
          width: 46,
          height: 46,
          borderRadius: 12,
          background: "#0f172a",
          border: "1px solid #1d4ed8",
          color: "#93c5fd",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: 800,
          fontSize: 12,
        }}
      >
        {number}
      </div>
      <div>
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{title}</div>
        <div style={{ color: "#d4d4d8", lineHeight: 1.5, fontSize: 14 }}>
          {text}
        </div>
      </div>
    </div>
  );
}

function MiniDimension({
  title,
  text,
  color,
}: {
  title: string;
  text: string;
  color: string;
}) {
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 14,
        padding: 14,
      }}
    >
      <div style={{ fontWeight: 700, color }}>{title}</div>
      <div style={{ color: "#d4d4d8", marginTop: 6, lineHeight: 1.5, fontSize: 14 }}>
        {text}
      </div>
    </div>
  );
}

function FeatureCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        background: "#111111",
        border: "1px solid #27272a",
        borderRadius: 18,
        padding: 20,
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 10, fontSize: 22 }}>{title}</h3>
      <p style={{ margin: 0, color: "#d4d4d8", lineHeight: 1.6 }}>{text}</p>
    </div>
  );
}