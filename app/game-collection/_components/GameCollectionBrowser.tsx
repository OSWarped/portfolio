'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { CollectionGame } from '../../lib/gameCollection';

type BrowserMode = 'recent' | 'all';

export default function GameCollectionBrowser({
  recentGames,
  allGames,
}: {
  recentGames: CollectionGame[];
  allGames: CollectionGame[];
}) {
  const [mode, setMode] = useState<BrowserMode>('recent');

  const games = useMemo(
    () => (mode === 'recent' ? recentGames : allGames),
    [mode, recentGames, allGames]
  );

  return (
    <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-[var(--navy)]">
            {mode === 'recent' ? 'Recently Added' : 'All Games'}
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            {mode === 'recent'
              ? 'Most recently added games from the collection export.'
              : 'A browsable list of all rows categorized as Games.'}
          </p>
        </div>

        <div className="inline-flex rounded-full border border-zinc-200 bg-zinc-50 p-1">
          <button
            type="button"
            onClick={() => setMode('recent')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === 'recent'
                ? 'bg-white text-[var(--navy)] shadow-sm'
                : 'text-zinc-500 hover:text-[var(--navy)]'
            }`}
          >
            Recent
          </button>

          <button
            type="button"
            onClick={() => setMode('all')}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              mode === 'all'
                ? 'bg-white text-[var(--navy)] shadow-sm'
                : 'text-zinc-500 hover:text-[var(--navy)]'
            }`}
          >
            All Games
          </button>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-zinc-200 text-zinc-500">
            <tr>
              <th className="px-3 py-3 font-medium">Title</th>
              <th className="px-3 py-3 font-medium">Platform</th>
              <th className="px-3 py-3 font-medium">Genre</th>
              <th className="px-3 py-3 font-medium">State</th>
            </tr>
          </thead>
          <tbody>
            {games.map((game) => (
              <tr key={game.slug} className="border-b border-zinc-100">
                <td className="px-3 py-3">
                  <Link
                    href={`/game-collection/game/${game.slug}`}
                    className="font-medium text-zinc-900 transition hover:text-[var(--navy)]"
                  >
                    {game.title}
                  </Link>
                </td>

                <td className="px-3 py-3 text-zinc-600">
                  {game.platformSlug ? (
                    <Link
                      href={`/game-collection/platform/${game.platformSlug}`}
                      className="transition hover:text-[var(--navy)]"
                    >
                      {game.platform}
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="px-3 py-3 text-zinc-600">{game.genre ?? '—'}</td> 
                <td className="px-3 py-3 text-zinc-600">{game.state}</td>               
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}