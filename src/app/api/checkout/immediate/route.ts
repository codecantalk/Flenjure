import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
  apiVersion: '2026-05-27.dahlia',
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder"
);

export async function POST(req: Request) {
  try {
    const { productId, size, color, quantity = 1, currency = 'USD' } = await req.json();

    if (!productId) {
      return NextResponse.json({ error: 'Missing productId' }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    
    // Fetch product to verify price
    const { data: product } = await supabaseAdmin
      .from('products')
      .select('id, title, price')
      .eq(isUUID ? 'id' : 'slug', productId)
      .single();

    let productData = product;

    if (!productData) {
      // Fallback check cafe items
      const { data: cafeItem } = await supabaseAdmin
        .from('cafe_items')
        .select('id, name, price')
        .eq('id', productId)
        .single();
      
      if (cafeItem) {
        productData = {
          id: cafeItem.id,
          title: cafeItem.name,
          price: cafeItem.price
        } as any;
      }
    }

    if (!productData) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Safely parse price
    const priceNum = typeof productData.price === 'string' ? parseFloat(productData.price.replace(/[^0-9.-]+/g, "")) : (Number(productData.price) || 0);
    const amountInCents = Math.round(priceNum * quantity * 100);

    if (amountInCents < 50) {
      return NextResponse.json({ error: 'Amount too small for processing' }, { status: 400 });
    }

    const itemsMetadata = [{
      id: productData.id,
      q: quantity,
      size: size || undefined,
      color: color || undefined
    }];

    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: {
        items: JSON.stringify(itemsMetadata)
      }
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error: any) {
    console.error('Error creating immediate payment intent:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
