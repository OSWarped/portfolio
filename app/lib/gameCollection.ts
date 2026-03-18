import { readFile } from 'node:fs/promises';
import path from 'node:path';

export type CollectionGameRecord = {
  id: string;
  slug: string;

  title: string;
  platform: string | null;
  category: string | null;
  userRecordType: string | null;
  country: string | null;
  releaseType: string | null;
  publisher: string | null;
  developer: string | null;
  genre: string | null;
  createdAt: string | null;
  ownership: string | null;
  priceLoose: string | null;
  priceCib: string | null;
  priceNew: string | null;
  yourPrice: string | null;
  pricePaid: string | null;
  itemCondition: string | null;
  boxCondition: string | null;
  manualCondition: string | null;
  notes: string | null;
  tags: string[];
  metacritic: string | null;

  tgdb: {
    gameId: number | null;
    platformId: number | null;
    title: string | null;
    coverUrl: string | null;
    releaseDate: string | null;
    overview: string | null;
    rating: number | null;
    youtube: string | null;
    screenshots: string[];
    matchedAt: string | null;
    matchSource: 'auto' | 'manual' | null;
  };

  platformMeta: {
    name: string | null;
    overview: string | null;
    developer: string | null;
    manufacturer: string | null;
    iconUrl: string | null;
  };
};

export type RawOwnershipType =
  | 'Loose'
  | 'CIB'
  | 'CIB+'
  | 'Loose+'
  | 'Boxed'
  | 'New'
  | 'Digital'
  | 'Other';

export type CollectionState =
  | 'Loose'
  | 'Complete in Box'
  | 'Complete in Box with inserts'
  | 'Loose with manual'
  | 'Boxed no manual'
  | 'New'
  | 'Digital'
  | 'Other';

export type CollectionGame = {
  slug: string;
  title: string;
  platform: string | null;
  platformSlug: string | null;
  category: string | null;
  ownership: RawOwnershipType;
  publisher: string | null;
  developer: string | null;
  genre: string | null;
  createdAt: string | null;
  metacritic: number | null;
  state: CollectionState;
  tgdbGameId: number | null;
  tgdbCoverUrl: string | null;
};

export type PlatformSummary = {
  name: string;
  slug: string;
  total: number;
};

export type PlatformDetail = {
  platform: PlatformSummary;
  games: CollectionGame[];
  topGenres: Array<{ name: string; count: number }>;
  topPublishers: Array<{ name: string; count: number }>;
};

export type CollectionOverview = {
  totalItems: number;
  platformCount: number;
  topPlatforms: PlatformSummary[];
  recentGames: CollectionGame[];
  allGames: CollectionGame[];
};

const JSON_PATH = path.join(process.cwd(), 'data', 'gameCollection.json');

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

const OWNERSHIP_VALUES = new Set<RawOwnershipType>([
  'Loose',
  'CIB',
  'CIB+',
  'Loose+',
  'Boxed',
  'New',
  'Digital',
  'Other',
]);

function normalizeOwnership(value: string | null | undefined): RawOwnershipType {
  const trimmed = value?.trim();

  if (trimmed && OWNERSHIP_VALUES.has(trimmed as RawOwnershipType) && trimmed !== 'Other') {
    return trimmed as RawOwnershipType;
  }

  return 'Other';
}

function mapOwnershipToState(ownership: RawOwnershipType): CollectionState {
  switch (ownership) {
    case 'Loose':
      return 'Loose';
    case 'CIB':
      return 'Complete in Box';
    case 'CIB+':
      return 'Complete in Box with inserts';
    case 'Loose+':
      return 'Loose with manual';
    case 'Boxed':
      return 'Boxed no manual';
    case 'New':
      return 'New';
    case 'Digital':
      return 'Digital';
    default:
      return 'Other';
  }
}

function normalizeMetacritic(value: string | null | undefined): number | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;

  const parsed = Number(trimmed);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function mapRecordToGame(record: CollectionGameRecord): CollectionGame {
  const ownership = normalizeOwnership(record.ownership);

  return {
    slug: record.slug,
    title: record.title,
    platform: record.platform,
    platformSlug: record.platform ? slugify(record.platform) : null,
    category: record.category,
    ownership,
    publisher: record.publisher,
    developer: record.developer,
    genre: record.genre,
    createdAt: record.createdAt,
    metacritic: normalizeMetacritic(record.metacritic),
    state: mapOwnershipToState(ownership),
    tgdbGameId: record.tgdb.gameId,
    tgdbCoverUrl: record.tgdb.coverUrl,
  };
}

async function readCollectionRecords(): Promise<CollectionGameRecord[]> {
  const json = await readFile(JSON_PATH, 'utf8');
  const parsed = JSON.parse(json) as CollectionGameRecord[];

  return parsed.filter((record) => Boolean(record?.title && record?.slug));
}

export async function getAllCollectionRecords(): Promise<CollectionGameRecord[]> {
  return readCollectionRecords();
}

export async function getAllCollectionGames(): Promise<CollectionGame[]> {
  const records = await readCollectionRecords();
  return records.map(mapRecordToGame);
}

export async function getCollectionOverview(): Promise<CollectionOverview> {
  const collection = await getAllCollectionGames();
  const gamesOnly = collection.filter((game) => game.category === 'Games');

  const platformMap = new Map<string, PlatformSummary>();

  for (const game of gamesOnly) {
    if (!game.platform || !game.platformSlug) continue;

    const current = platformMap.get(game.platform) ?? {
      name: game.platform,
      slug: game.platformSlug,
      total: 0,
    };

    current.total += 1;
    platformMap.set(game.platform, current);
  }

  const topPlatforms = [...platformMap.values()]
    .sort((a, b) => b.total - a.total)
    .slice(0, 12);

  const recentGames = [...gamesOnly]
    .filter((game) => game.createdAt !== null)
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 16);

  const allGames = [...gamesOnly].sort((a, b) => a.title.localeCompare(b.title));

  return {
    totalItems: gamesOnly.length,
    platformCount: platformMap.size,
    topPlatforms,
    recentGames,
    allGames,
  };
}

export async function getAllPlatforms(): Promise<PlatformSummary[]> {
  const overview = await getCollectionOverview();
  return overview.topPlatforms;
}

export async function getPlatformDetailBySlug(
  platformSlug: string
): Promise<PlatformDetail | null> {
  const games = await getAllCollectionGames();

  const platformGames = games
    .filter((game) => game.platformSlug === platformSlug)
    .sort((a, b) => a.title.localeCompare(b.title));

  if (platformGames.length === 0) {
    return null;
  }

  const first = platformGames[0];
  const genreMap = new Map<string, number>();
  const publisherMap = new Map<string, number>();

  for (const game of platformGames) {
    if (game.genre) {
      genreMap.set(game.genre, (genreMap.get(game.genre) ?? 0) + 1);
    }

    if (game.publisher) {
      publisherMap.set(game.publisher, (publisherMap.get(game.publisher) ?? 0) + 1);
    }
  }

  return {
    platform: {
      name: first.platform ?? 'Unknown Platform',
      slug: first.platformSlug ?? platformSlug,
      total: platformGames.length,
    },
    games: platformGames,
    topGenres: [...genreMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    topPublishers: [...publisherMap.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
  };
}

export async function getGameBySlug(slug: string): Promise<CollectionGame | null> {
  const games = await getAllCollectionGames();
  return games.find((game) => game.slug === slug) ?? null;
}

export async function getCollectionRecordBySlug(
  slug: string
): Promise<CollectionGameRecord | null> {
  const records = await getAllCollectionRecords();
  return records.find((record) => record.slug === slug) ?? null;
}

