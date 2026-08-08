export default function HomePage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white px-6 py-12">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-400">
          ViCodathon Project
        </p>

        <h1 className="mt-4 text-4xl font-bold leading-tight md:text-6xl">
          Adaptive AI Interview Agent
        </h1>

        <p className="mt-6 max-w-3xl text-lg text-neutral-300">
          A personalized technical interviewer that adapts to each candidate’s
          AI cohort journey, asks intelligent follow-up questions, tracks topic
          mastery, and generates structured feedback.
        </p>

        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold">Dynamic Interview Path</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Adaptive questioning, smart follow-ups, and difficulty scaling.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold">Interview Mind Map</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Live competency tracking across strong, average, and weak topics.
            </p>
          </div>

          <div className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5">
            <h2 className="text-lg font-semibold">Final Recommendation</h2>
            <p className="mt-2 text-sm text-neutral-400">
              Technical, communication, and reasoning scores with actionable feedback.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}