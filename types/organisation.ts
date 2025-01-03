export interface Organisation {
  id: string;
  name: string;
  address: string;
}

export type OrganisationCreate = Omit<Organisation, 'id'>;
export type OrganisationUpdate = Partial<OrganisationCreate>; 