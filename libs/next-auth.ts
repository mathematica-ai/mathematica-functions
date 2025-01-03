import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { clientPromise } from "./mongoose";

// Add type for Google OAuth profile
interface GoogleProfile {
  email_verified: boolean;
  email: string;
  name: string;
  picture: string;
  sub: string;
}

// Extend the Session type
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    }
  }
}

export const authOptions: NextAuthOptions = {
  debug: true,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID!,
      clientSecret: process.env.GOOGLE_SECRET!,
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
        }
      }
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production'
      }
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      try {
        console.log("Sign-in attempt:", { user, account, profile });
        
        if (!user.email) {
          console.log("No email provided");
          return false;
        }

        // Get MongoDB client
        const client = await clientPromise;
        const db = client.db();

        // Find user by email only
        const existingUser = await db.collection('users').findOne({ 
          email: user.email 
        });

        console.log("Existing user:", existingUser);

        if (existingUser) {
          // Update the user with latest provider details
          const updateResult = await db.collection('users').updateOne(
            { email: user.email },
            {
              $set: {
                provider: account?.provider,
                providerAccountId: account?.providerAccountId,
                name: user.name,
                image: user.image,
                email: user.email,
                emailVerified: new Date(),
                updatedAt: new Date()
              }
            }
          );
          console.log("Update result:", updateResult);

          // Create account link if it doesn't exist
          const existingAccount = await db.collection('accounts').findOne({
            userId: existingUser._id,
            provider: account?.provider
          });

          if (!existingAccount && account) {
            await db.collection('accounts').insertOne({
              userId: existingUser._id,
              type: account.type,
              provider: account.provider,
              providerAccountId: account.providerAccountId,
              access_token: account.access_token,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token,
              createdAt: new Date(),
              updatedAt: new Date()
            });
            console.log("Account linked successfully");
          }

          return true;
        }

        console.log("User not found in database");
        return false;
      } catch (error) {
        console.error("Sign in callback error:", error);
        return false;
      }
    },
    async redirect({ url, baseUrl }) {
      try {
        console.log("Redirect callback:", { url, baseUrl });
        
        // Always redirect to /functions after successful sign in
        if (url.includes('auth/signin')) {
          return `${baseUrl}/functions`;
        }
        
        // Default redirects
        if (url.startsWith("/")) return `${baseUrl}${url}`;
        if (new URL(url).origin === baseUrl) return url;
        return baseUrl;
      } catch (error) {
        console.error("Redirect callback error:", error);
        return baseUrl;
      }
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.sub;
        
        // Get the latest user data from the database
        const client = await clientPromise;
        const db = client.db();
        const user = await db.collection('users').findOne({ email: session.user.email });
        
        if (user) {
          session.user.name = user.name;
          session.user.image = user.image;
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin',
    signOut: '/',
    error: '/auth/error',
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export default authOptions;
