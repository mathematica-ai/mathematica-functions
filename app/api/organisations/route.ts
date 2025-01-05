import { NextRequest, NextResponse } from 'next/server';
import { createOrganisation, updateOrganisation, deleteOrganisation, getAllOrganisations } from '@/services/organisationService';
import { Organisation } from '@/types/models';

interface OrganisationResponse {
  _id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function POST(request: NextRequest) {
  try {
    const data: Partial<Organisation> = await request.json();
    const organisation = await createOrganisation(data);
    const response: OrganisationResponse = {
      _id: organisation._id.toString(),
      name: organisation.name,
      description: organisation.description,
      createdAt: new Date(organisation.createdAt),
      updatedAt: new Date(organisation.updatedAt)
    };
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 400 }
    );
  }
}

export async function GET() {
  try {
    const organisations = await getAllOrganisations();
    return NextResponse.json(organisations);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Organisation ID is required' }, { status: 400 });
    }
    const organisation = await updateOrganisation(data.id, data);
    if (!organisation) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }
    return NextResponse.json(organisation);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Organisation ID is required' }, { status: 400 });
    }
    await deleteOrganisation(data.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'An unknown error occurred' },
      { status: 500 }
    );
  }
} 