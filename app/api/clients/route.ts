import { NextApiRequest, NextApiResponse } from 'next';
import { createClient, getClientById, updateClient, deleteClient } from '@/services/clientService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // existing code...
} 