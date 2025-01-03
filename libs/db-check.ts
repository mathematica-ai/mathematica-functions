import mongoose from 'mongoose';

export async function checkMongoConnection() {
  try {
    const collections = await mongoose.connection.db.collections();
    console.log('Available collections:', collections.map(c => c.collectionName));
    
    // Check users collection
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log('Users:', users);
    
    // Check accounts collection
    const accounts = await mongoose.connection.db.collection('accounts').find({}).toArray();
    console.log('Accounts:', accounts);
    
    return { success: true };
  } catch (error) {
    console.error('Database check failed:', error);
    return { success: false, error };
  }
} 