"use client";

import type { CSSProperties } from "react";
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

export default function ReportPage() {
  const [data, setData] = useState<ReportPayload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("interviewFeedback");
    if (!raw) return;

    const parsed = JSON.parse(raw) as ReportPayload;
    setData(parsed);
  }, []);

  const sortedCompetencies = useMemo(() => {
    return [...(data?.meta?.competencyMap ?? [])].sort(
      (a, b) => b.score - a.score
    );
  }, [data]);

  if (!data) {
    return (
      <main style={pageStyle}>
        <div style={containerStyle}>
          <div style={panelStyle}>
            <h1 style={{ marginTop: 0 }}>No Report Available</h1>
            <p style={{ color: "#d4d4d8" }}>
              Complete an interview first to generate the final report.
            </p>
            <Link href="/" style={buttonLinkStyle}>
              Go back home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={pageStyle}>
      <div style={containerStyle}>
        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              color: "#67e8f9",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 12,
            }}
          >
            Final Interview Report
          </p>

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
              <h1 style={{ fontSize: 42, margin: "12px 0 8px 0" }}>
                {data.candidate?.member.name}
              </h1>
              <p style={{ color: "#d4d4d8", margin: 0 }}>
                {data.candidate?.member.jobRole} • {data.candidate?.member.education}
              </p>
            </div>

            {data.meta?.recommendation ? (
              <span style={recommendationBadgeStyle}>
                {data.meta.recommendation}
              </span>
            ) : null}
          </div>
        </div>

        {data.meta?.scoreBreakdown ? (
          <div style={metricGridStyle}>
            <ScoreCard
              title="Technical"
              value={data.meta.scoreBreakdown.technical}
              color="#93c5fd"
            />
            <ScoreCard
              title="Communication"
              value={data.meta.scoreBreakdown.communication}
              color="#86efac"
            />
            <ScoreCard
              title="Reasoning"
              value={data.meta.scoreBreakdown.reasoning}
              color="#fde68a"
            />
          </div>
        ) : null}

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1.2fr 1fr", marginTop: 20 }}>
          <section style={panelStyle}>
            <h2 style={sectionTitleStyle}>Summary</h2>
            <p style={{ color: "#e4e4e7", lineHeight: 1.7 }}>
              {data.feedback.summary}
            </p>

            <div style={{ marginTop: 24 }}>
              <h3 style={subTitleStyle}>Strengths</h3>
              <BulletList items={data.feedback.strengths} color="#bbf7d0" />
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={subTitleStyle}>Gaps</h3>
              <BulletList items={data.feedback.gaps} color="#fecaca" />
            </div>

            <div style={{ marginTop: 24 }}>
              <h3 style={subTitleStyle}>Next Steps</h3>
              <BulletList items={data.feedback.next} color="#bfdbfe" />
            </div>
          </section>

          <section style={{ display: "grid", gap: 20 }}>
            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>Interview Mind Map</h2>

              <div style={{ display: "grid", gap: 12 }}>
                {sortedCompetencies.map((node) => (
                  <div key={node.topic}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        marginBottom: 6,
                      }}
                    >
                      <span style={{ fontWeight: 700 }}>{node.topic}</span>
                      <span
                        style={{
                          color:
                            node.level === "strong"
                              ? "#86efac"
                              : node.level === "average"
                              ? "#fde68a"
                              : "#fca5a5",
                          textTransform: "capitalize",
                          fontSize: 13,
                        }}
                      >
                        {node.level} • {node.score}%
                      </span>
                    </div>
                    <div style={trackStyle}>
                      <div
                        style={{
                          ...fillStyle,
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

            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>Covered Curriculum Days</h2>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {(data.meta?.coveredDays ?? []).map((day) => (
                  <span key={day} style={dayBadgeStyle}>
                    Day {day}
                  </span>
                ))}
              </div>
            </div>

            <div style={panelStyle}>
              <h2 style={sectionTitleStyle}>Actions</h2>
              <div style={{ display: "grid", gap: 12 }}>
                <Link href="/" style={buttonLinkStyle}>
                  Start Another Interview
                </Link>
                <Link href="/interview" style={secondaryLinkStyle}>
                  Return to Interview
                </Link>
              </div>
            </div>
          </section>
        </div>

        <section style={{ ...panelStyle, marginTop: 20 }}>
          <h2 style={sectionTitleStyle}>Transcript Snapshot</h2>
          <div style={{ display: "grid", gap: 12 }}>
            {data.transcript.slice(0, 8).map((message, index) => (
              <div
                key={index}
                style={{
                  background: message.role === "user" ? "#0f766e22" : "#18181b",
                  border:
                    message.role === "user"
                      ? "1px solid #14b8a6"
                      : "1px solid #27272a",
                  borderRadius: 12,
                  padding: 14,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    color: message.role === "user" ? "#99f6e4" : "#a1a1aa",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 6,
                    fontWeight: 700,
                  }}
                >
                  {message.role === "user" ? "Candidate" : "Interviewer"}
                </div>
                <div style={{ color: "#e4e4e7", lineHeight: 1.6 }}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

function BulletList({ items, color }: { items: string[]; color: string }) {
  return (
    <ul style={{ paddingLeft: 20, marginTop: 12, color }}>
      {items.map((item, index) => (
        <li key={index} style={{ marginBottom: 10, lineHeight: 1.6 }}>
          <span style={{ color: "#e4e4e7" }}>{item}</span>
        </li>
      ))}
    </ul>
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
  return (
    <div style={scoreCardStyle}>
      <div style={{ color: "#a1a1aa", fontSize: 13 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 800, marginTop: 6, color }}>
        {value}/5
      </div>
    </div>
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

const panelStyle: CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 22,
};

const sectionTitleStyle: CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 28,
};

const subTitleStyle: CSSProperties = {
  marginBottom: 0,
  fontSize: 20,
};

const buttonLinkStyle: CSSProperties = {
  display: "inline-block",
  background: "#0891b2",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
};

const secondaryLinkStyle: CSSProperties = {
  display: "inline-block",
  background: "#18181b",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
  border: "1px solid #27272a",
};

const metricGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
};

const scoreCardStyle: CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 20,
};

const recommendationBadgeStyle: CSSProperties = {
  background: "#082f49",
  color: "#bae6fd",
  border: "1px solid #0ea5e9",
  borderRadius: 999,
  padding: "10px 16px",
  fontWeight: 800,
};

const dayBadgeStyle: CSSProperties = {
  background: "#18181b",
  color: "#e4e4e7",
  border: "1px solid #3f3f46",
  borderRadius: 999,
  padding: "8px 12px",
  fontSize: 13,
};

const trackStyle: CSSProperties = {
  width: "100%",
  height: 10,
  background: "#27272a",
  borderRadius: 999,
  overflow: "hidden",
};

const fillStyle: CSSProperties = {
  height: "100%",
  borderRadius: 999,
};