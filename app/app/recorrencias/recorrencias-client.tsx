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
import { formatCurrency, FREEMIUM_LIMITS } from '@/lib/utils';
import { Plus, Repeat, Trash2, TrendingUp, TrendingDown, Crown, Loader2 } from 'lucide-react';
type RecurrenceType = 'MONTHLY' | 'WEEKLY' | 'INSTALLMENT';
type TransactionType = 'INCOME' | 'EXPENSE';
import { toast } from 'sonner';
import Link from 'next/link';

interface Rule {
  id: string;
  description: string;
  amountCents: number;
  type: RecurrenceType;
  transactionType: TransactionType;
  categoryId: string;
  categoryName: string;
  dayOfMonth: number | null;
  dayOfWeek: number | null;
  totalInstallments: number | null;
  paidInstallments: number | null;
  isActive: boolean;
  startDate: string;
}

interface RecorrenciasClientProps {
  rules: Rule[];
  categories: { id: string; name: string }[];
  isPro: boolean;
}

const weekDays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export function RecorrenciasClient({ rules: initialRules, categories, isPro }: RecorrenciasClientProps) {
  const [rules, setRules] = useState(initialRules);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionType, setTransactionType] = useState<TransactionType>('EXPENSE');
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('MONTHLY');
  const [categoryId, setCategoryId] = useState('');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [dayOfWeek, setDayOfWeek] = useState('1');
  const [totalInstallments, setTotalInstallments] = useState('12');

  const canAddMore = isPro || (rules?.length ?? 0) < FREEMIUM_LIMITS.maxRecurrences;

  const resetForm = () => {
    setDescription('');
    setAmount('');
    setTransactionType('EXPENSE');
    setRecurrenceType('MONTHLY');
    setCategoryId('');
    setDayOfMonth('1');
    setDayOfWeek('1');
    setTotalInstallments('12');
  };

  const handleCreate = async () => {
    if (!description || !amount || !categoryId) {
      toast.error('Preencha todos os campos');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/recurring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amountCents: Math.round(parseFloat(amount) * 100),
          transactionType,
          type: recurrenceType,
          categoryId,
          dayOfMonth: recurrenceType === 'MONTHLY' ? parseInt(dayOfMonth) : null,
          dayOfWeek: recurrenceType === 'WEEKLY' ? parseInt(dayOfWeek) : null,
          totalInstallments: recurrenceType === 'INSTALLMENT' ? parseInt(totalInstallments) : null,
        }),
      });

      if (res.ok) {
        const newRule = await res.json();
        setRules((prev) => [{ ...newRule, categoryName: categories?.find((c) => c?.id === categoryId)?.name || '' }, ...(prev ?? [])]);
        toast.success('Recorrência criada!');
        setOpen(false);
        resetForm();
      } else {
        const data = await res.json();
        toast.error(data?.error || 'Erro ao criar');
      }
    } catch (error) {
      toast.error('Erro ao criar recorrência');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir esta recorrência?')) return;

    try {
      const res = await fetch(`/api/recurring/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setRules((prev) => (prev ?? []).filter((r) => r?.id !== id));
        toast.success('Recorrência excluída');
      }
    } catch (error) {
      toast.error('Erro ao excluir');
    }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`/api/recurring/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (res.ok) {
        setRules((prev) =>
          (prev ?? []).map((r) => (r?.id === id ? { ...r, isActive: !isActive } : r))
        );
        toast.success(isActive ? 'Recorrência pausada' : 'Recorrência ativada');
      }
    } catch (error) {
      toast.error('Erro ao atualizar');
    }
  };

  const getRecurrenceLabel = (rule: Rule) => {
    if (rule?.type === 'MONTHLY') return `Dia ${rule?.dayOfMonth ?? 1}`;
    if (rule?.type === 'WEEKLY') return weekDays[rule?.dayOfWeek ?? 0];
    if (rule?.type === 'INSTALLMENT') return `${rule?.paidInstallments ?? 0}/${rule?.totalInstallments ?? 0} parcelas`;
    return '';
  };

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Recorrências</h1>
          <p className="text-gray-600 text-sm md:text-base">Gerencie pagamentos automáticos</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-green-700 hover:bg-green-800 w-full sm:w-auto"
              disabled={!canAddMore}
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Recorrência
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Recorrência</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <Button
                  type="button"
                  variant={transactionType === 'EXPENSE' ? 'default' : 'outline'}
                  className={transactionType === 'EXPENSE' ? 'bg-red-600' : ''}
                  onClick={() => setTransactionType('EXPENSE')}
                >
                  <TrendingDown className="h-4 w-4 mr-1" /> Despesa
                </Button>
                <Button
                  type="button"
                  variant={transactionType === 'INCOME' ? 'default' : 'outline'}
                  className={transactionType === 'INCOME' ? 'bg-green-600' : ''}
                  onClick={() => setTransactionType('INCOME')}
                >
                  <TrendingUp className="h-4 w-4 mr-1" /> Receita
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Tipo de Recorrência</Label>
                <Select value={recurrenceType} onValueChange={(v) => setRecurrenceType(v as RecurrenceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MONTHLY">Mensal</SelectItem>
                    <SelectItem value="WEEKLY">Semanal</SelectItem>
                    <SelectItem value="INSTALLMENT">Parcelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {recurrenceType === 'MONTHLY' && (
                <div className="space-y-2">
                  <Label>Dia do Mês</Label>
                  <Select value={dayOfMonth} onValueChange={setDayOfMonth}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 28 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          Dia {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {recurrenceType === 'WEEKLY' && (
                <div className="space-y-2">
                  <Label>Dia da Semana</Label>
                  <Select value={dayOfWeek} onValueChange={setDayOfWeek}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {weekDays.map((day, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {recurrenceType === 'INSTALLMENT' && (
                <div className="space-y-2">
                  <Label>Número de Parcelas</Label>
                  <Select value={totalInstallments} onValueChange={setTotalInstallments}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 24 }, (_, i) => (
                        <SelectItem key={i + 1} value={String(i + 1)}>
                          {i + 1}x
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label>Categoria</Label>
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
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Aluguel"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Valor (R$)</Label>
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
                Criar Recorrência
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <InfoBox
        title="O que são recorrências?"
        description="Recorrências são lançamentos que se repetem automaticamente. Ideal para contas fixas como aluguel, salário, assinaturas e parcelamentos. O sistema cria os lançamentos automaticamente nas datas configuradas."
        tutorial={[
          'Clique em \"Nova Recorrência\" para criar',
          'Escolha mensal, semanal ou parcelamento',
          'Configure o dia e o valor',
          'O sistema criará os lançamentos automaticamente'
        ]}
      />

      {!canAddMore && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="flex flex-col sm:flex-row items-start sm:items-center gap-3 py-4">
            <Crown className="h-5 w-5 text-amber-600" />
            <p className="flex-1 text-amber-800 text-sm">
              Limite de {FREEMIUM_LIMITS.maxRecurrences} recorrências atingido.
            </p>
            <Link href="/app/assinatura">
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                Upgrade Pro
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 md:space-y-4">
        {(rules?.length ?? 0) > 0 ? (
          rules.map((rule) => (
            <Card key={rule?.id} className={!rule?.isActive ? 'opacity-60' : ''}>
              <CardContent className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4">
                <div className="flex items-center gap-3 md:gap-4">
                  <div
                    className={`p-2 rounded-full flex-shrink-0 ${rule?.transactionType === 'INCOME'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-red-100 text-red-600'
                      }`}
                  >
                    <Repeat className="h-4 w-4 md:h-5 md:w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm md:text-base">{rule?.description}</p>
                    <div className="flex flex-wrap items-center gap-1 md:gap-2 text-xs md:text-sm text-gray-500">
                      <Badge variant="secondary" className="text-xs">{rule?.categoryName}</Badge>
                      <Badge variant="outline" className="text-xs">{getRecurrenceLabel(rule)}</Badge>
                      {!rule?.isActive && <Badge variant="destructive" className="text-xs">Pausado</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto justify-end">
                  <span
                    className={`text-sm md:text-lg font-semibold ${rule?.transactionType === 'INCOME' ? 'text-green-600' : 'text-red-600'
                      }`}
                  >
                    {formatCurrency(rule?.amountCents ?? 0)}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs md:text-sm"
                    onClick={() => toggleActive(rule?.id ?? '', rule?.isActive ?? false)}
                  >
                    {rule?.isActive ? 'Pausar' : 'Ativar'}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-600 h-8 w-8"
                    onClick={() => handleDelete(rule?.id ?? '')}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Repeat className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-sm">Nenhuma recorrência cadastrada</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
