"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchCandidates } from "../lib/api";
import type { CandidateProfile } from "../lib/types";

export default function HomePage() {
  const router = useRouter();
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
    localStorage.setItem("selectedCandidate", JSON.stringify(selectedCandidate));
    localStorage.removeItem("interviewFeedback");
    router.push("/interview");
  }

  return (
    <main className="app-shell">
      <span className="hero-badge">ViCodathon Project</span>

      <h1 className="hero-title">Adaptive AI Interview Agent</h1>

      <p className="hero-subtitle">
        Streamline technical interviewing with AI-powered adaptivity, live
        competency tracking, and structured interview feedback tied to the
        candidate’s cohort journey.
      </p>

      <div className="top-grid">
        <section className="glass-card">
          <div className="card-inner">
            <h2 className="card-title">Choose a Candidate</h2>

            {loading && <p className="muted-note">Loading candidates...</p>}

            {error && (
              <div className="error-card">
                <strong>Backend not reachable</strong>
                <p style={{ marginBottom: 0 }}>
                  {error}
                </p>
              </div>
            )}

            {!loading && !error && (
              <div className="candidate-list">
                {candidates.map((candidate) => {
                  const isSelected = candidate.member.id === selectedId;

                  return (
                    <button
                      key={candidate.member.id}
                      className={`candidate-button ${isSelected ? "selected" : ""}`}
                      onClick={() => setSelectedId(candidate.member.id)}
                    >
                      <div className="row-between mobile-stack">
                        <div className="row-start">
                          <Avatar initials={getInitials(candidate.member.name)} />
                          <div>
                            <div className="candidate-name">
                              {candidate.member.name}
                            </div>
                            <div className="candidate-meta">
                              {candidate.member.jobRole} •{" "}
                              {candidate.member.yearsExperience} years
                            </div>
                          </div>
                        </div>

                        <span className="id-pill">{candidate.member.id}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <div className="preview-column">
          <section className="glass-card">
            <div className="card-inner">
              <h2 className="card-title">Interview Preview</h2>

              {selectedCandidate ? (
                <>
                  <div className="preview-person">
                    <Avatar
                      initials={getInitials(selectedCandidate.member.name)}
                      size="xl"
                    />

                    <div>
                      <h3 className="preview-name">
                        {selectedCandidate.member.name}
                      </h3>
                      <p className="preview-role">
                        {selectedCandidate.member.jobRole}
                        <br />
                        {selectedCandidate.member.education}
                      </p>
                    </div>
                  </div>

                  <div className="metric-grid">
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

                  <div style={{ marginTop: 20 }}>
                    <button className="primary-button" onClick={startInterviewFlow}>
                      Start Interview
                    </button>
                  </div>
                </>
              ) : (
                <p className="muted-note">Select a candidate to begin.</p>
              )}
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">How the Agent Thinks</p>

              <div className="thinking-flow" style={{ marginTop: 16 }}>
                <ThinkingStep
                  number="01"
                  title="Reads candidate journey"
                  text="Uses completed, skipped, and retry-heavy missions as personalization signals."
                />
                <ThinkingStep
                  number="02"
                  title="Plans adaptive questions"
                  text="Balances curriculum coverage, concept depth, and realistic interview flow."
                />
                <ThinkingStep
                  number="03"
                  title="Generates follow-ups"
                  text="Changes the next question based on the candidate’s previous answer quality."
                />
                <ThinkingStep
                  number="04"
                  title="Builds final recommendation"
                  text="Summarizes strengths, gaps, next steps, and readiness into one report."
                />
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <p className="section-label">Evaluation Dimensions</p>

              <div className="secondary-card-grid" style={{ marginTop: 16 }}>
                <MiniInfoCard
                  title="Technical"
                  text="How correctly the candidate explains systems, tools, and engineering choices."
                />
                <MiniInfoCard
                  title="Communication"
                  text="How clearly the candidate structures answers and explains built systems."
                />
                <MiniInfoCard
                  title="Reasoning"
                  text="How well the candidate discusses trade-offs, failure cases, and production thinking."
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <div className="feature-grid">
        <section className="glass-card feature-card">
          <h3 className="feature-title">Dynamic Interview Path</h3>
          <p className="feature-text">
            Adaptive questioning, smart follow-ups, and difficulty scaling based
            on candidate performance.
          </p>
        </section>

        <section className="glass-card feature-card">
          <h3 className="feature-title">Interview Mind Map</h3>
          <p className="feature-text">
            Visual live competency tracking across strong, average, and weak
            topics during the interview.
          </p>
        </section>

        <section className="glass-card feature-card">
          <h3 className="feature-title">Final Recommendation</h3>
          <p className="feature-text">
            Technical, communication, and reasoning signals converted into
            actionable feedback.
          </p>
        </section>
      </div>
    </main>
  );
}

function Avatar({
  initials,
  size,
}: {
  initials: string;
  size?: "lg" | "xl";
}) {
  return <div className={`avatar ${size ?? ""}`.trim()}>{initials}</div>;
}

function MetricCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="metric-card">
      <div className="metric-label">{label}</div>
      <div className="metric-value">{value}</div>
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
    <div className="thinking-step">
      <div className="step-chip">{number}</div>
      <div>
        <p className="step-title">{title}</p>
        <p className="step-text">{text}</p>
      </div>
    </div>
  );
}

function MiniInfoCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="mini-info-card">
      <p className="mini-info-title">{title}</p>
      <p className="mini-info-text">{text}</p>
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}