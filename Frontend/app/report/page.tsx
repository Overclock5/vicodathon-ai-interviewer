"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  CandidateProfile,
  Feedback,
  InterviewMeta,
} from "../../lib/types";

type ReportPayload = {
  candidate: CandidateProfile | null;
  feedback: Feedback;
  transcript: { role: "assistant" | "user"; text: string }[];
  meta?: InterviewMeta | null;
};

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

export default function ReportPage() {
  const [data, setData] = useState<ReportPayload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("interviewFeedback");
    if (!raw) return;
    setData(JSON.parse(raw) as ReportPayload);
  }, []);

  const sortedCompetencies = useMemo(() => {
    return [...(data?.meta?.competencyMap ?? [])].sort((a, b) => b.score - a.score);
  }, [data]);

  if (!data) {
    return (
      <main className="app-shell">
        <section className="glass-card">
          <div className="card-inner">
            <h1 style={{ marginTop: 0 }}>No Report Available</h1>
            <p className="muted-note">
              Complete an interview first to generate the final report.
            </p>
            <Link href="/" className="primary-button" style={{ display: "inline-flex", width: "auto" }}>
              Go back home
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <span className="hero-badge">Final Interview Report</span>

      <div className="report-header" style={{ marginTop: 18 }}>
        <div>
          <h1 className="report-name">{data.candidate?.member.name}</h1>
          <p className="report-subtitle">
            {data.candidate?.member.jobRole} • {data.candidate?.member.education}
          </p>
        </div>

        {data.meta?.recommendation ? (
          <span className={getRecommendationPillClass(data.meta.recommendation)}>
            {getDisplayRecommendationLabel(data.meta.recommendation)}
          </span>
        ) : null}
      </div>

      {data.meta?.scoreBreakdown ? (
        <div className="score-grid">
          <ScoreCard
            title="Technical"
            value={data.meta.scoreBreakdown.technical}
            color="#22d3ee"
          />
          <ScoreCard
            title="Communication"
            value={data.meta.scoreBreakdown.communication}
            color="#22c55e"
          />
          <ScoreCard
            title="Reasoning"
            value={data.meta.scoreBreakdown.reasoning}
            color="#facc15"
          />
        </div>
      ) : null}

      <div className="report-grid">
        <section className="glass-card">
          <div className="card-inner">
            <h2 className="card-title">Summary</h2>
            <p className="summary-text">{data.feedback.summary}</p>

            <h3 className="subhead">Strengths</h3>
            <ul className="colored-list" style={{ color: "#bbf7d0" }}>
              {data.feedback.strengths.map((item, index) => (
                <li key={index}>
                  <span style={{ color: "#e7ebf1" }}>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="subhead">Gaps</h3>
            <ul className="colored-list" style={{ color: "#fecaca" }}>
              {data.feedback.gaps.map((item, index) => (
                <li key={index}>
                  <span style={{ color: "#e7ebf1" }}>{item}</span>
                </li>
              ))}
            </ul>

            <h3 className="subhead">Next Steps</h3>
            <ul className="colored-list" style={{ color: "#bfdbfe" }}>
              {data.feedback.next.map((item, index) => (
                <li key={index}>
                  <span style={{ color: "#e7ebf1" }}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div style={{ display: "grid", gap: 20 }}>
          <section className="glass-card">
            <div className="card-inner">
              <h2 className="card-title">Interview Mind Map</h2>

              <div className="skill-grid">
                {sortedCompetencies.map((node) => (
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
                        {node.level} • {node.score}%
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
              <h2 className="card-title">Covered Curriculum Days</h2>
              <div className="badge-wrap">
                {(data.meta?.coveredDays ?? []).map((day) => (
                  <span key={day} className="day-badge">
                    D{day}
                  </span>
                ))}
              </div>
            </div>
          </section>

          <section className="glass-card">
            <div className="card-inner">
              <h2 className="card-title">Actions</h2>
              <div className="action-grid">
                <Link href="/" className="primary-button">
                  Start Another Interview
                </Link>
                <Link href="/interview" className="secondary-button">
                  Return to Interview
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="glass-card" style={{ marginTop: 20 }}>
        <div className="card-inner">
          <h2 className="card-title">Transcript Snapshot</h2>

          <div className="snapshot-grid">
            {data.transcript.slice(0, 10).map((message, index) => (
              <div
                key={index}
                className={`snapshot-card ${message.role === "user" ? "user" : ""}`}
              >
                <p className="snapshot-role">
                  {message.role === "user" ? "Candidate" : "Interviewer"}
                </p>
                <p className="snapshot-text">{message.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ScoreCard({
  title,
  value,
  color,
}: {
  title: string;
  value: number;
  color: string;
}) {
  const percent = Math.max(0, Math.min(100, value * 20));

  return (
    <section className="glass-card score-card">
      <div className="score-title">{title}</div>

      <div className="ring-wrap">
        <div
          className="ring"
          style={
            {
              ["--p" as any]: percent,
              ["--ring-color" as any]: color,
            } as React.CSSProperties
          }
        >
          <span className="ring-value">{percent}%</span>
        </div>

        <div className="ring-sub">
          <div style={{ fontSize: 22, fontWeight: 820, color: "#fff" }}>
            {value}/5
          </div>
          <div>Derived from interview evaluation signals</div>
        </div>
      </div>
    </section>
  );
}