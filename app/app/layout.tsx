import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { AppSidebar } from '@/components/app-sidebar';
import { ChatWidget } from '@/components/chat-widget';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  // Check if user has completed onboarding
  const profile = await prisma.userProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    redirect('/onboarding');
  }

  // Get subscription status
  const subscription = await prisma.subscription.findUnique({
    where: { userId: session.user.id },
  });

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
