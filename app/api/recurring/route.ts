import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { FREEMIUM_LIMITS } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const rules = await prisma.recurring_rule.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error('Error fetching recurring rules:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const {
      description,
      amountCents,
      transactionType,
      type,
      categoryId,
      dayOfMonth,
      dayOfWeek,
      totalInstallments,
    } = body ?? {};

    // Check freemium limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      const count = await prisma.recurring_rule.count({
        where: { userId: session.user.id },
      });

      if (count >= FREEMIUM_LIMITS.maxRecurrences) {
        return NextResponse.json(
          { error: 'Limite de recorrências atingido. Faça upgrade para Pro.' },
          { status: 403 }
        );
      }
    }

    const rule = await prisma.recurring_rule.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        description,
        amountCents: Math.round(amountCents),
        transactionType,
        type,
        categoryId,
        dayOfMonth,
        dayOfWeek,
        totalInstallments,
        paidInstallments: 0,
        startDate: new Date(),
        isActive: true,
      },
    });

    return NextResponse.json(rule);
  } catch (error) {
    console.error('Error creating recurring rule:', error);
    return NextResponse.json({ error: 'Erro ao criar recorrência' }, { status: 500 });
  }
}
