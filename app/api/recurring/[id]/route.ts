import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params ?? {};
    const body = await request.json();

    // Verify ownership
    const rule = await prisma.recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Recorrência não encontrada' }, { status: 404 });
    }

    const updated = await prisma.recurringRule.update({
      where: { id },
      data: body,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Error updating recurring rule:', error);
    return NextResponse.json({ error: 'Erro ao atualizar' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = params ?? {};

    // Verify ownership
    const rule = await prisma.recurringRule.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!rule) {
      return NextResponse.json({ error: 'Recorrência não encontrada' }, { status: 404 });
    }

    await prisma.recurringRule.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting recurring rule:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}
