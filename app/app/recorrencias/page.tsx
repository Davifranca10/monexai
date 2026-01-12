import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RecorrenciasClient } from './recorrencias-client';

export const dynamic = 'force-dynamic';

export default async function RecorrenciasPage() {
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

  const rules = await prisma.recurringRule.findMany({
    where: { userId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });

  const categories = await prisma.category.findMany({
    where: { mode: profile?.mode || 'PERSONAL' },
  });

  return (
    <RecorrenciasClient
      rules={rules.map((r) => ({
        id: r.id,
        description: r.description,
        amountCents: r.amountCents,
        type: r.type,
        transactionType: r.transactionType,
        categoryId: r.categoryId,
        categoryName: r.category?.name || 'Outros',
        dayOfMonth: r.dayOfMonth,
        dayOfWeek: r.dayOfWeek,
        totalInstallments: r.totalInstallments,
        paidInstallments: r.paidInstallments,
        isActive: r.isActive,
        startDate: r.startDate.toISOString(),
      }))}
      categories={categories.map((c) => ({ id: c.id, name: c.name }))}
      isPro={isPro}
    />
  );
}
