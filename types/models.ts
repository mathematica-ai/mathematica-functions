import { ObjectId } from "mongodb";

export interface User {
  _id: ObjectId;
  email: string;
  name?: string;
  role: "super-admin" | "user";
  createdAt: Date;
  updatedAt: Date;
}

export interface Organisation {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  _id: ObjectId;
  name: string;
  slug: string;
  description?: string;
  organisationId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface Workflow {
  _id: ObjectId;
  workflow_id: string;
  name: string;
  slug: string;
  description?: string;
  status: "active" | "inactive";
  projectId: ObjectId;
  organisationId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganisationMember {
  _id: ObjectId;
  organisationId: ObjectId;
  userId: ObjectId;
  email: string;
  role: "admin" | "member";
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

export interface OrganisationInvitation {
  _id: ObjectId;
  organisationId: ObjectId;
  email: string;
  token: string;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
}

// Response types for API endpoints
export interface WorkflowResponse extends Omit<Workflow, '_id' | 'projectId' | 'organisationId'> {
  _id: string;
  projectId: string;
  organisationId: string;
}

export interface OrganisationInvitationResponse extends Omit<OrganisationInvitation, '_id' | 'organisationId'> {
  _id: string;
  organisationId: string;
}

export interface OrganisationMemberResponse extends Omit<OrganisationMember, '_id' | 'organisationId' | 'userId'> {
  _id: string;
  organisationId: string;
  userId: string;
} 