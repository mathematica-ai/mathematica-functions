import Organisation from '../models/Organisation';

export const createOrganisation = async (organisationData) => {
  const organisation = new Organisation(organisationData);
  return await organisation.save();
};

export const getOrganisationById = async (id) => {
  return await Organisation.findById(id);
};

export const updateOrganisation = async (id, updateData) => {
  return await Organisation.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteOrganisation = async (id) => {
  return await Organisation.findByIdAndDelete(id);
}; 