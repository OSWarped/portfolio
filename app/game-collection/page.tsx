import Link from 'next/link';
import { getCollectionOverview } from '../lib/gameCollection';
import GameCollectionBrowser from './_components/GameCollectionBrowser';

export const metadata = {
  title: 'Game Collection | Blake Milam',
  description: 'A drillable view of my game collection powered by exported catalog data.',
};

function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <div className="text-sm text-zinc-500">{label}</div>
      <div className="mt-2 text-3xl font-bold text-[var(--navy)]">{value}</div>
    </div>
  );
}

export default async function GameCollectionPage() {
  const overview = await getCollectionOverview();

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <div className="mx-auto max-w-6xl space-y-12">
        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            Utilities / Hobby Projects
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--navy)] md:text-5xl">
            Game Collection
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-zinc-700">
            This page is a drillable view of my videogame collection, powered by an exported .csv file dumped from my mobile
            device&apos;s cataloging software. The data has been transcribed into JSON format and let&apos;s the user explore 
            their collection by platform, see recently added games, and more. This is more of an exercise in reporting data 
            easliy in Next.js rather than reporting tools like PowerBi. The raw data is static, but gets enriched with metadata, 
            such as boxart, screenshots, and descriptions from TheGamesDb API I&apos;ve connected. Any delays you get are 
            from the enrichment process, which is done on a per-game basis as you explore the collection.
          </p>
        </section>

        <section className="grid max-w-2xl gap-4 sm:grid-cols-2">
          <StatCard label="Total Games" value={overview.totalItems} />
          <StatCard label="Platforms" value={overview.platformCount} />
        </section>

        <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-2xl font-semibold text-[var(--navy)]">Browse by Platform</h2>

            <div className="mt-6 flex flex-wrap gap-3">
              {overview.topPlatforms.map((platform) => (
                <Link
                  key={platform.slug}
                  href={`/game-collection/platform/${platform.slug}`}
                  className="rounded-full border border-zinc-200 bg-zinc-50 px-4 py-2 text-sm font-medium text-zinc-700 transition hover:border-[var(--navy)] hover:text-[var(--navy)]"
                >
                  {platform.name} <span className="text-zinc-400">({platform.total})</span>
                </Link>
              ))}
            </div>
          </div>          
        </section>

        <GameCollectionBrowser
          recentGames={overview.recentGames}
          allGames={overview.allGames}
        />
      </div>
    </main>
  );
}