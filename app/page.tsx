import AboutBrief from "./components/AboutBrief";

export default function Home() {
  return (
    <main className="bg-white text-black">
      <section className="relative overflow-hidden bg-gradient-to-br from-white to-zinc-100 px-6 py-28">
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: 'url("/grid.svg") repeat',
            maskImage: "linear-gradient(to bottom, black 60%, transparent)",
          }}
        />

        <div className="relative mx-auto max-w-5xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--cardinal)]">
            Full-stack engineer · enterprise systems · practical software
          </p>

          <h1 className="mt-6 text-5xl font-extrabold leading-tight text-[var(--navy)] md:text-6xl">
            Blake Milam
          </h1>

          <p className="mt-6 mx-auto max-w-3xl text-xl leading-8 text-zinc-700 md:text-2xl">
            I build software that helps organizations move beyond clunky
            workflows, legacy systems, and disconnected data.
          </p>

          <p className="mt-5 mx-auto max-w-3xl text-base leading-8 text-zinc-600 md:text-lg">
            With 20 years of experience, I bring a mix of full-stack
            engineering, business understanding, and practical problem-solving
            to every project. I enjoy turning complicated processes into tools
            that are faster, clearer, and easier for people to use.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <a
              href="/projects"
              className="inline-block rounded-lg bg-[var(--cardinal)] px-6 py-3 font-semibold text-white transition-transform hover:scale-105 hover:bg-[var(--cardinal-hover)]"
            >
              View my work
            </a>

            <a
              href="/skills"
              className="inline-block rounded-lg border border-[var(--navy)]/20 bg-white px-6 py-3 font-semibold text-[var(--navy)] hover:border-[var(--cardinal)] hover:text-[var(--cardinal)]"
            >
              Explore utilities
            </a>
          </div>
        </div>
      </section>

      <div className="h-1 w-full bg-[var(--cardinal)]" />

      <section className="bg-white px-6 py-20 text-black">
        <AboutBrief />
      </section>
    </main>
  );
}