import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { OrderReceipt } from '@/components/emails/OrderReceipt';
import { createClient } from '@supabase/supabase-js';

const resend = new Resend(process.env.RESEND_API_KEY || 're_placeholder');

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, firstName, lastName, address, city, state, zip, phone, snapchat, transactionId, items } = data;

    const shipping_address = {
      fullName: `${firstName} ${lastName}`,
      addressLine1: address,
      city,
      state,
      postalCode: zip,
      country: "US" // Can be dynamically passed if needed
    };

    const hydratedItems = items.map((item: any) => ({
      id: item.id || item.slug || Math.random().toString(),
      title: item.name || `Item ${item.id}`,
      price: typeof item.price === 'string' ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) : (Number(item.price) || 0),
      quantity: item.quantity || 1,
      image: item.image || null
    }));

    const totalAmount = hydratedItems.reduce((acc: number, item: any) => acc + (item.price * item.quantity), 0);

    const orderId = "FL-M" + Math.random().toString(36).substring(2, 8).toUpperCase();

    // 1. Create Order in Supabase
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: orderId,
        total_amount: totalAmount,
        status: 'pending', // Manual orders start as pending verification
        payment_method: 'manual',
        payment_status: 'pending', // Waiting for transaction ID/crypto confirmation
        email: email,
        shipping_address: shipping_address,
        whatsapp_number: phone || null,
        items: items, 
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating manual order:", orderError);
    } else if (newOrder) {
      // Trigger realtime broadcast to CMS Admin
      await supabaseAdmin.channel('admin-notifications').send({
        type: 'broadcast',
        event: 'new-order',
        payload: newOrder,
      });
    }

    // 2. Send Email Receipt via Resend
    if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_placeholder') {
      try {
        await resend.emails.send({
          from: 'Flenjure <orders@flenjure.com>',
          to: [email],
          subject: `Order Received (Pending Verification) #${orderId}`,
          react: OrderReceipt({
            orderId: orderId,
            customerName: shipping_address.fullName,
            totalAmount: totalAmount,
            items: hydratedItems,
            shippingAddress: shipping_address
          }),
        });

        await resend.emails.send({
          from: 'Flenjure System <system@flenjure.com>',
          to: ['orders@flenjure.com'],
          subject: `[NEW CAFE ORDER] Flenjure #${orderId}`,
          react: OrderReceipt({
            orderId: orderId,
            customerName: shipping_address.fullName,
            totalAmount: totalAmount,
            items: hydratedItems,
            shippingAddress: shipping_address
          }),
        });
      } catch (emailError) {
        console.error("Failed to send manual order email:", emailError);
      }
    }

    return NextResponse.json({ success: true, message: "Manual payment order received", orderId });
  } catch (error: any) {
    console.error("Manual checkout error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
