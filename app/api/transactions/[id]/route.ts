import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }  // ← MUDANÇA 1
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;  // ← MUDANÇA 2

    // Verify ownership
    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: session.user.id },
    });

    if (!transaction) {
      return NextResponse.json({ error: 'Lançamento não encontrado' }, { status: 404 });
    }

    await prisma.transaction.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: 'Erro ao excluir' }, { status: 500 });
  }
}