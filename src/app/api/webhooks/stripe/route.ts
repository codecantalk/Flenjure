import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { Resend } from 'resend';
import { OrderReceipt } from '@/components/emails/OrderReceipt';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || 'whsec_placeholder'
    );
  } catch (err: any) {
    console.error("Webhook signature verification failed.", err.message);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    
    // Retrieve the customer details from Stripe (if you passed them during confirmPayment)
    // Or from metadata
    let items = [];
    try {
      items = paymentIntent.metadata.items ? JSON.parse(paymentIntent.metadata.items) : [];
    } catch (e) {
      console.error("Failed to parse items from metadata", e);
    }

    const email = paymentIntent.receipt_email || 'customer@example.com';
    const amount = paymentIntent.amount / 100;
    const shipping = paymentIntent.shipping;
    const shipping_address = shipping ? {
      fullName: shipping.name,
      addressLine1: shipping.address?.line1,
      city: shipping.address?.city,
      state: shipping.address?.state,
      postalCode: shipping.address?.postal_code,
      country: shipping.address?.country
    } : null;
    
    // 1. Inventory Sync
    // Best practice is to use a PostgreSQL RPC for atomic decrement.
    // For this implementation, we read and update using the admin client.
    for (const item of items) {
      if (!item.id) continue;
      
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('inventory_count')
        .eq('id', item.id)
        .single();
        
      if (product && product.inventory_count !== null) {
        const newCount = Math.max(0, product.inventory_count - item.q);
        await supabaseAdmin
          .from('products')
          .update({ inventory_count: newCount })
          .eq('id', item.id);
      }
    }

    // 2. Create Order in Supabase
    const orderId = "FL-" + Math.random().toString(36).substring(2, 8).toUpperCase();
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: orderId,
        total_amount: amount,
        status: 'paid',
        payment_method: 'stripe',
        payment_status: 'completed',
        email: email,
        shipping_address: shipping_address,
        whatsapp_number: shipping?.phone || null,
        items: items, // Note: Metadata might just have IDs and Qty. We should store full details if passed.
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating order:", orderError);
    }

    // 3. Send Email Receipt via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      try {
        await resend.emails.send({
          from: 'Flenjure <orders@flenjure.com>', // Requires verified domain in Resend
          to: [email],
          subject: `Order Confirmation #${newOrder?.id?.substring(0,8).toUpperCase() || '123'}`,
          react: OrderReceipt({
            orderId: newOrder?.id?.substring(0,8).toUpperCase() || '123',
            customerName: "Customer", // Normally extracted from shipping details
            totalAmount: amount,
            items: items.map((i: any) => ({ title: `Item ${i.id}`, quantity: i.q, price: 0 })) // Hydrate from DB in production
          }),
        });
      } catch (emailError) {
        console.error("Failed to send email:", emailError);
      }
    }
  }

  return NextResponse.json({ received: true });
}
