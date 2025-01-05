import { NextRequest, NextResponse } from 'next/server';
import { createClient, getClientById, updateClient, deleteClient } from '@/services/clientService';

interface ClientResponse {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  createdAt: Date;
  updatedAt: Date;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    const client = await getClientById(id);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    const response: ClientResponse = {
      _id: client._id.toString(),
      name: client.name,
      email: client.email,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch client' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.name || !data.email || !data.organisationId) {
      return NextResponse.json(
        { error: 'Name, email, and organisationId are required' },
        { status: 400 }
      );
    }
    const clientData = {
      name: data.name,
      email: data.email,
      organisationId: data.organisationId
    };
    const client = await createClient(clientData);
    return NextResponse.json(client, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create client' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    const client = await updateClient(data.id, data);
    if (!client) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(client);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update client' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }
    await deleteClient(data.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete client' },
      { status: 500 }
    );
  }
} 