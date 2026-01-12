import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { LancamentosClient } from './lancamentos-client';

export const dynamic = 'force-dynamic';

export default async function LancamentosPage() {
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

  // Calculate date limits based on plan
  // Free: current month + 1 previous month (2 months total)
  // Pro: current month + 5 previous months (6 months total)
  const now = new Date();
  const monthsToLoad = isPro ? 6 : 2;
  const historyStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsToLoad - 1), 1);

  // Get transactions filtered by date based on plan
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: historyStartDate },
    },
    include: { category: true },
    orderBy: { date: 'desc' },
  });

  const categories = await prisma.category.findMany({
    where: { mode: profile?.mode || 'PERSONAL' },
    distinct: ['id'], // Ensure no duplicates
    orderBy: { name: 'asc' },
  });

  return (
    <LancamentosClient
      transactions={transactions.map((t) => ({
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
      categories={categories.map((c) => ({ id: c.id, name: c.name, type: c.type }))}
      isPro={isPro}
      mode={profile?.mode || 'PERSONAL'}
    />
  );
}
