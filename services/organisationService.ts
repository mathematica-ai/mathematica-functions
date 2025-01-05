import { Organisation } from '@/types/models';

export async function getAllOrganisations(): Promise<Organisation[]> {
  const response = await fetch('/api/admin/organisations');
  if (!response.ok) {
    throw new Error('Failed to fetch organisations');
  }
  return response.json();
}

export async function createOrganisation(data: Partial<Organisation>): Promise<Organisation> {
  const response = await fetch('/api/admin/organisations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to create organisation');
  }
  return response.json();
}

export async function getOrganisationById(id: string): Promise<Organisation> {
  const response = await fetch(`/api/admin/organisations/${id}`);
  if (!response.ok) {
    throw new Error('Failed to fetch organisation');
  }
  return response.json();
}

export async function updateOrganisation(id: string, data: Partial<Organisation>): Promise<Organisation> {
  const response = await fetch(`/api/admin/organisations/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update organisation');
  }
  return response.json();
}

export async function deleteOrganisation(id: string): Promise<void> {
  const response = await fetch(`/api/admin/organisations/${id}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error('Failed to delete organisation');
  }
} 