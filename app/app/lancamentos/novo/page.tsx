import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NovoLancamentoClient } from './novo-lancamento-client';
import { FREEMIUM_LIMITS } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function NovoLancamentoPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const profile = await prisma.userProfile.findUnique({
    where: { userId },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro = subscription?.status === 'ACTIVE';

  // Check freemium limit
  if (!isPro) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const count = await prisma.transaction.count({
      where: {
        userId,
        createdAt: { gte: startOfMonth },
      },
    });

    if (count >= FREEMIUM_LIMITS.transactionsPerMonth) {
      redirect('/app/assinatura?limit=transactions');
    }
  }

  const categories = await prisma.category.findMany({
    where: { mode: profile?.mode || 'PERSONAL' },
  });

  const templates = await prisma.template.findMany({
    where: {
      mode: profile?.mode || 'PERSONAL',
      OR: [
        { isSystem: true },
        { userId },
      ],
    },
    include: { category: true },
  });

  return (
    <NovoLancamentoClient
      categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
      templates={templates.map((t) => ({
        id: t.id,
        name: t.name,
        type: t.type,
        categoryId: t.categoryId,
        categoryName: t.category?.name || '',
        amountCents: t.amountCents,
      }))}
      mode={profile?.mode || 'PERSONAL'}
    />
  );
}
