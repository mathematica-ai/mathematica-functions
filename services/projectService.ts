import Project from '../models/Project';

export const createProject = async (projectData) => {
  const project = new Project(projectData);
  return await project.save();
};

export const getProjectById = async (id) => {
  return await Project.findById(id);
};

export const updateProject = async (id, updateData) => {
  return await Project.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteProject = async (id) => {
  return await Project.findByIdAndDelete(id);
}; 