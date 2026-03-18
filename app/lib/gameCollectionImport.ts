import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import Papa from 'papaparse';
import type { CollectionGameRecord } from './gameCollection';

type RawCollectionRow = {
  Platform?: string;
  Category?: string;
  UserRecordType?: string;
  Title?: string;
  Country?: string;
  ReleaseType?: string;
  Publisher?: string;
  Developer?: string;
  Genre?: string;
  CreatedAt?: string;
  Ownership?: string;
  PriceLoose?: string;
  PriceCIB?: string;
  PriceNew?: string;
  YourPrice?: string;
  PricePaid?: string;
  ItemCondition?: string;
  BoxCondition?: string;
  ManualCondition?: string;
  Notes?: string;
  Tags?: string;
  metacritic?: string;
};

const CSV_PATH = path.join(process.cwd(), 'data', 'ge_collection.csv');
const JSON_PATH = path.join(process.cwd(), 'data', 'gameCollection.json');

function normalizeText(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || trimmed === 'Missing Field') {
    return null;
  }
  return trimmed;
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

function parseTags(value: string | undefined): string[] {
  const trimmed = value?.trim();
  if (!trimmed) {
    return [];
  }

  return trimmed
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
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

function buildStableIdentity(
  rows: Array<Omit<CollectionGameRecord, 'id' | 'slug'>>
): CollectionGameRecord[] {
  const seen = new Map<string, number>();

  return rows.map((row) => {
    const titlePart = slugify(row.title);
    const platformPart = slugify(row.platform ?? 'unknown');
    const releaseTypePart = slugify(row.releaseType ?? 'standard');
    const countryPart = slugify(row.country ?? 'unknown');

    const base = `${titlePart}--${platformPart}--${releaseTypePart}--${countryPart}`;
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);

    const id = count === 1 ? base : `${base}-${count}`;
    const slugBase = `${titlePart}--${platformPart}`;
    const slug = count === 1 ? slugBase : `${slugBase}-${count}`;

    return {
      ...row,
      id,
      slug,
    };
  });
}

function mapRowToRecord(
  row: RawCollectionRow
): Omit<CollectionGameRecord, 'id' | 'slug'> | null {
  const title = normalizeText(row.Title);

  if (!title) {
    return null;
  }

  return {
    title,
    platform: normalizeText(row.Platform),
    category: normalizeText(row.Category),
    userRecordType: normalizeText(row.UserRecordType),
    country: normalizeText(row.Country),
    releaseType: normalizeText(row.ReleaseType),
    publisher: normalizeText(row.Publisher),
    developer: normalizeText(row.Developer),
    genre: normalizeText(row.Genre),
    createdAt: normalizeDate(row.CreatedAt),
    ownership: normalizeText(row.Ownership),
    priceLoose: normalizeText(row.PriceLoose),
    priceCib: normalizeText(row.PriceCIB),
    priceNew: normalizeText(row.PriceNew),
    yourPrice: normalizeText(row.YourPrice),
    pricePaid: normalizeText(row.PricePaid),
    itemCondition: normalizeText(row.ItemCondition),
    boxCondition: normalizeText(row.BoxCondition),
    manualCondition: normalizeText(row.ManualCondition),
    notes: normalizeText(row.Notes),
    tags: parseTags(row.Tags),
    metacritic: normalizeText(row.metacritic),

    tgdb: {
      gameId: null,
      platformId: null,
      title: null,
      coverUrl: null,
      releaseDate: null,
      overview: null,
      rating: null,
      youtube: null,
      screenshots: [],
      matchedAt: null,
      matchSource: null,
    },

    platformMeta: {
      name: null,
      overview: null,
      developer: null,
      manufacturer: null,
      iconUrl: null,
    },
  };
}

export async function importCollectionFromCsv(): Promise<CollectionGameRecord[]> {
  const csv = await readFile(CSV_PATH, 'utf8');

  const parsed = Papa.parse<RawCollectionRow>(csv, {
    header: true,
    skipEmptyLines: true,
  });

  if (parsed.errors.length > 0) {
    throw new Error(parsed.errors[0]?.message ?? 'Failed to parse collection CSV.');
  }

  const mapped = parsed.data
    .map(mapRowToRecord)
    .filter((row): row is Omit<CollectionGameRecord, 'id' | 'slug'> => row !== null);

  return buildStableIdentity(mapped);
}

export async function writeCollectionJson(
  records: CollectionGameRecord[]
): Promise<void> {
  await writeFile(JSON_PATH, JSON.stringify(records, null, 2), 'utf8');
}

export async function importAndWriteCollectionJson(): Promise<CollectionGameRecord[]> {
  const records = await importCollectionFromCsv();
  await writeCollectionJson(records);
  return records;
}