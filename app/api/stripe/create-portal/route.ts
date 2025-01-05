import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { connectToDatabase } from "@/libs/mongo";
import { ObjectId } from 'mongodb';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

interface UserDocument {
  _id: ObjectId;
  email: string;
  name: string;
  stripeCustomerId?: string;
}

async function getUserFromDb(id: string): Promise<UserDocument | null> {
  const db = await connectToDatabase();
  const collection = db.connection.collection('users');
  return collection.findOne({ _id: new ObjectId(id) }) as Promise<UserDocument | null>;
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const user = await getUserFromDb(session.user.id);
    if (!user?.stripeCustomerId) {
      return NextResponse.json(
        {
          error: "No Stripe customer ID found. Please complete a purchase first."
        },
        { status: 400 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
