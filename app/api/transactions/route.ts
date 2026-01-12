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

    const transactions = await prisma.transaction.findMany({
      where: { userId: session.user.id },
      include: { category: true },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
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
    const { type, categoryId, description, amountCents, date, installments, interestPercent } = body ?? {};

    if (!type || !categoryId || !description || !amountCents || !date) {
      return NextResponse.json({ error: 'Campos obrigatórios faltando' }, { status: 400 });
    }

    // Validate that category type matches transaction type
    const category = await prisma.category.findUnique({ where: { id: categoryId } });
    if (!category || category.type !== type) {
      return NextResponse.json({ error: 'Categoria inválida para este tipo de lançamento' }, { status: 400 });
    }

    // Check freemium limit
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const count = await prisma.transaction.count({
        where: {
          userId: session.user.id,
          createdAt: { gte: startOfMonth },
        },
      });

      if (count >= FREEMIUM_LIMITS.transactionsPerMonth) {
        return NextResponse.json(
          { error: 'Limite de lançamentos atingido. Faça upgrade para Pro.' },
          { status: 403 }
        );
      }
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: session.user.id,
        type,
        categoryId,
        description,
        amountCents: Math.round(amountCents),
        date: new Date(date),
        installments: installments || 1,
        interestPercent: interestPercent || 0,
      },
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error('Error creating transaction:', error);
    return NextResponse.json({ error: 'Erro ao criar lançamento' }, { status: 500 });
  }
}
