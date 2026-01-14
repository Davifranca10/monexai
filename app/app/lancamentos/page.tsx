import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LancamentosClient } from './lancamentos-client';

export const revalidate = 30;

export default async function LancamentosPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const [profile, subscription] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
  ]);

  const isPro = subscription?.status === 'ACTIVE';
  const now = new Date();
  const monthsToLoad = isPro ? 6 : 2;
  const historyStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsToLoad - 1), 1);

  // Queries em paralelo
  const [transactions, categories] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: historyStartDate },
      },
      include: { category: true },
      orderBy: { date: 'desc' },
    }),
    prisma.category.findMany({
      where: { mode: profile?.mode || 'PERSONAL' },
      distinct: ['id'],
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <LancamentosClient
      transactions={transactions.map((t: any) => ({
        id: t.id,
        description: t.description,
        amountCents: t.amountCents,
        type: t.type,
        categoryId: t.categoryId,
        categoryName: t.category?.name || 'Outros',
        categoryType: t.category?.type || t.type,
        date: t.date.toISOString(),
        interestPercent: t.interestPercent || 0,
        installments: t.installments || 1,
      }))}
      categories={categories.map((c: any) => ({ id: c.id, name: c.name, type: c.type }))}
      isPro={isPro}
      mode={profile?.mode || 'PERSONAL'}
    />
  );
}
