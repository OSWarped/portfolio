'use client';

import { useMemo, useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

type Candidate = {
  id: number;
  title: string;
  overview: string | null;
  releaseDate: string | null;
  rating: number | null;
  youtube: string | null;
  coverUrl: string | null;
  screenshotUrls: string[];
  platformIds: number[];
};

type PlatformMeta = {
  id: number;
  name: string;
  overview: string | null;
  developer: string | null;
  manufacturer: string | null;
  iconUrl: string | null;
} | null;

type MatchPickerProps = {
  slug: string;
  title: string;
  platform: string | null;
  hasSavedMatch: boolean;
};

export default function MatchPicker({
  slug,
  title,
  platform,
  hasSavedMatch,
}: MatchPickerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, startSearch] = useTransition();
  const [isSaving, startSave] = useTransition();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [platformMeta, setPlatformMeta] = useState<PlatformMeta>(null);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  const buttonLabel = useMemo(
    () => (hasSavedMatch ? 'Find Better Match' : 'Find Match'),
    [hasSavedMatch]
  );

  function openAndLoad() {
    setIsOpen(true);

    if (loaded) {
      return;
    }

    startSearch(async () => {
      try {
        setError(null);

        const params = new URLSearchParams({ title });
        if (platform) {
          params.set('platform', platform);
        }

        const response = await fetch(
          `/api/game-collection/search-matches?${params.toString()}`,
          { method: 'GET' }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? 'Failed to search matches.');
        }

        setCandidates(Array.isArray(data.candidates) ? data.candidates : []);
        setPlatformMeta(data.platform ?? null);
        setLoaded(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to search matches.');
      }
    });
  }

  function saveCandidate(candidate: Candidate) {
    startSave(async () => {
      try {
        setError(null);

        const response = await fetch('/api/game-collection/save-match', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            slug,
            game: {
              id: candidate.id,
              title: candidate.title,
              overview: candidate.overview,
              releaseDate: candidate.releaseDate,
              rating: candidate.rating,
              youtube: candidate.youtube,
              coverUrl: candidate.coverUrl,
              screenshotUrls: candidate.screenshotUrls,
              platformIds: candidate.platformIds,
            },
            platform: platformMeta
              ? {
                  id: platformMeta.id,
                  name: platformMeta.name,
                  overview: platformMeta.overview,
                  developer: platformMeta.developer,
                  manufacturer: platformMeta.manufacturer,
                  iconUrl: platformMeta.iconUrl,
                }
              : null,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.error ?? 'Failed to save match.');
        }

        setIsOpen(false);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save match.');
      }
    });
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-sm font-medium text-zinc-900">Metadata match</div>
          <div className="text-sm text-zinc-500">
            {hasSavedMatch
              ? 'A saved match exists. You can replace it if the art or metadata is wrong.'
              : 'No saved match yet. Search TheGamesDB and choose the correct one.'}
          </div>
        </div>

        <button
          type="button"
          onClick={openAndLoad}
          className="rounded-xl bg-[var(--navy)] px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90"
          disabled={isSearching || isSaving}
        >
          {isSearching ? 'Searching…' : buttonLabel}
        </button>
      </div>

      {isOpen ? (
        <div className="mt-5 space-y-4 border-t border-zinc-200 pt-5">
          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          {!isSearching && candidates.length === 0 && !error ? (
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              No candidates were found for this title yet.
            </div>
          ) : null}

          <div className="grid gap-4">
            {candidates.map((candidate) => (
              <div
                key={candidate.id}
                className="grid gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 md:grid-cols-[120px_1fr_auto]"
              >
                <div>
                  {candidate.coverUrl ? (
                    <Image
                      src={candidate.coverUrl}
                      alt={`${candidate.title} cover art`}
                      width={120}
                      height={160}
                      className="rounded-xl border border-zinc-200 object-cover"
                    />
                  ) : (
                    <div className="flex h-[160px] w-[120px] items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-white text-xs text-zinc-500">
                      No cover
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div>
                    <h3 className="text-lg font-semibold text-zinc-900">
                      {candidate.title}
                    </h3>
                    <div className="mt-1 flex flex-wrap gap-2 text-sm text-zinc-500">
                      <span className="rounded-full bg-white px-2.5 py-1">
                        Release: {candidate.releaseDate ?? '—'}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1">
                        Rating: {candidate.rating ?? '—'}
                      </span>
                      <span className="rounded-full bg-white px-2.5 py-1">
                        TGDB ID: {candidate.id}
                      </span>
                    </div>
                  </div>

                  {candidate.overview ? (
                    <p className="line-clamp-3 text-sm leading-6 text-zinc-700">
                      {candidate.overview}
                    </p>
                  ) : (
                    <p className="text-sm text-zinc-500">No overview available.</p>
                  )}
                </div>

                <div className="flex items-start md:justify-end">
                  <button
                    type="button"
                    onClick={() => saveCandidate(candidate)}
                    disabled={isSaving}
                    className="rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-100 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving…' : 'Use This Match'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}