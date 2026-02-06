'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, X, Loader2, Crown } from 'lucide-react';
import { toast } from 'sonner';

const plans = [
  {
    id: 'freemium',
    name: 'Freemium',
    price: 'Grátis',
    description: 'Para começar a organizar suas finanças',
    features: [
      { text: '12 lançamentos/mês', included: true },
      { text: 'Histórico de 2 meses', included: true },
      { text: '3 recorrências', included: true },
      { text: 'Templates padrão', included: true },
      { text: 'Chat com IA', included: false },
      { text: 'Templates personalizados', included: false },
      { text: 'Central Educacional', included: false },
      { text: 'Recorrências ilimitadas', included: false },
    ],
    cta: 'Começar Grátis',
    highlighted: false,
    stripePrice: null,
  },
  {
    id: 'monthly',
    name: 'Mensal',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Renovação mensal, cancele quando quiser',
    features: [
      { text: 'Lançamentos ilimitados', included: true },
      { text: 'Histórico completo', included: true },
      { text: 'Recorrências ilimitadas', included: true },
      { text: 'Templates padrão', included: true },
      { text: 'Chat com IA', included: true },
      { text: 'Templates personalizados', included: true },
      { text: 'Central Educacional', included: true },
      { text: 'Relatórios comparativos', included: true },
    ],
    cta: 'Assinar Mensal',
    highlighted: false,
    stripePrice: 'monthly',
  },
  {
    id: 'semiannual',
    name: 'Semestral',
    price: 'R$ 149,90',
    period: '/6 meses',
    savings: 16,
    description: 'R$ 24,98/mês - Economize 16%',
    features: [
      { text: 'Lançamentos ilimitados', included: true },
      { text: 'Histórico completo', included: true },
      { text: 'Recorrências ilimitadas', included: true },
      { text: 'Templates padrão', included: true },
      { text: 'Chat com IA', included: true },
      { text: 'Templates personalizados', included: true },
      { text: 'Central Educacional', included: true },
      { text: 'Relatórios comparativos', included: true },
    ],
    cta: 'Assinar Semestral',
    highlighted: true,
    stripePrice: 'semiannual',
  },
  {
    id: 'annual',
    name: 'Anual',
    price: 'R$ 299,90',
    period: '/ano',
    savings: 16,
    description: 'R$ 24,99/mês - Economize 16%',
    features: [
      { text: 'Lançamentos ilimitados', included: true },
      { text: 'Histórico completo', included: true },
      { text: 'Recorrências ilimitadas', included: true },
      { text: 'Templates padrão', included: true },
      { text: 'Chat com IA', included: true },
      { text: 'Templates personalizados', included: true },
      { text: 'Central Educacional', included: true },
      { text: 'Relatórios comparativos', included: true },
    ],
    cta: 'Assinar Anual',
    highlighted: false,
    stripePrice: 'annual',
  },
];

export default function PrecosPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePlanClick = async (plan: typeof plans[0]) => {
    // Se for freemium, redireciona para cadastro
    if (plan.id === 'freemium') {
      router.push('/cadastro');
      return;
    }

    // Se não estiver logado, redireciona para login
    if (status === 'unauthenticated') {
      toast.info('Faça login para assinar o plano Pro');
      router.push('/login');
      return;
    }

    // Se estiver logado, inicia checkout do Stripe
    if (status === 'authenticated' && plan.stripePrice) {
      setLoading(plan.id);
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ plan: plan.stripePrice }),
        });

        const data = await res.json();

        if (data?.url) {
          window.location.href = data.url;
        } else {
          toast.error(data?.error || 'Erro ao iniciar checkout');
          setLoading(null);
        }
      } catch (error) {
        console.error('Erro ao processar checkout:', error);
        toast.error('Erro ao processar pagamento');
        setLoading(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Logo.png" alt="MonexAI" width={40} height={40} />
            <span className="font-bold text-xl text-green-800">MonexAI</span>
          </Link>
          <div className="flex items-center gap-3">
            {status === 'authenticated' ? (
              <Link href="/app/dashboard">
                <Button className="bg-green-700 hover:bg-green-800">Ir para o App</Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost">Entrar</Button>
                </Link>
                <Link href="/cadastro">
                  <Button className="bg-green-700 hover:bg-green-800">Criar Conta</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para suas necessidades
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={`relative transition-all hover:shadow-lg ${
                plan.highlighted
                  ? 'border-green-600 border-2 shadow-xl'
                  : 'border-gray-200'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-green-600">
                    <Crown className="h-3 w-3 mr-1" /> Mais Popular
                  </Badge>
                </div>
              )}
              {plan.savings && !plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="secondary">
                    Economize {plan.savings}%
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-xl mb-2">{plan.name}</CardTitle>
                <div className="mb-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500 text-sm">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="text-sm min-h-[40px]">
                  {plan.description}
                </CardDescription>
              </CardHeader>

              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {feature.included ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? '' : 'text-gray-400'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    plan.highlighted
                      ? 'bg-green-700 hover:bg-green-800'
                      : ''
                  }`}
                  variant={plan.highlighted ? 'default' : 'outline'}
                  onClick={() => handlePlanClick(plan)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Processando...
                    </>
                  ) : (
                    plan.cta
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            Todas as assinaturas Pro incluem os mesmos recursos.
            <br />
            Escolha o período que melhor se adapta ao seu orçamento.
          </p>
          <p className="text-sm text-gray-500">
            Pagamento seguro via Stripe • Cancele quando quiser • Sem multas
          </p>
        </div>
      </main>
    </div>
  );
}