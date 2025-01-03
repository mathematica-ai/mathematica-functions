import { config } from 'dotenv';
config({ path: '.env.local' });

console.log("MONGODB_URI:", process.env.MONGODB_URI);

import { MongoClient } from "mongodb";
import { hash } from "bcryptjs";

async function initializeDb() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db("functions");
    const usersCollection = db.collection("users");

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ 
      email: "bruno@mathematica.ai" 
    });

    if (!existingUser) {
      // Create initial user
      const result = await usersCollection.insertOne({
        name: "Bruno Antunes Luis",
        email: "bruno@mathematica.ai",
        emailVerified: new Date(),
        image: "https://lh3.googleusercontent.com/a/ACg8ocI-YF9EkNemlXmXj_8dvho20RkytASEreaaXjtPpRGV2v6CqQ=s96-c",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log("Initial user created:", result.insertedId);
    } else {
      console.log("User already exists");
    }

    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    
    console.log("Database initialized successfully");
  } catch (error) {
    console.error("An error occurred while initializing the database:", error);
  } finally {
    await client.close();
    console.log("MongoDB connection closed");
  }
}

// Add this to handle runtime environment variables
if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MongoDB URI to .env.local");
}

initializeDb()
  .then(() => console.log("Done"))
  .catch(console.error); 