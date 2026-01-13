import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all user data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
      },
    });

    const transactions = await prisma.transaction.findMany({
      where: { userId },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    const recurringRules = await prisma.recurringRule.findMany({
      where: { userId },
      include: { category: true },
    });

    const templates = await prisma.template.findMany({
      where: { userId },
      include: { category: true },
    });

    const exportData = {
      exportDate: new Date().toISOString(),
      user: {
        email: user?.email,
        name: user?.name,
        mode: user?.profile?.mode,
        createdAt: user?.createdAt,
      },
      subscription: user?.subscription ? {
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      } : null,
transactions: transactions.map((t: any) => ({
        description: t.description,
        type: t.type,
        amount: t.amountCents / 100,
        category: t.category?.name,
        date: t.date,
        createdAt: t.createdAt,
      })),
      recurringRules: recurringRules.map((r: any) => ({
        description: r.description,
        type: r.type,
        transactionType: r.transactionType,
        amount: r.amountCents / 100,
        category: r.category?.name,
        isActive: r.isActive,
      })),
      customTemplates: templates.map((t: any) => ({
        name: t.name,
        type: t.type,
        category: t.category?.name,
      })),
    };

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': 'attachment; filename="monexai-dados.json"',
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Erro ao exportar' }, { status: 500 });
  }
}
