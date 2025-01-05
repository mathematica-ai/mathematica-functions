import { NextRequest, NextResponse } from "next/server";
import { createProject, getProjectById, updateProject, deleteProject } from '@/services/projectService';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.title || !data.organisationId) {
      return NextResponse.json(
        { error: 'Title and organisationId are required' },
        { status: 400 }
      );
    }
    const projectData = {
      title: data.title,
      description: data.description,
      organisationId: data.organisationId
    };
    const project = await createProject(projectData);
    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const project = await getProjectById(id);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    
    return NextResponse.json(project);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    const body = await request.json();
    const project = await updateProject(id, body);
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    
    return NextResponse.json(project);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    
    await deleteProject(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message.includes('not found')) {
      return NextResponse.json({ error: 'Project not found' }, { status: 404 });
    }
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
} 