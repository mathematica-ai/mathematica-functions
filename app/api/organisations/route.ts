import { NextResponse } from "next/server";
import { createOrganisation, getOrganisationById, updateOrganisation, deleteOrganisation, getAllOrganisations } from '@/services/organisationService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organisation = await createOrganisation(body);
    return NextResponse.json(organisation, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (id) {
      const organisation = await getOrganisationById(id);
      if (!organisation) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
      return NextResponse.json(organisation);
    } else {
      const organisations = await getAllOrganisations();
      return NextResponse.json(organisations);
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const body = await request.json();
    const organisation = await updateOrganisation(id, body);
    if (!organisation) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    
    return NextResponse.json(organisation);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const organisation = await deleteOrganisation(id);
    if (!organisation) return NextResponse.json({ error: 'Organisation not found' }, { status: 404 });
    
    return NextResponse.json({ message: 'Organisation deleted successfully' });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
} 