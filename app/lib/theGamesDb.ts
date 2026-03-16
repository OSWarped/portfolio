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
  rating?: number | null;
  youtube?: string | null;
  genres?: number[];
  publishers?: number[];
  developers?: number[];
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
};

const BASE_URL = 'https://api.thegamesdb.net';

function getApiKey(): string | null {
  return process.env.THEGAMESDB_API_KEY?.trim() || null;
}

export function hasTheGamesDbKey(): boolean {
  return Boolean(getApiKey());
}

async function tgdb<T>(pathname: string, params: Record<string, string | number | undefined>) {
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

  const response = await fetch(`${BASE_URL}${pathname}?${search.toString()}`, {
    next: { revalidate: 60 * 60 * 24 },
  });

  if (!response.ok) {
    throw new Error(`TheGamesDB request failed with ${response.status}`);
  }

  return (await response.json()) as T;
}

function firstRecord<T>(record: Record<string, T> | undefined): T | null {
  if (!record) return null;
  const values = Object.values(record);
  return values[0] ?? null;
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
  };
}

export async function searchGameByName(
  gameTitle: string,
  platformName?: string | null
): Promise<ExternalGameMeta | null> {
  const response = await tgdb<TgdbGamesResponse>('/v1.1/Games/ByGameName', {
    name: gameTitle,
    fields: 'overview,genres,publishers,rating,youtube',
    include: 'boxart',
    'filter[platform]': platformName ?? undefined,
  });

  if (!response?.data?.games) {
    return null;
  }

  const game = firstRecord(response.data.games);

  if (!game) {
    return null;
  }

  const boxartBase = response.include?.boxart?.base_url?.medium ?? null;
  const boxartSet = response.include?.boxart?.data?.[String(game.id)] ?? [];
  const frontCover = boxartSet.find(
    (image) => image.type === 'boxart' && image.side === 'front'
  );

  return {
    id: game.id,
    title: game.game_title,
    overview: game.overview ?? null,
    releaseDate: game.release_date ?? null,
    rating: typeof game.rating === 'number' ? game.rating : null,
    youtube: game.youtube ?? null,
    coverUrl: boxartBase && frontCover ? `${boxartBase}${frontCover.filename}` : null,
    screenshotUrls: [],
  };
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