// app/api/stripe/checkout/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
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

    // ✅ Parse do body com tratamento de erro
    let body;
    try {
      body = await request.json();
    } catch {
      body = {}; // Se não vier JSON, assume plano mensal
    }

    const { plan = 'monthly' } = body;

    // ✅ Mapear planos para Price IDs
    const priceIds: Record<string, string> = {
      monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
      semiannual: process.env.STRIPE_PRICE_ID_SEMIANNUAL || '',
      annual: process.env.STRIPE_PRICE_ID_ANNUAL || '',
    };

    const priceId = priceIds[plan] || priceIds.monthly;

    // ✅ Validar se o Price ID existe
    if (!priceId) {
      console.error('Price ID não configurado para plano:', plan);
      return NextResponse.json(
        { error: 'Plano não configurado. Entre em contato com o suporte.' },
        { status: 400 }
      );
    }

    // ✅ Buscar ou criar customer no Stripe
    let customerId: string | undefined;
    
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSubscription?.stripeCustomerId) {
      customerId = existingSubscription.stripeCustomerId;
    }

    // ✅ URL de sucesso e cancelamento
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // ✅ Criar sessão de checkout
    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId, // Usar customer existente se houver
      customer_email: !customerId ? session.user.email! : undefined, // Só se não tiver customer
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${baseUrl}/app/assinatura?success=true`,
      cancel_url: `${baseUrl}/app/assinatura?canceled=true`,
      metadata: {
        userId: session.user.id,
      },
      subscription_data: {
        metadata: {
          userId: session.user.id,
        },
      },
    });

    // ✅ Atualizar ou criar subscription no banco
    await prisma.subscription.upsert({
      where: { userId: session.user.id },
      create: {
        userId: session.user.id,
        status: 'FREEMIUM',
        stripeCustomerId: checkoutSession.customer as string,
      },
      update: {
        stripeCustomerId: checkoutSession.customer as string,
      },
    });

    console.log('Checkout session criada:', checkoutSession.id);
    return NextResponse.json({ url: checkoutSession.url });

  } catch (error: any) {
    console.error('Stripe checkout error completo:', error);
    return NextResponse.json(
      { error: error?.message || 'Erro ao criar checkout' },
      { status: 500 }
    );
  }
}