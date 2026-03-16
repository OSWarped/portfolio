import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getGameBySlug } from '../../../lib/gameCollection';
import {
    getGameImages,
    hasTheGamesDbKey,
    searchGameByName,
} from '../../../lib/theGamesDb';

type PageProps = {
    params: Promise<{
        gameSlug: string;
    }>;
};

export default async function GameDetailPage({ params }: PageProps) {
    const { gameSlug } = await params;
    const game = await getGameBySlug(gameSlug);

    if (!game) {
        notFound();
    }

    const externalMeta = hasTheGamesDbKey()
        ? await searchGameByName(game.title, game.platform)
        : null;

    const screenshots =
        externalMeta?.id ? await getGameImages(externalMeta.id) : [];

    return (
        <main className="min-h-screen bg-white px-6 py-20 text-black">
            <div className="mx-auto max-w-5xl space-y-10">
                <nav className="text-sm text-zinc-500">
                    <Link href="/game-collection" className="hover:text-[var(--navy)]">
                        Game Collection
                    </Link>

                    {game.platformSlug && game.platform ? (
                        <>
                            {' '}
                            /{' '}
                            <Link
                                href={`/game-collection/platform/${game.platformSlug}`}
                                className="hover:text-[var(--navy)]"
                            >
                                {game.platform}
                            </Link>
                        </>
                    ) : null}

                    {' '} / <span>{game.title}</span>
                </nav>

                <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
                    <div className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6">
                        {externalMeta?.coverUrl ? (
                            <img
                                src={externalMeta.coverUrl}
                                alt={`${game.title} cover art`}
                                className="w-full rounded-2xl object-cover"
                            />
                        ) : (
                            <div className="flex aspect-[3/4] items-center justify-center rounded-2xl border border-dashed border-zinc-300 bg-white text-sm text-zinc-500">
                                Cover art appears here after API enrichment is enabled
                            </div>
                        )}
                    </div>

                    <div className="space-y-6">
                        <div>
                            <p className="font-mono text-xs uppercase tracking-[0.22em] text-zinc-500">
                                Game
                            </p>

                            <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[var(--navy)] md:text-5xl">
                                {game.title}
                            </h1>

                            <div className="mt-4 flex flex-wrap gap-3 text-sm text-zinc-600">
                                {game.platform ? (
                                    <Link
                                        href={`/game-collection/platform/${game.platformSlug}`}
                                        className="rounded-full bg-zinc-100 px-3 py-1 transition hover:text-[var(--navy)]"
                                    >
                                        {game.platform}
                                    </Link>
                                ) : null}

                                <span className="rounded-full bg-zinc-100 px-3 py-1">
                                    {game.ownership}
                                </span>

                                {game.genre ? (
                                    <span className="rounded-full bg-zinc-100 px-3 py-1">{game.genre}</span>
                                ) : null}
                            </div>
                        </div>

                        <div className="space-y-4 text-zinc-700">
                            <p>
                                {externalMeta?.overview ??
                                    'External game description will appear here once the TheGamesDB API key is configured.'}
                            </p>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                <div className="text-sm text-zinc-500">Publisher</div>
                                <div className="mt-1 font-medium text-zinc-900">{game.publisher ?? '—'}</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                <div className="text-sm text-zinc-500">Developer</div>
                                <div className="mt-1 font-medium text-zinc-900">{game.developer ?? '—'}</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                <div className="text-sm text-zinc-500">Genre</div>
                                <div className="mt-1 font-medium text-zinc-900">{game.genre ?? '—'}</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                <div className="text-sm text-zinc-500">State</div>
                                <div className="mt-1 font-medium text-zinc-900">{game.state}</div>
                            </div>

                            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                                <div className="text-sm text-zinc-500">Release Date</div>
                                <div className="mt-1 font-medium text-zinc-900">
                                    {externalMeta?.releaseDate ?? '—'}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
                    <h2 className="text-2xl font-semibold text-[var(--navy)]">Screenshots</h2>

                    {screenshots.length > 0 ? (
                        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {screenshots.map((src) => (
                                <img
                                    key={src}
                                    src={src}
                                    alt={`${game.title} screenshot`}
                                    className="w-full rounded-2xl border border-zinc-200 object-cover"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="mt-6 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-6 text-sm text-zinc-500">
                            Screenshots will appear here after live metadata is connected.
                        </div>
                    )}
                </section>
            </div>
        </main>
    );
}