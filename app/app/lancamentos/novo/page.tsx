import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { NovoLancamentoClient } from './novo-lancamento-client';
import { FREEMIUM_LIMITS } from '@/lib/utils';
import { redirect } from 'next/navigation';

export const revalidate = 0; // Essa página pode ter revalidate 0 (sempre fresh)

export default async function NovoLancamentoPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const [profile, subscription, transactionCount] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.transaction.count({
      where: {
        userId,
        createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      },
    }),
  ]);

  const isPro = subscription?.status === 'ACTIVE';

  if (!isPro && transactionCount >= FREEMIUM_LIMITS.transactionsPerMonth) {
    redirect('/app/assinatura?limit=transactions');
  }

  const [categories, templates] = await Promise.all([
    prisma.category.findMany({
      where: { mode: profile?.mode || 'PERSONAL' },
    }),
    prisma.template.findMany({
      where: {
        mode: profile?.mode || 'PERSONAL',
        OR: [{ isSystem: true }, { userId }],
      },
      include: { category: true },
    }),
  ]);

  return (
    <NovoLancamentoClient
      categories={categories.map((c: any) => ({ id: c.id, name: c.name, type: c.type }))}
      templates={templates.map((t: any) => ({
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