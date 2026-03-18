import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type CollectionGameRecord = {
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

type SaveMatchRequest = {
  slug: string;
  game: {
    id: number;
    title: string;
    overview: string | null;
    releaseDate: string | null;
    rating: number | null;
    youtube: string | null;
    coverUrl: string | null;
    screenshotUrls: string[];
    platformIds?: number[];
  };
  platform?: {
    id: number;
    name: string;
    overview: string | null;
    developer: string | null;
    manufacturer: string | null;
    iconUrl?: string | null;
  } | null;
};

const JSON_PATH = path.join(process.cwd(), 'data', 'gameCollection.json');

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function normalizeNumber(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

async function readCollectionJson(): Promise<CollectionGameRecord[]> {
  const json = await readFile(JSON_PATH, 'utf8');
  const parsed = JSON.parse(json) as CollectionGameRecord[];
  return Array.isArray(parsed) ? parsed : [];
}

async function writeCollectionJson(records: CollectionGameRecord[]): Promise<void> {
  await writeFile(JSON_PATH, JSON.stringify(records, null, 2), 'utf8');
}



export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Partial<SaveMatchRequest>;

    if (!isNonEmptyString(body.slug)) {
      return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    }

    if (!body.game || normalizeNumber(body.game.id) === null || !isNonEmptyString(body.game.title)) {
      return NextResponse.json({ error: 'Missing or invalid game payload.' }, { status: 400 });
    }

    const records = await readCollectionJson();
    const index = records.findIndex((record) => record.slug === body.slug?.trim());

    if (index === -1) {
      return NextResponse.json({ error: 'Game record not found.' }, { status: 404 });
    }

    const existing = records[index];
    const chosenPlatformId =
      normalizeNumber(body.platform?.id) ??
      normalizeNumber(body.game.platformIds?.[0]) ??
      null;

    const updated: CollectionGameRecord = {
      ...existing,
      tgdb: {
        gameId: body.game.id,
        platformId: chosenPlatformId,
        title: body.game.title.trim(),
        coverUrl: body.game.coverUrl ?? null,
        releaseDate: body.game.releaseDate ?? null,
        overview: body.game.overview ?? null,
        rating: normalizeNumber(body.game.rating),
        youtube: body.game.youtube ?? null,
        screenshots: normalizeStringArray(body.game.screenshotUrls),
        matchedAt: new Date().toISOString(),
        matchSource: 'manual',
      },
      platformMeta: body.platform
        ? {
            name: body.platform.name,
            overview: body.platform.overview ?? null,
            developer: body.platform.developer ?? null,
            manufacturer: body.platform.manufacturer ?? null,
            iconUrl: body.platform.iconUrl ?? null,
          }
        : existing.platformMeta,
    };

    records[index] = updated;
    await writeCollectionJson(records);

    return NextResponse.json({
      ok: true,
      slug: updated.slug,
      tgdbGameId: updated.tgdb.gameId,
      tgdbPlatformId: updated.tgdb.platformId,
    });
  } catch (error) {
    console.error('Failed to save manual TGDB match:', error);
    return NextResponse.json(
      { error: 'Failed to save manual match.' },
      { status: 500 }
    );
  }
}