import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { TemplatesClient } from './templates-client';

export const dynamic = 'force-dynamic';

export default async function TemplatesPage() {
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

  const templates = await prisma.template.findMany({
    where: {
      mode: profile?.mode || 'PERSONAL',
      OR: [
        { isSystem: true },
        { userId },
      ],
    },
    include: { category: true },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
  });

  const categories = await prisma.category.findMany({
    where: { mode: profile?.mode || 'PERSONAL' },
  });

  // Get hidden template IDs for this user
  const hiddenTemplates = await prisma.hiddenTemplate.findMany({
    where: { userId },
    select: { templateId: true },
  });
  const hiddenTemplateIds = hiddenTemplates.map((h: any) => h.templateId);

  return (
    <TemplatesClient
      templates={templates.map((t: any) => ({
        id: t.id,
        name: t.name,
        description: t.description,
        type: t.type,
        categoryId: t.categoryId,
        categoryName: t.category?.name || '',
        isSystem: t.isSystem,
        amountCents: t.amountCents,
      }))}
      categories={categories.map((c: any) => ({ id: c.id, name: c.name }))}
      isPro={isPro}
      hiddenTemplateIds={hiddenTemplateIds}
    />
  );
}
