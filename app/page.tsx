import AboutBrief from "./components/AboutBrief";

export default function Home() {
  return (
    <main className="bg-white text-black">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-28 px-6 bg-gradient-to-br from-white to-zinc-100">
        {/* Optional background SVG accent */}
        <div
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            background: 'url("/grid.svg") repeat',
            maskImage: 'linear-gradient(to bottom, black 60%, transparent)',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold text-[var(--navy)]">
            Blake Milam
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-zinc-700">
            software engineer · code tinkerer
          </p>

          <a
            href="/projects"
            className="mt-10 inline-block rounded-lg bg-[var(--cardinal)] px-6 py-3 font-semibold text-white hover:bg-[var(--cardinal-hover)] transition-transform hover:scale-105"
          >
            View my work
          </a>
        </div>
      </section>

      {/* Accent Divider */}
      <div className="h-1 bg-[var(--cardinal)] w-full" />

      {/* About Section */}
      <section className="py-20 px-6 bg-white text-black">
        <AboutBrief />
      </section>
    </main>
  );
}
