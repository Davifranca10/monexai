'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Settings,
  User,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Shield,
  Mail,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

type UserMode = 'PERSONAL' | 'BUSINESS';  // ← ADICIONAR AQUI

interface ConfiguracoesClientProps {
  user: {
    name: string;
    email: string;
    mode: UserMode;
    createdAt: string;
    avatarUrl: string | null;
  };
}

// Change Password Form Component
function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Preencha todos os campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('A nova senha e a confirmação não coincidem');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('A nova senha deve ter no mínimo 6 caracteres');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erro ao alterar senha');
      }

      toast.success('Senha alterada com sucesso!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao alterar senha');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleChangePassword} className="space-y-4">
      <div>
        <Label htmlFor="currentPassword">Senha Atual</Label>
        <Input
          id="currentPassword"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          placeholder="Digite sua senha atual"
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="newPassword">Nova Senha</Label>
        <Input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Digite a nova senha (mínimo 6 caracteres)"
          disabled={loading}
        />
      </div>
      <div>
        <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
        <Input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Digite novamente a nova senha"
          disabled={loading}
        />
      </div>
      <Button type="submit" disabled={loading} className="bg-green-700 hover:bg-green-800">
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Alterando...
          </>
        ) : (
          <>
            <Shield className="h-4 w-4 mr-2" />
            Alterar Senha
          </>
        )}
      </Button>
    </form>
  );
}

export function ConfiguracoesClient({ user }: ConfiguracoesClientProps) {
  const router = useRouter();
  const [name, setName] = useState(user?.name ?? '');
  const [saving, setSaving] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Selecione uma imagem');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter no máximo 5MB');
      return;
    }

    setUploadingAvatar(true);
    try {
      // Get presigned URL
      const presignRes = await fetch('/api/user/avatar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileName: file.name, contentType: file.type }),
      });

      if (!presignRes.ok) throw new Error('Erro ao gerar URL');
      const { uploadUrl, cloud_storage_path } = await presignRes.json();

      // Upload to S3
      const uploadRes = await fetch(uploadUrl, {
        method: 'PUT',
        headers: { 'Content-Type': file.type },
        body: file,
      });

      if (!uploadRes.ok) throw new Error('Erro no upload');

      // Save path to database
      const saveRes = await fetch('/api/user/avatar', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloud_storage_path }),
      });

      if (!saveRes.ok) throw new Error('Erro ao salvar');
      const { avatarUrl: newAvatarUrl } = await saveRes.json();

      setAvatarUrl(newAvatarUrl);
      toast.success('Foto atualizada!');
      router.refresh();
    } catch (error) {
      toast.error('Erro ao enviar foto');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (res.ok) {
        toast.success('Perfil atualizado!');
        router.refresh();
      } else {
        toast.error('Erro ao atualizar');
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await fetch('/api/user/export');
      if (res.ok) {
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'monexai-dados.json';
        a.click();
        URL.revokeObjectURL(url);
        toast.success('Dados exportados!');
      }
    } catch (error) {
      toast.error('Erro ao exportar dados');
    } finally {
      setExportLoading(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirm !== 'EXCLUIR') {
      toast.error('Digite EXCLUIR para confirmar');
      return;
    }

    setDeleteLoading(true);
    try {
      const res = await fetch('/api/user/delete', { method: 'DELETE' });
      if (res.ok) {
        toast.success('Conta excluída');
        signOut({ callbackUrl: '/' });
      } else {
        toast.error('Erro ao excluir conta');
      }
    } catch (error) {
      toast.error('Erro ao excluir conta');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings className="h-8 w-8 text-green-700" />
        <h1 className="text-2xl font-bold">Configurações</h1>
      </div>

      {/* Profile Info */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" /> Perfil
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Avatar Upload */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {avatarUrl ? (
                  <Image
                    src={avatarUrl}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <User className="h-10 w-10 text-gray-400" />
                )}
              </div>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="absolute bottom-0 right-0 bg-green-700 text-white p-1.5 rounded-full hover:bg-green-800 disabled:opacity-50"
              >
                {uploadingAvatar ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Camera className="h-4 w-4" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
            <div>
              <p className="font-medium">Foto de perfil</p>
              <p className="text-sm text-gray-500">JPG, PNG até 5MB</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Nome</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={user?.email ?? ''}
                disabled
                className="pl-10 bg-gray-50"
              />
            </div>
            <p className="text-xs text-gray-500">Email não pode ser alterado</p>
          </div>

          <div className="flex items-center gap-4">
            <div>
              <Label>Modo</Label>
              <div className="mt-1">
                <Badge variant="secondary">
                  {user?.mode === 'PERSONAL' ? 'Pessoal' : 'Empresarial'}
                </Badge>
              </div>
            </div>
            <div>
              <Label>Membro desde</Label>
              <p className="text-sm text-gray-600 mt-1">
                {formatDate(user?.createdAt ?? '')}
              </p>
            </div>
          </div>

          <Button
            onClick={handleSave}
            className="bg-green-700 hover:bg-green-800"
            disabled={saving}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Salvar Alterações
          </Button>
        </CardContent>
      </Card>

      {/* Security - Change Password Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Segurança
          </CardTitle>
          <CardDescription>
            Altere sua senha de acesso
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChangePasswordForm />
        </CardContent>
      </Card>

      {/* LGPD Section */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" /> Privacidade e Dados (LGPD)
          </CardTitle>
          <CardDescription>
            Exerça seus direitos sobre seus dados pessoais
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Exportar meus dados</p>
              <p className="text-sm text-gray-600">
                Baixe todos os seus dados em formato JSON
              </p>
            </div>
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={exportLoading}
            >
              {exportLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Exportar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <p className="font-medium text-red-800">Excluir minha conta</p>
              <p className="text-sm text-red-600">
                Todos os seus dados serão permanentemente removidos
              </p>
            </div>
            <Button
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir Conta
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Excluir Conta Permanentemente
            </DialogTitle>
            <DialogDescription>
              Esta ação não pode ser desfeita. Todos os seus dados serão
              permanentemente removidos, incluindo:
            </DialogDescription>
          </DialogHeader>
          <ul className="text-sm text-gray-600 list-disc list-inside space-y-1">
            <li>Todos os lançamentos</li>
            <li>Todas as recorrências</li>
            <li>Templates personalizados</li>
            <li>Histórico de dados</li>
            <li>Informações de assinatura</li>
          </ul>
          <div className="space-y-2">
            <Label>Digite EXCLUIR para confirmar:</Label>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="EXCLUIR"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteLoading || deleteConfirm !== 'EXCLUIR'}
            >
              {deleteLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Excluir Permanentemente
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}