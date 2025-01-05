import { config } from 'dotenv';
config({ path: '.env.local' });

console.log("MONGODB_URI:", process.env.MONGODB_URI);

import { MongoClient, ObjectId } from "mongodb";
import { hash } from "bcryptjs";

async function initializeDb() {
  const uri = process.env.MONGODB_URI!;
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const db = client.db();
    const usersCollection = db.collection("users");

    // Check if the user already exists
    const existingUser = await usersCollection.findOne({ 
      email: "bruno@mathematica.ai" 
    });

    let userId: ObjectId;

    if (!existingUser) {
      // Create initial user
      const result = await usersCollection.insertOne({
        name: "Bruno Antunes Luis",
        email: "bruno@mathematica.ai",
        emailVerified: new Date(),
        image: "https://lh3.googleusercontent.com/a/ACg8ocI-YF9EkNemlXmXj_8dvho20RkytASEreaaXjtPpRGV2v6CqQ=s96-c",
        role: "super-admin",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      userId = result.insertedId;
      console.log("Initial user created:", result.insertedId);
    } else {
      userId = existingUser._id;
      console.log("User already exists");
    }

    // Create default organization if it doesn't exist
    const organisationsCollection = db.collection("organisations");
    const existingOrg = await organisationsCollection.findOne({
      name: "Mathematica"
    });

    let orgId: ObjectId;

    if (!existingOrg) {
      const result = await organisationsCollection.insertOne({
        name: "Mathematica",
        slug: "mathematica",
        description: "Default organization",
        createdAt: new Date(),
        updatedAt: new Date(),
        createdBy: userId
      });

      orgId = result.insertedId;
      console.log("Default organization created:", result.insertedId);
    } else {
      orgId = existingOrg._id;
      console.log("Organization already exists");
    }

    // Add user as organization member if not already
    const membersCollection = db.collection("organisation_members");
    const existingMember = await membersCollection.findOne({
      organisationId: orgId,
      userId: userId
    });

    if (!existingMember) {
      const result = await membersCollection.insertOne({
        organisationId: orgId,
        userId: userId,
        email: "bruno@mathematica.ai",
        role: "owner",
        status: "active",
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log("Organization member created:", result.insertedId);
    } else {
      console.log("Member already exists");
    }

    // Create indexes
    await usersCollection.createIndex({ email: 1 }, { unique: true });
    await organisationsCollection.createIndex({ slug: 1 }, { unique: true });
    await membersCollection.createIndex({ organisationId: 1, userId: 1 }, { unique: true });
    
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