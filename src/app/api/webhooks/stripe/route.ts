import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { OrderReceipt } from '@/components/emails/OrderReceipt';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

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
      addressLine2: shipping.address?.line2,
      city: shipping.address?.city,
      state: shipping.address?.state,
      postalCode: shipping.address?.postal_code,
      country: shipping.address?.country
    } : null;
    
    // 1. Inventory Sync and Data Hydration
    const hydratedItems = [];
    for (const item of items) {
      if (!item.id) continue;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('title, price, image_urls, inventory_count')
        .eq(isUUID ? 'id' : 'slug', item.id)
        .single();
        
      if (product) {
        hydratedItems.push({
          id: item.id,
          title: product.title || `Item ${item.id}`,
          price: product.price || 0,
          quantity: item.q,
          image: product.image_urls?.[0] || null
        });

        if (product.inventory_count !== null) {
          const newCount = Math.max(0, product.inventory_count - item.q);
          await supabaseAdmin
            .from('products')
            .update({ inventory_count: newCount })
            .eq('id', item.id);
        }
      } else {
        hydratedItems.push({
          id: item.id,
          title: `Item ${item.id}`,
          price: 0,
          quantity: item.q,
          image: null
        });
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
    } else if (newOrder) {
      // Trigger realtime broadcast to CMS Admin
      await supabaseAdmin.channel('admin-notifications').send({
        type: 'broadcast',
        event: 'new-order',
        payload: newOrder,
      });
    }

    // 3. Send Email Receipt via Zoho Nodemailer
    try {
      // 3a. Send to Customer
      await sendEmail({
        to: email,
        subject: `Order Confirmation #${orderId}`,
        react: OrderReceipt({
          orderId: orderId,
          customerName: shipping_address?.fullName || "Customer",
          totalAmount: amount,
          items: hydratedItems,
          shippingAddress: shipping_address
        }) as any,
      });

      // 3b. Send separate copy to Admin
      await sendEmail({
        to: 'orders@flenjure.com',
        subject: `[NEW ORDER] Flenjure #${orderId}`,
        isInternalAdminAlert: true,
        react: OrderReceipt({
          orderId: orderId,
          customerName: shipping_address?.fullName || "Customer",
          totalAmount: amount,
          items: hydratedItems,
          shippingAddress: shipping_address
        }) as any,
      });
    } catch (emailError) {
      console.error("Failed to send email via Zoho:", emailError);
    }
  }

  return NextResponse.json({ received: true });
}
