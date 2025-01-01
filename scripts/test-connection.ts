import connectToDatabase from '../libs/mongo';

async function testConnection() {
  try {
    const connection = await connectToDatabase();
    console.log('Successfully connected to DocumentDB!');
    process.exit(0);
  } catch (error) {
    console.error('Connection failed:', error);
    process.exit(1);
  }
}

testConnection(); 