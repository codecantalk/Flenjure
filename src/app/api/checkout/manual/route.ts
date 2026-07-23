import { NextResponse } from 'next/server';
import { OrderReceipt } from '@/components/emails/OrderReceipt';
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { email, firstName, lastName, address, city, state, zip, phone, snapchat, transactionId, items, paymentMethod, country } = data;

    const shipping_address = {
      fullName: `${firstName} ${lastName}`,
      addressLine1: address,
      city,
      state,
      postalCode: zip,
      country: country || "US",
      whatsapp_number: phone || null,
      snapchat_handle: snapchat || null
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

    // 0. Deduct Inventory to prevent overselling while pending
    for (const item of hydratedItems) {
      if (!item.id) continue;
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.id);
      const { data: product } = await supabaseAdmin
        .from('products')
        .select('inventory_count')
        .eq(isUUID ? 'id' : 'slug', item.id)
        .single();
        
      if (product && product.inventory_count !== null) {
        const newCount = Math.max(0, product.inventory_count - item.quantity);
        await supabaseAdmin
          .from('products')
          .update({ inventory_count: newCount })
          .eq(isUUID ? 'id' : 'slug', item.id);
      }
    }

    // 1. Create Order in Supabase
    const { data: newOrder, error: orderError } = await supabaseAdmin
      .from('orders')
      .insert([{
        id: orderId,
        total_amount: totalAmount,
        status: 'pending', // Manual orders start as pending verification
        payment_method: paymentMethod || 'manual',
        payment_status: paymentMethod === 'cash' ? 'cash-on-delivery' : 'pending',
        email: email,
        shipping_address: shipping_address,
        whatsapp_number: phone || null,
        items: hydratedItems, 
      }])
      .select()
      .single();

    if (orderError) {
      console.error("Error creating manual order:", orderError);
    } else if (newOrder) {
      // Trigger realtime broadcast to CMS Admin reliably in serverless
      await new Promise((resolve) => {
        const channel = supabaseAdmin.channel('admin-notifications');
        channel.subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.send({
              type: 'broadcast',
              event: 'new-order',
              payload: newOrder,
            });
            supabaseAdmin.removeChannel(channel);
            resolve(null);
          }
        });
        setTimeout(() => resolve(null), 2000);
      });
    }

    // 2. Send Email Receipt via Zoho Nodemailer
    try {
      await sendEmail({
        to: email,
        bcc: shipping_address.country === 'FR' ? 'pariscafe@flenjure.com' : undefined,
        subject: `Order Received (Pending Verification) #${orderId}`,
        react: OrderReceipt({
          orderId: orderId,
          customerName: shipping_address.fullName,
          customerEmail: email,
          totalAmount: totalAmount,
          items: hydratedItems,
          shippingAddress: shipping_address,
          paymentMethod: paymentMethod
        }) as any,
      });

      await sendEmail({
        to: 'orders@flenjure.com',
        subject: `[NEW CAFE ORDER] Flenjure #${orderId}`,
        isInternalAdminAlert: true,
        react: OrderReceipt({
          orderId: orderId,
          customerName: shipping_address.fullName,
          customerEmail: email,
          totalAmount: totalAmount,
          items: hydratedItems,
          shippingAddress: shipping_address
        }) as any,
      });
    } catch (emailError) {
      console.error("Failed to send manual order email via Zoho:", emailError);
    }

    return NextResponse.json({ success: true, message: "Manual payment order received", orderId });
  } catch (error: any) {
    console.error("Manual checkout error:", error);
    return NextResponse.json({ error: error.message || "Failed to process manual checkout" }, { status: 500 });
  }
}
