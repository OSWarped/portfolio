import { readFile } from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';

type RawCollectionRow = {
    Title?: string;
    Platform?: string;
    Category?: string;
    Ownership?: string;
    Publisher?: string;
    Developer?: string;
    Genre?: string;
    CreatedAt?: string;
    metacritic?: string;
    ItemCondition?: string;
    BoxCondition?: string;
    ManualCondition?: string;
};

export type OwnershipType = 'Owned' | 'Wishlist' | 'Other';

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

const CSV_PATH = path.join(process.cwd(), 'data', 'ge_collection.csv');

function normalizeText(value: string | undefined): string | null {
    const trimmed = value?.trim();

    if (!trimmed || trimmed === 'Missing Field') {
        return null;
    }

    return trimmed;
}

function normalizeOwnership(value: string | undefined): RawOwnershipType {
    const normalized = value?.trim();

    switch (normalized) {
        case 'Loose':
        case 'CIB':
        case 'CIB+':
        case 'Loose+':
        case 'Boxed':
        case 'New':
        case 'Digital':
            return normalized;
        default:
            return 'Other';
    }
}

function normalizeDate(value: string | undefined): string | null {
    const trimmed = value?.trim();

    if (!trimmed) {
        return null;
    }

    const parsed = new Date(trimmed);

    if (Number.isNaN(parsed.getTime())) {
        return null;
    }

    return parsed.toISOString();
}

function normalizeMetacritic(value: string | undefined): number | null {
    const trimmed = value?.trim();

    if (!trimmed) {
        return null;
    }

    const parsed = Number(trimmed);

    if (!Number.isFinite(parsed) || parsed <= 0) {
        return null;
    }

    return parsed;
}
function slugify(value: string): string {
    return value
        .toLowerCase()
        .trim()
        .replace(/&/g, ' and ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .replace(/-{2,}/g, '-');
}

function buildStableGameSlugs(
    rows: Array<Omit<CollectionGame, 'slug'>>
): CollectionGame[] {
    const seen = new Map<string, number>();

    return rows.map((row) => {
        const base = `${slugify(row.title)}--${slugify(row.platform ?? 'unknown')}`;
        const count = (seen.get(base) ?? 0) + 1;
        seen.set(base, count);

        return {
            ...row,
            slug: count === 1 ? base : `${base}-${count}`,
        };
    });
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

async function readParsedRows(): Promise<CollectionGame[]> {
    const csv = await readFile(CSV_PATH, 'utf8');

    const parsed = Papa.parse<RawCollectionRow>(csv, {
        header: true,
        skipEmptyLines: true,
    });

    if (parsed.errors.length > 0) {
        throw new Error(parsed.errors[0]?.message ?? 'Failed to parse collection CSV.');
    }

    const mapped = parsed.data
        .map((row) => {
            const title = normalizeText(row.Title);

            if (!title) {
                return null;
            }

            const platform = normalizeText(row.Platform);
            const ownership = normalizeOwnership(row.Ownership);

            return {
                title,
                platform,
                platformSlug: platform ? slugify(platform) : null,
                category: normalizeText(row.Category),
                ownership,
                publisher: normalizeText(row.Publisher),
                developer: normalizeText(row.Developer),
                genre: normalizeText(row.Genre),
                createdAt: normalizeDate(row.CreatedAt),
                metacritic: normalizeMetacritic(row.metacritic),
                state: mapOwnershipToState(ownership),
            } satisfies Omit<CollectionGame, 'slug'>;
        })
        .filter((row): row is Omit<CollectionGame, 'slug'> => row !== null);

    return buildStableGameSlugs(mapped);
}

export async function getAllCollectionGames(): Promise<CollectionGame[]> {
    return readParsedRows();
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
            owned: 0,
            wishlist: 0,
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