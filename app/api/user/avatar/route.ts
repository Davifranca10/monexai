import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generatePresignedUploadUrl, getFileUrl, deleteFile } from '@/lib/s3';

export const dynamic = 'force-dynamic';

// Get presigned URL for upload
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { fileName, contentType } = body ?? {};

    console.log('🔍 [POST] Gerando presigned URL para:', { fileName, contentType });

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Only allow image types
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
    }

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      `avatar-${session.user.id}-${fileName}`,
      contentType,
      true // Public for avatars
    );

    console.log('✅ [POST] URL gerada com sucesso:', { cloud_storage_path });

    return NextResponse.json({ uploadUrl, cloud_storage_path });
  } catch (error) {
    console.error('❌ [POST] Error generating upload URL:', error);
    return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 });
  }
}

// Save avatar path after upload
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log('🔍 [PUT] Session user ID:', session?.user?.id);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('🔍 [PUT] Body recebido:', JSON.stringify(body, null, 2));
    
    const { cloud_storage_path } = body ?? {};
    console.log('🔍 [PUT] cloud_storage_path extraído:', cloud_storage_path);
    console.log('🔍 [PUT] Tipo:', typeof cloud_storage_path);
    console.log('🔍 [PUT] É string?', typeof cloud_storage_path === 'string');
    console.log('🔍 [PUT] Comprimento:', cloud_storage_path?.length);

    if (!cloud_storage_path) {
      console.error('❌ [PUT] cloud_storage_path está vazio ou undefined!');
      console.error('❌ [PUT] Body completo:', body);
      return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 });
    }

    // Get current avatar to delete later
    const currentProfile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    // Delete old avatar if exists
    if (currentProfile?.avatarPath) {
      try {
        await deleteFile(currentProfile.avatarPath);
        console.log('🗑️ [PUT] Avatar antigo deletado:', currentProfile.avatarPath);
      } catch (e) {
        console.error('❌ [PUT] Error deleting old avatar:', e);
      }
    }

    // Update profile with new avatar path
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { avatarPath: cloud_storage_path },
    });

    console.log('✅ [PUT] Avatar salvo no banco:', cloud_storage_path);

    const avatarUrl = await getFileUrl(cloud_storage_path, true);
    console.log('✅ [PUT] Avatar URL gerada:', avatarUrl);

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error('❌ [PUT] Error saving avatar:', error);
    return NextResponse.json({ error: 'Erro ao salvar avatar' }, { status: 500 });
  }
}

// Get current avatar URL
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const profile = await prisma.userProfile.findUnique({
      where: { userId: session.user.id },
    });

    if (!profile?.avatarPath) {
      return NextResponse.json({ avatarUrl: null });
    }

    const avatarUrl = await getFileUrl(profile.avatarPath, true);
    return NextResponse.json({ avatarUrl });
  } catch (error) {
    console.error('Error getting avatar:', error);
    return NextResponse.json({ error: 'Erro ao obter avatar' }, { status: 500 });
  }
}