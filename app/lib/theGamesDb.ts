type TgdbPlatform = {
  id: number;
  name: string;
  alias?: string | null;
  overview?: string | null;
  developer?: string | null;
  manufacturer?: string | null;
  icon?: string | null;
};

type TgdbGame = {
  id: number;
  game_title: string;
  overview?: string | null;
  release_date?: string | null;
  rating?: number | string | null;
  youtube?: string | null;
  genres?: number[];
  publishers?: number[];
  developers?: number[];
  platform?: number | number[] | null;
};

type TgdbImageEntry = {
  id: number;
  type: string;
  filename: string;
  side?: string | null;
};

type TgdbBaseResponse = {
  code: number;
  status: string;
};

type TgdbPlatformsResponse = TgdbBaseResponse & {
  data?: {
    platforms?: Record<string, TgdbPlatform>;
  };
};

type TgdbGamesResponse = TgdbBaseResponse & {
  data?: {
    games?: Record<string, TgdbGame>;
  };
  include?: {
    boxart?: {
      base_url?: {
        original?: string;
        small?: string;
        thumb?: string;
        cropped_center_thumb?: string;
        medium?: string;
        large?: string;
      };
      data?: Record<string, TgdbImageEntry[]>;
    };
  };
};

type TgdbGameImagesResponse = TgdbBaseResponse & {
  data?: {
    base_url?: {
      original?: string;
      small?: string;
      thumb?: string;
      cropped_center_thumb?: string;
      medium?: string;
      large?: string;
    };
    images?: Record<string, TgdbImageEntry[]>;
  };
};

export type ExternalPlatformMeta = {
  id: number;
  name: string;
  overview: string | null;
  developer: string | null;
  manufacturer: string | null;
  iconUrl: string | null;
};

export type ExternalGameMeta = {
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

export type CollectionGameEnrichment = {
  platform: ExternalPlatformMeta | null;
  game: ExternalGameMeta | null;
  screenshots: string[];
};

const BASE_URL = 'https://api.thegamesdb.net';

function getApiKey(): string | null {
  return process.env.THEGAMESDB_API_KEY?.trim() || null;
}

export function hasTheGamesDbKey(): boolean {
  return Boolean(getApiKey());
}

async function tgdb<T>(
  pathname: string,
  params: Record<string, string | number | undefined>
): Promise<T | null> {
  const apiKey = getApiKey();

  if (!apiKey) {
    return null;
  }

  const search = new URLSearchParams();
  search.set('apikey', apiKey);

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      search.set(key, String(value));
    }
  }

  const url = `${BASE_URL}${pathname}?${search.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 * 60 * 24 },
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.warn(`TheGamesDB rate limited request for ${pathname}`);
        return null;
      }

      if (response.status >= 500) {
        console.warn(`TheGamesDB temporary failure: ${response.status} for ${pathname}`);
        return null;
      }

      throw new Error(
        `TheGamesDB request failed with ${response.status}: ${response.statusText} for ${pathname}`
      );
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(`TheGamesDB fetch failed for ${pathname}:`, error);
    return null;
  }
}

function firstRecord<T>(record: Record<string, T> | undefined): T | null {
  if (!record) return null;
  const values = Object.values(record);
  return values[0] ?? null;
}

function normalizeRating(value: number | string | null | undefined): number | null {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normalizePlatformIds(platform: number | number[] | null | undefined): number[] {
  if (Array.isArray(platform)) return platform.filter((id) => Number.isFinite(id));
  if (typeof platform === 'number' && Number.isFinite(platform)) return [platform];
  return [];
}

function normalizeGame(
  game: TgdbGame,
  boxartData?: TgdbGamesResponse['include']
): ExternalGameMeta {
  const boxartBase = boxartData?.boxart?.base_url?.medium ?? null;
  const boxartSet = boxartData?.boxart?.data?.[String(game.id)] ?? [];
  const frontCover = boxartSet.find(
    (image) => image.type === 'boxart' && image.side === 'front'
  );

  return {
    id: game.id,
    title: game.game_title,
    overview: game.overview ?? null,
    releaseDate: game.release_date ?? null,
    rating: normalizeRating(game.rating),
    youtube: game.youtube ?? null,
    coverUrl: boxartBase && frontCover ? `${boxartBase}${frontCover.filename}` : null,
    screenshotUrls: [],
    platformIds: normalizePlatformIds(game.platform),
  };
}

function normalizeLookupTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-\s*[^-]+edition$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function scoreGameMatch(
  title: string,
  candidate: TgdbGame,
  expectedPlatformId?: number | null
): number {
  const target = title.trim().toLowerCase();
  const candidateTitle = candidate.game_title.trim().toLowerCase();

  let score = 0;

  if (candidateTitle === target) {
    score += 100;
  } else if (candidateTitle.startsWith(target)) {
    score += 80;
  } else if (candidateTitle.includes(target)) {
    score += 60;
  } else {
    score += 10;
  }

  const candidatePlatformIds = normalizePlatformIds(candidate.platform);

  if (
    expectedPlatformId &&
    candidatePlatformIds.includes(expectedPlatformId)
  ) {
    score += 1000;
  }

  return score;
}

export async function searchPlatformByName(
  platformName: string
): Promise<ExternalPlatformMeta | null> {
  const response = await tgdb<TgdbPlatformsResponse>('/v1/Platforms/ByPlatformName', {
    name: platformName,
    fields: 'overview,developer,manufacturer',
  });

  if (!response?.data?.platforms) {
    return null;
  }

  const platform = firstRecord(response.data.platforms);

  if (!platform) {
    return null;
  }

  return {
    id: platform.id,
    name: platform.name,
    overview: platform.overview ?? null,
    developer: platform.developer ?? null,
    manufacturer: platform.manufacturer ?? null,
    iconUrl: platform.icon ?? null,
  };
}

export async function searchGamesByName(
  gameTitle: string,
  platformName?: string | null,
  expectedPlatformId?: number | null
): Promise<ExternalGameMeta[]> {
  const response = await tgdb<TgdbGamesResponse>('/v1.1/Games/ByGameName', {
    name: gameTitle,
    fields: 'overview,genres,publishers,rating,youtube',
    include: 'boxart',
    'filter[platform]': platformName ?? undefined,
  });

  const games = response?.data?.games ? Object.values(response.data.games) : [];

  if (!games.length) {
    return [];
  }

  return games
    .sort(
      (a, b) =>
        scoreGameMatch(gameTitle, b, expectedPlatformId) -
        scoreGameMatch(gameTitle, a, expectedPlatformId)
    )
    .map((game) => normalizeGame(game, response?.include));
}

export async function searchBestGameByName(
  gameTitle: string,
  platformName?: string | null
): Promise<ExternalGameMeta | null> {
  const filteredResults = await searchGamesByName(gameTitle, platformName);
  if (filteredResults.length > 0) {
    return filteredResults[0];
  }

  const unfilteredResults = await searchGamesByName(gameTitle);
  return unfilteredResults[0] ?? null;
}

export async function getGameImages(gameId: number): Promise<string[]> {
  const response = await tgdb<TgdbGameImagesResponse>('/v1/Games/Images', {
    games_id: gameId,
  });

  const baseUrl = response?.data?.base_url?.medium ?? response?.data?.base_url?.original;
  const images = response?.data?.images?.[String(gameId)] ?? [];

  if (!baseUrl) {
    return [];
  }

  return images
    .filter((image) => image.type === 'screenshot' || image.type === 'fanart')
    .map((image) => `${baseUrl}${image.filename}`)
    .slice(0, 6);
}

export async function enrichCollectionGame(
  collectionGame: { title: string; platform: string | null }
): Promise<CollectionGameEnrichment> {
  try {
    const platformMeta = collectionGame.platform
      ? await searchPlatformByName(collectionGame.platform)
      : null;

    const normalizedTitle = normalizeLookupTitle(collectionGame.title);

    const gameMeta = await searchBestGameByName(
      normalizedTitle,
      platformMeta?.name ?? collectionGame.platform ?? undefined
    );

    const screenshots = gameMeta ? await getGameImages(gameMeta.id) : [];

    return {
      platform: platformMeta,
      game: gameMeta
        ? {
            ...gameMeta,
            screenshotUrls: screenshots,
          }
        : null,
      screenshots,
    };
  } catch (error) {
    console.warn(
      `Failed to enrich game "${collectionGame.title}" on platform "${collectionGame.platform ?? 'unknown'}":`,
      error
    );

    return {
      platform: null,
      game: null,
      screenshots: [],
    };
  }
}



