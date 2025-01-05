import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { connectToDatabase } from "@/libs/mongo";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-08-16'
});

interface StripeUser {
  customerId?: string;
  email?: string;
}

async function getUserFromDb() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) return null;

  const db = await connectToDatabase();
  const collection = db.connection.collection('users');
  return collection.findOne({ email: session.user.email });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const user = await getUserFromDb();

    const stripeUser: StripeUser | undefined = user ? {
      email: user.email,
      // Only include customerId if it exists in your user model
      ...(user.stripeCustomerId && { customerId: user.stripeCustomerId })
    } : undefined;

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/canceled`,
      mode: 'payment',
      billing_address_collection: 'required',
      line_items: body.items,
      metadata: body.metadata,
      client_reference_id: user?._id?.toString(),
      ...(stripeUser && { customer: stripeUser.customerId }),
      customer_email: stripeUser?.email,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
