import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json(
    { error: 'Live TheGamesDB search is disabled to protect the API quota.' },
    { status: 503 }
  );
}