import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if Pro
    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (subscription?.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Recurso exclusivo Pro' }, { status: 403 });
    }

    const { templateId, hide } = await request.json();

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID obrigatório' }, { status: 400 });
    }

    if (hide) {
      // Hide template
      await prisma.hidden_template.upsert({
        where: {
          userId_templateId: {
            userId: session.user.id,
            templateId,
          },
        },
        update: {},
        create: {
          userId: session.user.id,
          templateId,
        },
      });
    } else {
      // Show template
      await prisma.hidden_template.deleteMany({
        where: {
          userId: session.user.id,
          templateId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating template visibility:', error);
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 });
  }
}
