/* components/AboutBrief.tsx */
export default function AboutBrief() {
    return (
      <section className="mx-auto max-w-5xl py-24 text-white">
        {/* headline */}
        <h2 className="mb-8 text-3xl font-bold text-center">
          Full-stack engineer · 20 yrs modernising enterprise systems
        </h2>
  
        {/* impact grid */}
        <div className="grid gap-6 sm:grid-cols-2">
          {[
            ['Legacy reporting → web stack', 'Six-figure licence savings'],
            ['Voice-driven incident app', 'Minutes → seconds reporting'],
            ['Predictive risk dashboard', 'Multi-million $ maintenance savings'],
            ['Cloud re-platform', 'Lower cost • auto-scale'],
            ['Unified operational data', 'Sub-second ad-hoc analysis'],
          ].map(([what, impact]) => (
            <div key={what} className="rounded-lg bg-[var(--navy-raise)] p-6">
              <p className="font-semibold text-cardinal">{impact}</p>
              <p className="mt-1 text-sm text-white/80">{what}</p>
            </div>
          ))}
        </div>
  
        {/* tech stack */}
        <h3 className="mt-16 mb-4 text-2xl font-semibold text-center text-cardinal">
          Core toolbox
        </h3>
        <p className="text-center text-sm leading-relaxed">
          .NET · C# / ASP.NET · React · Angular · SQL/T-SQL · Azure · Python ·
          Data visualisation · GitHub Actions · AI & voice interfaces
        </p>
  
        {/* credentials */}
        <p className="mt-10 text-center text-xs text-white/60">
          M.S. Information Systems&nbsp;· B.S. Computer Science 
        </p>
      </section>
    );
  }
  