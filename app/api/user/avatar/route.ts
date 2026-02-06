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

    if (!fileName || !contentType) {
      return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 });
    }

    // Only allow image types
    if (!contentType.startsWith('image/')) {
      return NextResponse.json({ error: 'Apenas imagens são permitidas' }, { status: 400 });
    }

    // Validate fileName to prevent path traversal
    if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
      return NextResponse.json({ error: 'Nome de arquivo inválido' }, { status: 400 });
    }

    // Limit filename length
    if (fileName.length > 100) {
      return NextResponse.json({ error: 'Nome de arquivo muito longo' }, { status: 400 });
    }

    const { uploadUrl, cloud_storage_path } = await generatePresignedUploadUrl(
      `avatar-${session.user.id}-${fileName}`,
      contentType,
      true // Public for avatars
    );

    return NextResponse.json({ uploadUrl, cloud_storage_path });
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json({ error: 'Erro ao gerar URL' }, { status: 500 });
  }
}

// Validate avatar path belongs to current user and prevents path traversal
function validateAvatarPath(avatarPath: string, userId: string): boolean {
  // Must contain user ID and start with avatar prefix
  const expectedPrefix = `avatar-${userId}-`;
  
  // Check for path traversal attempts
  if (avatarPath.includes('..') || avatarPath.includes('\\') || avatarPath.startsWith('/')) {
    return false;
  }
  
  // Verify path starts with expected prefix (belongs to this user)
  if (!avatarPath.startsWith(expectedPrefix)) {
    return false;
  }
  
  // Verify reasonable length (prevent DoS with extremely long paths)
  if (avatarPath.length > 255) {
    return false;
  }
  
  // Must be alphanumeric, hyphens, underscores, dots only
  if (!/^[a-zA-Z0-9\-_.]+$/.test(avatarPath)) {
    return false;
  }
  
  return true;
}

// Save avatar path after upload
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { cloud_storage_path } = body ?? {};

    if (!cloud_storage_path) {
      return NextResponse.json({ error: 'Caminho inválido' }, { status: 400 });
    }

    // Strict validation: ensure path cannot be exploited
    if (!validateAvatarPath(cloud_storage_path, session.user.id)) {
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
      } catch (e) {
        console.error('Error deleting old avatar:', e);
      }
    }

    // Update profile with new avatar path
    await prisma.userProfile.update({
      where: { userId: session.user.id },
      data: { avatarPath: cloud_storage_path },
    });

    const avatarUrl = await getFileUrl(cloud_storage_path, true);

    return NextResponse.json({ success: true, avatarUrl });
  } catch (error) {
    console.error('Error saving avatar:', error);
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
