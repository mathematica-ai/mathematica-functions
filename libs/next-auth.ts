import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoClient, ObjectId } from "mongodb";
import { Resend } from "resend";
import { renderAsync } from "@react-email/components";
import MagicLinkTemplate from "@/emails/MagicLinkTemplate";

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

if (!process.env.RESEND_API_KEY) {
  throw new Error("Missing RESEND_API_KEY environment variable");
}

if (!process.env.MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error("Missing NEXTAUTH_SECRET environment variable");
}

const resend = new Resend(process.env.RESEND_API_KEY);

// Create MongoDB client
const client = new MongoClient(process.env.MONGODB_URI);
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

export const authOptions: NextAuthOptions = {
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
    }),
    EmailProvider({
      from: "Mathematica <onboarding@resend.dev>",
      sendVerificationRequest: async ({ identifier: email, url }) => {
        try {
          // Decode the URL to prevent triple encoding
          const decodedUrl = decodeURIComponent(decodeURIComponent(url));
          
          const html = await renderAsync(MagicLinkTemplate({
            url: decodedUrl,
            host: "Mathematica Functions"
          }));
          
          await resend.emails.send({
            from: "Mathematica <onboarding@resend.dev>",
            to: email,
            subject: "Sign in to Mathematica Functions",
            html,
            text: `Sign in to Mathematica Functions\n\nClick this link to sign in: ${decodedUrl}\n\nIf you didn't request this email, you can safely ignore it.\n\nThis link will expire in 24 hours and can only be used once.`,
          });
        } catch (error) {
          console.error('Error in sendVerificationRequest');
          throw new Error("Failed to send verification email");
        }
      },
    }),
  ],
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
    verifyRequest: "/auth/verify",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        try {
          const mongoClient = await clientPromise;
          const db = mongoClient.db();
          
          await db.collection("users").updateOne(
            { email: user.email },
            {
              $set: {
                name: profile?.name,
                image: profile?.image,
                emailVerified: new Date(),
                updatedAt: new Date(),
              },
            },
            { upsert: true }
          );
        } catch (error) {
          console.error("Error updating user data:", error);
        }
      }
      return true;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub as string;
        
        // Fetch user's role from database
        try {
          const mongoClient = await clientPromise;
          const db = mongoClient.db();
          
          const user = await db.collection("users").findOne(
            { email: session.user.email },
            { projection: { role: 1 } }
          );
          
          if (user?.role) {
            session.user.role = user.role;
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Handle callback URLs
      if (url.startsWith('/api/auth/callback')) {
        return `${baseUrl}/functions`;
      }

      // Handle relative URLs
      if (url.startsWith('/')) {
        return `${baseUrl}${url}`;
      }

      // Handle absolute URLs from the same origin
      if (url.startsWith(baseUrl)) {
        return url;
      }

      // Default to the functions page
      return `${baseUrl}/functions`;
    },
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  debug: process.env.NODE_ENV === "development",
};

