export default function SectionHeading({ children }: { children: React.ReactNode }) {
    return (
      <h2 className="relative mb-12 pl-4 text-3xl font-extrabold text-zinc-800 dark:text-zinc-100">
        <span className="absolute left-0 top-1 h-6 w-1 bg-cardinal" />
        {children}
      </h2>
    );
  }
  