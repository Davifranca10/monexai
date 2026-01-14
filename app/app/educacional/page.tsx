import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import { EducacionalClient } from './educacional-client';

export const revalidate = 3600; // ✅ Cache de 1 hora (conteúdo estático)

export default async function EducacionalPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) redirect('/login');

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.status !== 'ACTIVE') {
    redirect('/app/dashboard?upgrade=educacional');
  }

  return <EducacionalClient />;
}
