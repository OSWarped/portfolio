// components/ProjectCard.tsx
import Image from 'next/image';
import Link from 'next/link';

export default function ProjectCard({ title, img, summary, href }: {
  title: string; img: string; summary: string; href: string;
}) {
  return (
    <article className="overflow-hidden rounded-xl bg-white shadow transition hover:shadow-lg
                        dark:bg-zinc-900">
      <Image src={img} alt={title} width={640} height={360} className="h-48 w-full object-cover" />
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--navy)]">{title}</h3>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{summary}</p>
        <Link href={href} className="mt-4 inline-block text-cardinal hover:underline">
          Read case study →
        </Link>
      </div>
    </article>
  );
}
