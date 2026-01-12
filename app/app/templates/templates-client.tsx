'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { InfoBox } from '@/components/ui/info-box';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { formatCurrency } from '@/lib/utils';
import { Plus, FileText, Trash2, TrendingUp, TrendingDown, Crown, Loader2, EyeOff, Eye } from 'lucide-react';
import { TransactionType } from '@prisma/client';
import { toast } from 'sonner';
import Link from 'next/link';

interface Template {
  id: string;
  name: string;
  description: string | null;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  isSystem: boolean;
  amountCents: number | null;
}

interface TemplatesClientProps {
  templates: Template[];
  categories: { id: string; name: string }[];
  isPro: boolean;
  hiddenTemplateIds: string[];
}

export function TemplatesClient({ templates: initialTemplates, categories, isPro, hiddenTemplateIds: initialHiddenIds }: TemplatesClientProps) {
  const [templates, setTemplates] = useState(initialTemplates);
  const [hiddenIds, setHiddenIds] = useState<string[]>(initialHiddenIds);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<TransactionType>('EXPENSE');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');

  const systemTemplates = templates?.filter((t) => t?.isSystem) ?? [];
  const visibleSystemTemplates = systemTemplates.filter((t) => !hiddenIds.includes(t.id));
  const hiddenSystemTemplates = systemTemplates.filter((t) => hiddenIds.includes(t.id));
  const userTemplates = templates?.filter((t) => !t?.isSystem) ?? [];

  const resetForm = () => {
    setName('');
    setDescription('');
    setType('EXPENSE');
    setCategoryId('');
    setAmount('');
  };

  const handleCreate = async () => {
    if (!name || !categoryId) {
      toast.error('Preencha os campos obrigatórios');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/templates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description,
          type,
          categoryId,
          amountCents: amount ? Math.round(parseFloat(amount) * 100) : null,
        }),
      });

      if (res.ok) {
        const newTemplate = await res.json();
        setTemplates((prev) => [...(prev ?? []), {
          ...newTemplate,
          categoryName: categories?.find((c) => c?.id === categoryId)?.name || '',
        }]);
        toast.success('Template criado!');
        setOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        toast.error(data?.error || 'Erro ao criar');
      }
    } catch (error) {
      toast.error('Erro ao criar template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir este template?')) return;

    try {
      const res = await fetch(`/api/templates/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTemplates((prev) => (prev ?? []).filter((t) => t?.id !== id));
        toast.success('Template excluído');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const toggleHideTemplate = async (templateId: string, hide: boolean) => {
    try {
      const res = await fetch('/api/templates/visibility', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ templateId, hide }),
      });
      if (res.ok) {
        if (hide) {
          setHiddenIds((prev) => [...prev, templateId]);
          toast.success('Template oculto');
        } else {
          setHiddenIds((prev) => prev.filter((id) => id !== templateId));
          toast.success('Template visível');
        }
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Templates</h1>
          <p className="text-gray-600 text-sm md:text-base">Use templates para criar lançamentos mais rápido</p>
        </div>
        {isPro ? (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" /> Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Novo Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={type === 'EXPENSE' ? 'default' : 'outline'}
                    className={type === 'EXPENSE' ? 'bg-red-600' : ''}
                    onClick={() => setType('EXPENSE')}
                  >
                    <TrendingDown className="h-4 w-4 mr-1" /> Despesa
                  </Button>
                  <Button
                    type="button"
                    variant={type === 'INCOME' ? 'default' : 'outline'}
                    className={type === 'INCOME' ? 'bg-green-600' : ''}
                    onClick={() => setType('INCOME')}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" /> Receita
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label>Nome *</Label>
                  <Input
                    placeholder="Ex: Supermercado semanal"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    placeholder="Opcional"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Categoria *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((c) => (
                        <SelectItem key={c?.id} value={c?.id ?? ''}>
                          {c?.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Valor padrão (opcional)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-green-700 hover:bg-green-800"
                  onClick={handleCreate}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  Criar Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <Link href="/app/assinatura">
            <Button className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto">
              <Crown className="h-4 w-4 mr-2" /> Criar Templates (Pro)
            </Button>
          </Link>
        )}
      </div>

      <InfoBox
        title="O que são templates?"
        description="Templates são atalhos que agilizam seu dia a dia. Com eles, você não precisa digitar as mesmas informações repetidamente. Cada template já vem com nome, categoria e valor pré-definidos."
        tutorial={[
          'Ao criar um lançamento, selecione um template',
          'Os campos serão preenchidos automaticamente',
          'Você pode ajustar os valores antes de salvar',
          'Usuários Pro podem criar templates personalizados'
        ]}
      />

      {/* User Templates */}
      {(userTemplates?.length ?? 0) > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Meus Templates</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userTemplates.map((t) => (
              <Card key={t?.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-full ${
                          t?.type === 'INCOME'
                            ? 'bg-green-100 text-green-600'
                            : 'bg-red-100 text-red-600'
                        }`}
                      >
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{t?.name}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {t?.categoryName}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-600"
                      onClick={() => handleDelete(t?.id ?? '')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  {t?.amountCents && (
                    <p className="text-sm text-gray-500 mt-2">
                      Valor padrão: {formatCurrency(t.amountCents)}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* System Templates */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Templates Padrão</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {visibleSystemTemplates.map((t) => (
            <Card key={t?.id} className="bg-gray-50">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full flex-shrink-0 ${
                        t?.type === 'INCOME'
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{t?.name}</p>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {t?.categoryName}
                      </Badge>
                      {t?.amountCents && (
                        <p className={`text-sm font-semibold mt-1 ${
                          t?.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {formatCurrency(t.amountCents)}
                        </p>
                      )}
                    </div>
                  </div>
                  {isPro && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0"
                      onClick={() => toggleHideTemplate(t?.id ?? '', true)}
                      title="Ocultar template"
                    >
                      <EyeOff className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Hidden Templates (Pro only) */}
      {isPro && hiddenSystemTemplates.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-gray-500">Templates Ocultos</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {hiddenSystemTemplates.map((t) => (
              <Card key={t?.id} className="bg-gray-100 opacity-60">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-full bg-gray-200 text-gray-500">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-gray-500">{t?.name}</p>
                        <Badge variant="secondary" className="text-xs mt-1">
                          {t?.categoryName}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-400 hover:text-green-600 flex-shrink-0"
                      onClick={() => toggleHideTemplate(t?.id ?? '', false)}
                      title="Mostrar template"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
