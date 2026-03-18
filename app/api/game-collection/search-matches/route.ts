import { NextRequest, NextResponse } from 'next/server';
import {
  getGameImages,
  hasTheGamesDbKey,
  searchGamesByName,
  searchPlatformByName,
} from '@/app/lib/theGamesDb';

function normalizeLookupTitle(title: string): string {
  return title
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*-\s*[^-]+edition$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export async function GET(req: NextRequest) {
  try {
    if (!hasTheGamesDbKey()) {
      return NextResponse.json(
        { error: 'TheGamesDB key is not configured.' },
        { status: 400 }
      );
    }

    const rawTitle = req.nextUrl.searchParams.get('title')?.trim();
    const rawPlatform = req.nextUrl.searchParams.get('platform')?.trim() ?? null;

    if (!rawTitle) {
      return NextResponse.json({ error: 'Missing title.' }, { status: 400 });
    }

    const title = normalizeLookupTitle(rawTitle);
    const platformMeta = rawPlatform ? await searchPlatformByName(rawPlatform) : null;

    let candidates = await searchGamesByName(
      title,
      platformMeta?.name ?? rawPlatform ?? undefined,
      platformMeta?.id ?? null
    );

    if (candidates.length === 0) {
      candidates = await searchGamesByName(title, undefined, platformMeta?.id ?? null);
    }

    const hydrated = await Promise.all(
      candidates.slice(0, 8).map(async (candidate) => ({
        ...candidate,
        screenshotUrls: candidate.id ? await getGameImages(candidate.id) : [],
      }))
    );

    return NextResponse.json({
      platform: platformMeta,
      candidates: hydrated,
      debug: {
        rawTitle,
        normalizedTitle: title,
        rawPlatform,
        resolvedPlatform: platformMeta?.name ?? null,
        resolvedPlatformId: platformMeta?.id ?? null,
        candidateCount: hydrated.length,
      },
    });
  } catch (error) {
    console.error('Failed to search TGDB candidates:', error);
    return NextResponse.json(
      { error: 'Failed to search for matches.' },
      { status: 500 }
    );
  }
}