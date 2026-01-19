import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { plan } = await request.json();

    // Mapear o plano para o Price ID correto
    const priceIds: Record<string, string> = {
      monthly: process.env.STRIPE_PRICE_ID_MONTHLY!,
      semiannual: process.env.STRIPE_PRICE_ID_SEMIANNUAL!,
      annual: process.env.STRIPE_PRICE_ID_ANNUAL!,
    };

    const priceId = priceIds[plan] || priceIds.monthly;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer_email: session.user.email!,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXTAUTH_URL}/app/assinatura?success=true`,
      cancel_url: `${process.env.NEXTAUTH_URL}/app/assinatura?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}