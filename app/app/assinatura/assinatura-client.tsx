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

type SubscriptionStatus = 'FREEMIUM' | 'ACTIVE' | 'CANCELED' | 'PAST_DUE';

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

const plans = [
  {
    id: 'monthly',
    name: 'Mensal',
    price: 29.90,
    period: 'mês',
    savings: null,
    popular: false,
  },
  {
    id: 'semiannual',
    name: 'Semestral',
    price: 149.90,
    period: '6 meses',
    savings: 16,
    popular: true,
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 299.90,
    period: 'ano',
    savings: 16,
    popular: false,
  },
];

export function AssinaturaClient({ subscription }: AssinaturaClientProps) {
  const searchParams = useSearchParams();
  const upgrade = searchParams?.get('upgrade');
  const limit = searchParams?.get('limit');
  
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState('semiannual'); // Default: Semestral

  const isPro = subscription?.status === 'ACTIVE';
  const isPastDue = subscription?.status === 'PAST_DUE';

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      });
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
    <div className="p-6 max-w-5xl mx-auto">
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

      {/* Pro Plans */}
      {!isPro && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Escolha seu plano</h2>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? 'border-green-600 border-2 shadow-lg'
                    : 'border-gray-200 hover:border-green-400'
                } ${plan.popular ? 'relative' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-green-600">Mais Popular</Badge>
                  </div>
                )}
                <CardContent className="pt-6">
                  <div className="text-center">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-green-700">
                        R$ {plan.price.toFixed(2)}
                      </span>
                      <span className="text-gray-500">/{plan.period}</span>
                    </div>
                    {plan.savings && (
                      <Badge variant="secondary" className="mb-4">
                        Economize {plan.savings}%
                      </Badge>
                    )}
                    <div className="text-sm text-gray-600">
                      {plan.id === 'monthly' && 'Renovação mensal'}
                      {plan.id === 'semiannual' && 'R$ 24,98/mês'}
                      {plan.id === 'annual' && 'R$ 24,99/mês'}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="border-green-600 border-2">
            <CardHeader className="bg-green-50">
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                O que está incluso:
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="grid md:grid-cols-2 gap-3 mb-6">
                {proFeatures.map((feature) => (
                  <li key={feature} className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <span>{feature}</span>
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
                Assinar Plano {plans.find(p => p.id === selectedPlan)?.name}
              </Button>

              <p className="text-center text-sm text-gray-500 mt-4">
                Pagamento seguro via Stripe. Cancele quando quiser.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}