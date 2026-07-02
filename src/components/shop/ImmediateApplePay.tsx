"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Elements, ExpressCheckoutElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder"
);

function ApplePayButton({ productId, selectedSize }: { productId: string, selectedSize: string | null }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState("");

  const handleConfirm = async (event: any) => {
    if (!stripe || !elements) return;

    try {
      // 1. Fetch PaymentIntent client secret from server
      const res = await fetch("/api/checkout/immediate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          size: selectedSize,
          quantity: 1,
          currency: "USD"
        }),
      });

      const data = await res.json();

      if (data.error) {
        setErrorMessage(data.error);
        return;
      }

      // 2. Confirm the payment with Stripe
      const { error } = await stripe.confirmPayment({
        elements,
        clientSecret: data.clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/checkout/success`,
        },
      });

      if (error) {
        setErrorMessage(error.message || "An error occurred");
      }
    } catch (err: any) {
      setErrorMessage(err.message);
    }
  };

  return (
    <div className="w-full">
      <ExpressCheckoutElement 
        onConfirm={handleConfirm}
        options={{
          shippingAddressRequired: true,
          shippingRates: [
            {
              id: 'free-shipping',
              displayName: 'Free Worldwide Shipping',
              deliveryEstimate: {
                maximum: { unit: 'business_day', value: 7 },
                minimum: { unit: 'business_day', value: 3 },
              },
              amount: 0
            }
          ]
        }}
      />
      {errorMessage && (
        <div className="text-red-500 text-xs mt-2">{errorMessage}</div>
      )}
    </div>
  );
}

export default function ImmediateApplePay({ 
  productId, 
  price, 
  selectedSize,
  requireSize 
}: { 
  productId: string, 
  price: string | number, 
  selectedSize: string | null,
  requireSize: boolean 
}) {
  const priceNum = typeof price === 'string' ? parseFloat(price.replace(/[^0-9.-]+/g, "")) : (Number(price) || 0);
  const amountInCents = Math.round(priceNum * 100);

  // If size is required but not selected, we wrap a standard button that alerts them
  if (requireSize && !selectedSize) {
    return (
      <button 
        onClick={() => alert("Please select a size first to use Apple Pay.")}
        className="flex-1 bg-[#121212] dark:bg-white text-white dark:text-[#121212] py-[14px] text-[11px] font-medium tracking-[0.05em] uppercase hover:opacity-80 transition-all w-full h-[43px]"
      >
        Apple Pay
      </button>
    );
  }

  if (amountInCents < 50) return null; // Stripe minimum

  return (
    <div className="flex-1 h-[43px]">
      <Elements stripe={stripePromise} options={{ mode: 'payment', amount: amountInCents, currency: 'usd' }}>
        <ApplePayButton 
          productId={productId} 
          selectedSize={selectedSize || "OS"} 
        />
      </Elements>
    </div>
  );
}
