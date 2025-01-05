import { NextResponse } from 'next/server';
import { getOrganisations } from '@/libs/db-utils';

export async function GET() {
  try {
    const organisations = await getOrganisations();
    return NextResponse.json(organisations);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 