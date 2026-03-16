'use client';

export default function AboutBrief() {
  const highlights = [
    ['Modernized legacy reporting into maintainable web-based solutions', 'Enterprise modernization'],
    ['Built tools that reduced reporting time from minutes to seconds', 'Practical business impact'],
    ['Created dashboards that supported major maintenance savings', 'Data-driven decision support'],
    ['Worked across UI, APIs, databases, and cloud platforms', 'True full-stack capability'],
    ['Focused on usability, maintainability, and long-term value', 'Software people will actually use'],
  ];

  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-extrabold text-[var(--navy)] md:text-4xl">
          A developer who understands both systems and the people using them
        </h2>

        <p className="mt-6 text-base leading-8 text-zinc-700 md:text-lg">
          I’m a full-stack engineer with a strong background in building and
          improving software for real-world business environments. Much of my
          work has involved stepping into complex systems, understanding how the
          business actually operates, and delivering solutions that improve
          performance, usability, and decision-making.
        </p>

        <p className="mt-4 text-base leading-8 text-zinc-700 md:text-lg">
          What makes me valuable is not just that I can code, but that I can
          connect technical implementation to business needs. I’m comfortable
          working across front-end, back-end, data, and cloud concerns, and I
          care deeply about building software that is clear, maintainable, and
          genuinely useful.
        </p>
      </div>

      <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {highlights.map(([what, impact]) => (
          <div
            key={what}
            className="rounded-xl border-l-4 border-[var(--cardinal)] bg-white p-6 shadow-md transition hover:shadow-lg hover:scale-[1.015]"
          >
            <p className="text-sm font-bold uppercase tracking-wide text-[var(--cardinal)]">
              {impact}
            </p>
            <p className="mt-2 text-base leading-7 text-[var(--navy-raise)]">
              {what}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-20 text-center">
        <h3 className="mb-4 text-2xl font-semibold text-[var(--cardinal)]">
          Core toolbox
        </h3>
        <p className="mx-auto max-w-3xl text-base leading-relaxed text-zinc-700">
          .NET · C# / ASP.NET · React · Angular · SQL / T-SQL · Azure · Python ·
          Data visualization · GitHub Actions · AI & voice interfaces
        </p>
      </div>

      <p className="mt-12 text-center text-xs text-zinc-500">
        M.S. Information Systems · B.S. Computer Science
      </p>
    </section>
  );
}