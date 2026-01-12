import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AssinaturaClient } from './assinatura-client';

export const dynamic = 'force-dynamic';

export default async function AssinaturaPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  return (
    <AssinaturaClient
      subscription={{
        status: subscription?.status || 'FREEMIUM',
        currentPeriodEnd: subscription?.currentPeriodEnd?.toISOString() || null,
        stripeCustomerId: subscription?.stripeCustomerId || null,
      }}
    />
  );
}
