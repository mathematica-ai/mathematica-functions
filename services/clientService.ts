import Client from '../models/Client';

export const createClient = async (clientData) => {
  const client = new Client(clientData);
  return await client.save();
};

export const getClientById = async (id) => {
  return await Client.findById(id);
};

export const updateClient = async (id, updateData) => {
  return await Client.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteClient = async (id) => {
  return await Client.findByIdAndDelete(id);
}; 