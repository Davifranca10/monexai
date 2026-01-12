import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const PRICE_ID = process.env.STRIPE_PRICE_ID;

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const origin = request.headers.get('origin') || 'http://localhost:3000';

    // Get or create Stripe customer
    let subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      const customer = await stripe.customers.create({
        email: user?.email || undefined,
        name: user?.name || undefined,
        metadata: { userId: session.user.id },
      });

      customerId = customer.id;

      // Update subscription record with customer ID
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: { stripeCustomerId: customerId },
      });
    }

    // Create checkout session
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: PRICE_ID ? [
        {
          price: PRICE_ID,
          quantity: 1,
        },
      ] : [
        {
          price_data: {
            currency: 'brl',
            product_data: {
              name: 'MonexAI Pro',
              description: 'Plano Pro com Chat IA, templates ilimitados e mais',
            },
            unit_amount: 2990, // R$ 29,90
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/app/assinatura?success=true`,
      cancel_url: `${origin}/app/assinatura?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Erro ao criar checkout' }, { status: 500 });
  }
}
