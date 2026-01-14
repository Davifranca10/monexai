import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppSidebar } from '@/components/app-sidebar';
import { ChatWidget } from '@/components/chat-widget';

export const revalidate = 60; // ✅ Cache de 60 segundos

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // ✅ OTIMIZAÇÃO CRÍTICA: Queries em PARALELO
  const [profile, subscription] = await Promise.all([
    prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    }),
    prisma.subscription.findUnique({
      where: { userId: session.user.id },
    }),
  ]);

  if (!profile) {
    redirect('/onboarding');
  }

  const isPro = subscription?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-gray-50 lg:flex">
      <AppSidebar mode={profile.mode} isPro={isPro} />
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        {children}
      </main>
      <ChatWidget />
    </div>
  );
}
