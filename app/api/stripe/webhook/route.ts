import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-12-15.clover',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    let event: Stripe.Event;

    if (webhookSecret && signature) {
      try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      } catch (err) {
        console.error('Webhook signature verification failed');
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
      }
    } else {
      // For development without webhook secret
      event = JSON.parse(body);
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata?.userId;
        const subscriptionId = session.subscription as string;
        const customerId = session.customer as string; // ← ADICIONE ISSO

        if (userId && subscriptionId) {
          const stripeSubscription = await stripe.subscriptions.retrieve(subscriptionId);
          const subData = stripeSubscription as any;

          await prisma.subscription.update({
            where: { userId },
            data: {
              status: 'ACTIVE',
              stripeCustomerId: customerId, // ← ADICIONE ISSO
              stripeSubscriptionId: subscriptionId,
              stripePriceId: stripeSubscription.items?.data?.[0]?.price?.id,
              currentPeriodStart: subData?.current_period_start ? new Date(subData.current_period_start * 1000) : null,
              currentPeriodEnd: subData?.current_period_end ? new Date(subData.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }


      case 'customer.subscription.updated': {
        const subscription = event.data.object as any;
        const customerId = subscription?.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          let status: 'ACTIVE' | 'CANCELED' | 'PAST_DUE' | 'FREEMIUM' = 'ACTIVE';

          if (subscription?.status === 'canceled' || subscription?.status === 'unpaid') {
            status = 'CANCELED';
          } else if (subscription?.status === 'past_due') {
            status = 'PAST_DUE';
          } else if (subscription?.status === 'active') {
            status = 'ACTIVE';
          }

          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status,
              currentPeriodStart: subscription?.current_period_start ? new Date(subscription.current_period_start * 1000) : null,
              currentPeriodEnd: subscription?.current_period_end ? new Date(subscription.current_period_end * 1000) : null,
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as any;
        const customerId = subscription?.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: {
              status: 'FREEMIUM',
              stripeSubscriptionId: null,
              stripePriceId: null,
              currentPeriodStart: null,
              currentPeriodEnd: null,
            },
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice?.customer as string;

        const sub = await prisma.subscription.findFirst({
          where: { stripeCustomerId: customerId },
        });

        if (sub) {
          await prisma.subscription.update({
            where: { id: sub.id },
            data: { status: 'PAST_DUE' },
          });
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
