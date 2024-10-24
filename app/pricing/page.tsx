"use client";

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { loadStripe } from '@stripe/stripe-js';
import { useState } from 'react';

const plans = [
  { id: 'basic', name: '100 Credits', credits: 100, price: 10 },
  { id: 'pro', name: '500 Credits', credits: 500, price: 40 },
  { id: 'enterprise', name: '2000 Credits', credits: 2000, price: 140 },
];

export default function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    try {
      setLoading(planId);
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      const { sessionId } = await response.json();
      const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold text-center mb-12">Choose Your Plan</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <Card key={plan.id} className="p-6 flex flex-col">
              <h2 className="text-2xl font-bold mb-4">{plan.name}</h2>
              <p className="text-4xl font-bold mb-6">${plan.price}</p>
              <ul className="mb-8 flex-grow">
                <li className="mb-2">✓ {plan.credits} AI Research Credits</li>
                <li className="mb-2">✓ Academic Citations</li>
                <li className="mb-2">✓ 24/7 Availability</li>
              </ul>
              <Button
                onClick={() => handlePurchase(plan.id)}
                disabled={loading === plan.id}
                className="w-full"
              >
                {loading === plan.id ? 'Processing...' : 'Purchase'}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}