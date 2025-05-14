import AboutBrief from "./components/AboutBrief"
export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center bg-navy-50">

      <section className="min-h-[70vh] grid place-items-center bg-gradient-to-br from-[var(--navy)] to-[var(--navy-raise)] px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl md:text-6xl font-extrabold text-white">
            Blake Milam
          </h1>
          <p className="mt-4 text-xl md:text-2xl text-white/80">
            Full-stack engineer • Next.js tinkerer
          </p>

          <a href="#projects"
            className="mt-10 inline-block rounded-lg bg-cardinal px-6 py-3 font-semibold
                  text-white hover:bg-cardinal-hover transition-colors">
            View my work
          </a>
        </div>
      </section>
      <AboutBrief></AboutBrief>
    </main>
  );
}
