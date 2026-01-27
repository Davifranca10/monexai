import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TemplatesClient } from './templates-client';

export const revalidate = 30;

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const [profile, subscription, templates, categories, hiddenTemplates] = await Promise.all([
    prisma.userProfile.findUnique({ where: { userId } }),
    prisma.subscription.findUnique({ where: { userId } }),
    prisma.template.findMany({
      where: {
        mode: 'PERSONAL',
        OR: [{ isSystem: true }, { userId }],
      },
      include: { category: true },
      orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    }),
    prisma.category.findMany({
      where: { mode: 'PERSONAL' },
    }),
    prisma.hidden_template.findMany({
      where: { userId },
      select: { templateId: true },
    }),
  ]);

  const userMode = profile?.mode || 'PERSONAL';
  const filteredTemplates = templates.filter(t => t.mode === userMode);
  const filteredCategories = categories.filter(c => c.mode === userMode);

  return (
    <TemplatesClient
      templates={filteredTemplates.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        categoryId: t.categoryId,
        categoryName: t.category?.name || '',
        isSystem: t.isSystem,
        amountCents: t.amountCents,
      }))}
      categories={filteredCategories.map((c: any) => ({ id: c.id, name: c.name }))}
      isPro={subscription?.status === 'ACTIVE'}
      hiddenTemplateIds={hiddenTemplates.map((h: any) => h.templateId)}
    />
  );
}
