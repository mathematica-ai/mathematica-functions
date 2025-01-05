import Project from '../models/Project';
import { Types } from 'mongoose';

interface ProjectData {
  title: string;
  description?: string;
  organisationId: string;
}

type ProjectUpdateData = Partial<ProjectData>;

export const createProject = async (projectData: ProjectData) => {
  const project = new Project(projectData);
  return await project.save();
};

export const getProjectById = async (id: string | Types.ObjectId) => {
  return await Project.findById(id);
};

export const updateProject = async (id: string | Types.ObjectId, updateData: ProjectUpdateData) => {
  return await Project.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProject = async (id: string | Types.ObjectId) => {
  return await Project.findByIdAndDelete(id);
}; 