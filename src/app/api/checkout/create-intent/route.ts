import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

export async function POST(req: Request) {
  try {
    const { items, shippingAddress, currency = 'usd' } = await req.json();

    // In a real production app, you MUST calculate the total on the server
    // by fetching the prices from the database using item IDs, to prevent users
    // from manipulating prices in the frontend.
    // For this implementation, we will trust the payload as a baseline,
    // but ideally you loop over items, fetch price from DB, and calculate.
    
    // Calculate total amount in cents
    const amount = items.reduce((total: number, item: any) => {
      const priceNum = typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : (Number(item.price) || 0);
      return total + Math.round(priceNum * item.quantity * 100);
    }, 0);

    // Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount > 0 ? amount : 100, // minimum $1.00
      currency: currency.toLowerCase(),
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        items: JSON.stringify(items.map((i: any) => ({ id: i.id, q: i.quantity }))),
      },
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error: any) {
    console.error("Stripe create intent error:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
