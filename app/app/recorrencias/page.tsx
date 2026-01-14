import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { RecorrenciasClient } from './recorrencias-client';

export const revalidate = 30; // ✅ Cache de 30s

export default async function RecorrenciasPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  // ✅ Queries em PARALELO
  const [profile, subscription, rules, categories] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.recurringRule.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({
      where: { mode: 'PERSONAL' }, // Vamos buscar depois baseado no profile
    }),
  ]);

  // Filtrar categorias pelo mode
  const userMode = profile?.mode || 'PERSONAL';
  const filteredCategories = categories.filter(c => c.mode === userMode);

  return (
    <RecorrenciasClient
      rules={rules.map((r: any) => ({
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
      categories={filteredCategories.map((c: any) => ({ id: c.id, name: c.name }))}
      isPro={subscription?.status === 'ACTIVE'}
    />
  );
}