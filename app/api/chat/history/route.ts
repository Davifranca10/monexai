import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

const DAILY_QUESTION_LIMIT = 50;

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      return NextResponse.json(
        {
          isPro: false,
          messages: [],
          dailyCount: 0,
          limitReached: false,
        },
        { status: 200 }
      );
    }

    // Get last 30 messages
    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
      take: 30,
    });

    // Check daily usage
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const usage = await prisma.chatUsage.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    const dailyCount = usage?.questionCount || 0;
    const limitReached = dailyCount >= DAILY_QUESTION_LIMIT;

    return NextResponse.json({
      isPro: true,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString(),
      })),
      dailyCount,
      limitReached,
    });
  } catch (error) {
    console.error('Erro ao buscar histórico do chat:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar histórico' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check subscription status
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      return NextResponse.json(
        { error: 'Plano Pro necessário' },
        { status: 403 }
      );
    }

    // Delete all chat messages for this user
    await prisma.chatMessage.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Histórico do chat limpo com sucesso',
    });
  } catch (error) {
    console.error('Erro ao limpar histórico do chat:', error);
    return NextResponse.json(
      { error: 'Erro ao limpar histórico' },
      { status: 500 }
    );
  }
}
