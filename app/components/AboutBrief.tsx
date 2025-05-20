'use client';

export default function AboutBrief() {
  const highlights = [
    ['Legacy reporting → web stack', 'Six-figure license savings'],
    ['Voice-driven incident app', 'Minutes → seconds reporting'],
    ['Predictive risk dashboard', 'Multi-million $ maintenance savings'],
    ['Cloud re-platform', 'Lower cost • auto-scale'],
    ['Unified operational data', 'Sub-second ad-hoc analysis'],
  ];

  return (
    <section className="mx-auto max-w-6xl py-24 px-6">
      {/* Headline */}
      <h2 className="mb-12 text-3xl font-extrabold text-center text-[var(--navy)]">
        Full-stack engineer · 20 yrs modernising enterprise systems
      </h2>

      {/* Grid of Impact Highlights */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(([what, impact]) => (
          <div
            key={what}
            className="rounded-xl border-l-4 border-[var(--cardinal)] bg-white p-6 shadow-md transition hover:shadow-lg hover:scale-[1.015]"
          >
            <p className="font-bold text-[var(--cardinal)] text-sm uppercase tracking-wide">
              {impact}
            </p>
            <p className="mt-2 text-[var(--navy-raise)] text-base">{what}</p>
          </div>
        ))}
      </div>

      {/* Tech Stack */}
      <div className="mt-20 text-center">
        <h3 className="text-2xl font-semibold text-[var(--cardinal)] mb-4">
          Core toolbox
        </h3>
        <p className="text-base text-zinc-700 leading-relaxed max-w-3xl mx-auto">
          .NET · C# / ASP.NET · React · Angular · SQL / T-SQL · Azure · Python ·
          Data visualization · GitHub Actions · AI & voice interfaces
        </p>
      </div>

      {/* Credentials */}
      <p className="mt-12 text-center text-xs text-zinc-500">
        M.S. Information Systems · B.S. Computer Science
      </p>
    </section>
  );
}
