export default function ProjectsPage() {
    const projects = [
      {
        title: 'Voice-Driven Incident Reporting',
        description:
          'Designed and built a voice-enabled app for capturing field incident reports. Replaced manual data entry with real-time voice transcription and workflow automation.',
        technologies: ['React', 'C#', 'Azure Cognitive Services', 'SignalR'],
      },
      {
        title: 'Predictive Maintenance Dashboard',
        description:
          'Developed a real-time dashboard integrating IoT signals and telemetry to flag maintenance risk windows, saving millions in potential downtime.',
        technologies: ['.NET Core', 'SQL Server', 'Angular', 'Power BI'],
      },
      {
        title: 'Legacy Web Stack Modernization',
        description:
          'Led a modernization effort migrating decade-old reporting systems to a modern React/Node stack with cloud-first architecture.',
        technologies: ['React', 'Node.js', 'Azure Functions', 'CosmosDB'],
      },
      {
        title: 'Data Federation Pipeline',
        description:
          'Created a pipeline for joining ERP and plant floor data into unified metrics. Enabled ad-hoc analytics with sub-second latency.',
        technologies: ['Python', 'T-SQL', 'Apache NiFi', 'Power BI'],
      },
      {
        title: 'Personal Portfolio Site',
        description:
          'This very site! Built to showcase projects and tech skills using Next.js and Tailwind CSS.',
        technologies: ['Next.js', 'Tailwind CSS', 'Vercel'],
        url: 'https://blakemilam.com',
        github: 'https://github.com/OSWarped/blake-portfolio',
      },
      {
        title: 'Blake\'s Backups',
        description:
          'An ordering system for digitizing and preserving VHS tapes with tiered pricing and add-ons.',
        technologies: ['Next.js', 'PostgreSQL', 'Tailwind', 'Prisma'],
        url: 'https://blakes-backups.vercel.app/',
        github: 'https://github.com/OSWarped/trivia-game',
      },
      {
        title: 'Quizam!',
        description:
          'A live team trivia hosting platform for pubs, restaurants, etc.  Features scheduling, real-time scoring, and leagues',
        technologies: ['Next.js', 'PostgreSQL', 'Socket.IO'],
        url: 'https://blakdusttriviahost.com',
        github: 'https://github.com/OSWarped/vhs-digitizer',
      },
      {
        title: 'Echo Chamber!',
        description:
          'In order to make our annual haunted trail for Halloween more immersive, I placed several RaspberryPi\'s paired to bluetooth speakers running a custom python app with a flask server to play programmed or manually selected sounds controlled from an iPad',
        technologies: ['Python', 'Flask', 'Bluetooth', 'LAN/WiFi'],
      },
    ];
  
    return (
      <main className="bg-white min-h-screen px-6 py-20">
        <h1 className="text-4xl font-bold text-center text-[var(--navy)] mb-12">
          Project Spotlight
        </h1>
  
        <div className="grid gap-8 max-w-5xl mx-auto sm:grid-cols-2">
        {projects.map((project) => (
          <div
            key={project.title}
            className="bg-white border-l-4 border-[var(--cardinal)] shadow p-6 rounded-lg transition hover:shadow-md"
          >
            <h2 className="text-xl font-semibold text-[var(--navy)] mb-2">
              {project.title}
            </h2>
            <p className="text-zinc-700 mb-4">{project.description}</p>
            <div className="text-xs uppercase tracking-wider text-zinc-500 mb-4">
              {project.technologies.join(' · ')}
            </div>

            {/* If available */}
            <div className="flex gap-4 text-sm">
              {project.url && (
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--cardinal)] hover:underline"
                >
                  Live Site →
                </a>
              )}
              {project.github && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--cardinal)] hover:underline"
                >
                  GitHub →
                </a>
              )}
            </div>
          </div>
        ))}
        </div>
      </main>
    );
  }
  