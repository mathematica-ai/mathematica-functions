import { MongoClient } from "mongodb";
import { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: string;
    }
  }
}

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

if (!process.env.GOOGLE_ID || !process.env.GOOGLE_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

const client = new MongoClient(process.env.MONGODB_URI);

// Create MongoDB client promise for the adapter
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  clientPromise = client.connect();
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        let dbClient: MongoClient | null = null;
        try {
          dbClient = await clientPromise;
          const db = dbClient.db();
          
          // First check if user exists
          const dbUser = await db.collection("users").findOne({ 
            email: user.email 
          });
          
          if (!dbUser) {
            // Create new user with default role
            const result = await db.collection("users").insertOne({
              name: user.name,
              email: user.email,
              image: user.image,
              role: "user",
              emailVerified: new Date(),
              createdAt: new Date(),
              updatedAt: new Date(),
            });
            
            token.id = result.insertedId.toString();
            token.role = "user";
          } else {
            // Use existing user data
            token.id = dbUser._id.toString();
            token.role = dbUser.role || "user";
            
            // Update last login time
            await db.collection("users").updateOne(
              { _id: dbUser._id },
              { 
                $set: { 
                  lastLogin: new Date(),
                  updatedAt: new Date()
                }
              }
            );
          }
        } catch (error) {
          console.error("Error in jwt callback:", error);
          throw new Error("Failed to process authentication");
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

// Export clientPromise for use in other files
export { clientPromise };

