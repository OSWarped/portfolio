import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPlatformDetailBySlug } from '../../../lib/gameCollection';
import { hasTheGamesDbKey, searchPlatformByName } from '../../../lib/theGamesDb';

type PageProps = {
  params: Promise<{
    platformSlug: string;
  }>;
};

export default async function PlatformDetailPage({ params }: PageProps) {
  const { platformSlug } = await params;
  const detail = await getPlatformDetailBySlug(platformSlug);

  if (!detail) {
    notFound();
  }

  const externalMeta = hasTheGamesDbKey()
    ? await searchPlatformByName(detail.platform.name)
    : null;

  return (
    <main className="min-h-screen bg-white px-6 py-20 text-black">
      <div className="mx-auto max-w-6xl space-y-10">
        <nav className="text-sm text-zinc-500">
          <Link href="/game-collection" className="hover:text-[var(--navy)]">
            Game Collection
          </Link>{' '}
          / <span>{detail.platform.name}</span>
        </nav>

        <section className="space-y-4">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
            Platform
          </p>

          <h1 className="text-4xl font-extrabold tracking-tight text-[var(--navy)] md:text-5xl">
            {detail.platform.name}
          </h1>

          <div className="flex flex-wrap gap-3 text-sm text-zinc-600">
            <span className="rounded-full bg-zinc-100 px-3 py-1">
              {detail.platform.total} total
            </span>            
          </div>

          <p className="max-w-3xl leading-8 text-zinc-700">
            {externalMeta?.overview ??
              'External platform metadata will appear here after the TheGamesDB API key is configured.'}
          </p>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-8">
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--navy)]">Top Genres</h2>

              <div className="mt-5 space-y-3">
                {detail.topGenres.length > 0 ? (
                  detail.topGenres.map((genre) => (
                    <div key={genre.name} className="flex items-center justify-between text-sm">
                      <span className="text-zinc-700">{genre.name}</span>
                      <span className="text-zinc-500">{genre.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No genre data available.</p>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-[var(--navy)]">Top Publishers</h2>

              <div className="mt-5 space-y-3">
                {detail.topPublishers.length > 0 ? (
                  detail.topPublishers.map((publisher) => (
                    <div
                      key={publisher.name}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-zinc-700">{publisher.name}</span>
                      <span className="text-zinc-500">{publisher.count}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No publisher data available.</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[var(--navy)]">Games on this platform</h2>

            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-zinc-200 text-zinc-500">
                  <tr>
                    <th className="px-3 py-3 font-medium">Title</th>
                    <th className="px-3 py-3 font-medium">Genre</th>
                    <th className="px-3 py-3 font-medium">Publisher</th>
                    <th className="px-3 py-3 font-medium">Ownership</th>
                  </tr>
                </thead>
                <tbody>
                  {detail.games.map((game) => (
                    <tr key={game.slug} className="border-b border-zinc-100">
                      <td className="px-3 py-3">
                        <Link
                          href={`/game-collection/game/${game.slug}`}
                          className="font-medium text-zinc-900 transition hover:text-[var(--navy)]"
                        >
                          {game.title}
                        </Link>
                      </td>
                      <td className="px-3 py-3 text-zinc-600">{game.genre ?? '—'}</td>
                      <td className="px-3 py-3 text-zinc-600">{game.publisher ?? '—'}</td>
                      <td className="px-3 py-3 text-zinc-600">{game.ownership}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}