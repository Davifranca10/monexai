'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crown,
  CheckCircle2,
  CreditCard,
  Loader2,
  ExternalLink,
  AlertTriangle,
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDate } from '@/lib/utils';

type SubscriptionStatus = 'FREEMIUM' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE';  // ← ADICIONAR AQUI

interface AssinaturaClientProps {
  subscription: {
    status: SubscriptionStatus;
    currentPeriodEnd: string | null;
    stripeCustomerId: string | null;
  };
}

const proFeatures = [
  'Lançamentos ilimitados',
  'Histórico completo',
  'Recorrências ilimitadas',
  'Chat com IA',
  'Templates personalizados',
  'Central Educacional',
  'Relatórios comparativos',
];

export function AssinaturaClient({ subscription }: AssinaturaClientProps) {
  const searchParams = useSearchParams();
  const upgrade = searchParams?.get('upgrade');
  const limit = searchParams?.get('limit');
  
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  const isPro = subscription?.status === 'ACTIVE';
  const isPastDue = subscription?.status === 'PAST_DUE';

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST' });
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erro ao iniciar checkout');
      }
    } catch (error) {
      toast.error('Erro ao processar');
    } finally {
      setLoading(false);
    }
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const data = await res.json();

      if (data?.url) {
        window.location.href = data.url;
      } else {
        toast.error('Erro ao abrir portal');
      }
    } catch (error) {
      toast.error('Erro ao processar');
    } finally {
      setPortalLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <CreditCard className="h-8 w-8 text-green-700" />
        <h1 className="text-2xl font-bold">Assinatura</h1>
      </div>

      {/* Upgrade prompts */}
      {upgrade === 'chat' && !isPro && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Crown className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800">
              O <strong>Chat com IA</strong> é exclusivo do plano Pro. Assine para desbloquear!
            </p>
          </CardContent>
        </Card>
      )}

      {upgrade === 'educacional' && !isPro && (
        <Card className="mb-6 border-amber-300 bg-amber-50">
          <CardContent className="flex items-center gap-3 py-4">
            <Crown className="h-5 w-5 text-amber-600" />
            <p className="text-amber-800">
              A <strong>Central Educacional</strong> é exclusiva do plano Pro. Assine para acessar!
            </p>
          </CardContent>
        </Card>
      )}

      {limit === 'transactions' && !isPro && (
        <Card className="mb-6 border-red-300 bg-red-50">
          <CardContent className="flex items-center gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <p className="text-red-800">
              Você atingiu o <strong>limite de lançamentos</strong> do plano gratuito. Assine Pro para continuar!
            </p>
          </CardContent>
        </Card>
      )}

      {/* Current Plan */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Seu Plano Atual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isPro ? (
                <Badge className="bg-amber-500 text-lg py-1 px-3">
                  <Crown className="h-4 w-4 mr-1" /> Pro
                </Badge>
              ) : (
                <Badge variant="secondary" className="text-lg py-1 px-3">
                  Freemium
                </Badge>
              )}
              {isPastDue && (
                <Badge variant="destructive">Pagamento Pendente</Badge>
              )}
            </div>
            {isPro && subscription?.currentPeriodEnd && (
              <p className="text-sm text-gray-600">
                Próxima cobrança: {formatDate(subscription.currentPeriodEnd)}
              </p>
            )}
          </div>

          {isPro && subscription?.stripeCustomerId && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={handlePortal}
              disabled={portalLoading}
            >
              {portalLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="h-4 w-4 mr-2" />
              )}
              Gerenciar Assinatura
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Pro Plan Card */}
      {!isPro && (
        <Card className="border-green-600 border-2">
          <CardHeader className="bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-6 w-6 text-amber-500" />
                  Plano Pro
                </CardTitle>
                <CardDescription>Desbloqueie todo o potencial do MonexAI</CardDescription>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-green-700">R$ 29,90</p>
                <p className="text-sm text-gray-500">/mês</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-3 mb-6">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  {feature}
                </li>
              ))}
            </ul>

            <Button
              className="w-full bg-green-700 hover:bg-green-800 text-lg py-6"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
              ) : (
                <Crown className="h-5 w-5 mr-2" />
              )}
              Assinar Plano Pro
            </Button>

            <p className="text-center text-sm text-gray-500 mt-4">
              Pagamento seguro via Stripe. Cancele quando quiser.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}