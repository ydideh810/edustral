import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const PLANS = {
  basic: { credits: 100, price: 1000 },
  pro: { credits: 500, price: 4000 },
  enterprise: { credits: 2000, price: 14000 },
};

export async function POST(req: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { planId } = await req.json();
    const plan = PLANS[planId as keyof typeof PLANS];

    if (!plan) {
      return new NextResponse('Invalid plan', { status: 400 });
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${plan.credits} Research AI Credits`,
              description: 'Credits for using the Research AI assistant',
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/pricing?canceled=true`,
      metadata: {
        userId: session.user.id,
        credits: plan.credits,
      },
    });

    return NextResponse.json({ sessionId: checkoutSession.id });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}