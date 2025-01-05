import Client from '../models/Client';
import { Types } from 'mongoose';

interface ClientData {
  name: string;
  email: string;
  organisationId: string;
}

type ClientUpdateData = Partial<ClientData>;

export const createClient = async (clientData: ClientData) => {
  const client = new Client(clientData);
  return await client.save();
};

export const getClientById = async (id: string | Types.ObjectId) => {
  return await Client.findById(id);
};

export const updateClient = async (id: string | Types.ObjectId, updateData: ClientUpdateData) => {
  return await Client.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteClient = async (id: string | Types.ObjectId) => {
  return await Client.findByIdAndDelete(id);
}; 