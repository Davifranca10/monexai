import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { ConfiguracoesClient } from './configuracoes-client';
import { getFileUrl } from '@/lib/s3';

export const dynamic = 'force-dynamic';

export default async function ConfiguracoesPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  let avatarUrl: string | null = null;
  if (user?.user_profile?.avatarPath) {
    try {
      avatarUrl = await getFileUrl(user.user_profile.avatarPath, true);
    } catch (e) {
      console.error('Error getting avatar URL:', e);
    }
  }

  return (
    <ConfiguracoesClient
      user={{
        name: user?.name || '',
        email: user?.email || '',
        mode: user?.user_profile?.mode || 'PERSONAL',
        createdAt: user?.createdAt?.toISOString() || '',
        avatarUrl,
      }}
    />
  );
}
