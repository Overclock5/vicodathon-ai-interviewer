"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { CandidateProfile, Feedback } from "../../lib/types";

type ReportPayload = {
  candidate: CandidateProfile | null;
  feedback: Feedback;
  transcript: { role: "assistant" | "user"; text: string }[];
};

export default function ReportPage() {
  const [data, setData] = useState<ReportPayload | null>(null);

  useEffect(() => {
    const raw = localStorage.getItem("interviewFeedback");
    if (!raw) return;

    const parsed = JSON.parse(raw) as ReportPayload;
    setData(parsed);
  }, []);

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
          <p style={{ color: "#67e8f9", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 12 }}>
            Final Interview Report
          </p>
          <h1 style={{ fontSize: 42, margin: "12px 0 8px 0" }}>
            {data.candidate?.member.name}
          </h1>
          <p style={{ color: "#d4d4d8", margin: 0 }}>
            {data.candidate?.member.jobRole} • {data.candidate?.member.education}
          </p>
        </div>

        <div style={{ display: "grid", gap: 20, gridTemplateColumns: "1.2fr 1fr" }}>
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
              <h2 style={sectionTitleStyle}>Signature Features</h2>
              <FeatureMiniCard
                title="Dynamic Interview Path"
                text="The interview adapted across multiple curriculum topics through session-based follow-ups."
              />
              <FeatureMiniCard
                title="Interview Mind Map"
                text="The engine tracked evolving competency signals from the candidate’s responses."
              />
              <FeatureMiniCard
                title="Hiring Recommendation"
                text="The final feedback summarizes strengths, gaps, and next actions in a recruiter-friendly format."
              />
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

function FeatureMiniCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        background: "#18181b",
        border: "1px solid #27272a",
        borderRadius: 12,
        padding: 14,
        marginTop: 12,
      }}
    >
      <div style={{ fontWeight: 700 }}>{title}</div>
      <div style={{ color: "#d4d4d8", marginTop: 6, lineHeight: 1.5 }}>{text}</div>
    </div>
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

const panelStyle: React.CSSProperties = {
  background: "#111111",
  border: "1px solid #27272a",
  borderRadius: 18,
  padding: 22,
};

const sectionTitleStyle: React.CSSProperties = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 28,
};

const subTitleStyle: React.CSSProperties = {
  marginBottom: 0,
  fontSize: 20,
};

const buttonLinkStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#0891b2",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
};

const secondaryLinkStyle: React.CSSProperties = {
  display: "inline-block",
  background: "#18181b",
  color: "#fff",
  textDecoration: "none",
  padding: "12px 16px",
  borderRadius: 12,
  fontWeight: 700,
  border: "1px solid #27272a",
};