import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2, X } from 'lucide-react';

const plans = [
  {
    name: 'Freemium',
    price: 'Grátis',
    description: 'Para começar a organizar suas finanças',
    features: [
      { text: '50 lançamentos/mês', included: true },
      { text: 'Histórico de 3 meses', included: true },
      { text: '3 recorrências', included: true },
      { text: 'Templates padrão', included: true },
      { text: 'Chat com IA', included: false },
      { text: 'Templates personalizados', included: false },
      { text: 'Central Educacional', included: false },
      { text: 'Recorrências ilimitadas', included: false },
    ],
    cta: 'Começar Grátis',
    href: '/cadastro',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: 'R$ 29,90',
    period: '/mês',
    description: 'Tudo que você precisa para controle total',
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
    cta: 'Assinar Pro',
    href: '/cadastro',
    highlighted: true,
  },
];

export default function PrecosPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/Logo.png" alt="MonexAI" width={40} height={40} />
            <span className="font-bold text-xl text-green-800">MonexAI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-green-700 hover:bg-green-800">Criar Conta</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Planos e Preços</h1>
          <p className="text-xl text-gray-600">
            Escolha o plano ideal para suas necessidades
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative ${
                plan.highlighted
                  ? 'border-green-600 border-2 shadow-xl'
                  : ''
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Mais Popular
                  </span>
                </div>
              )}
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <div className="mt-4">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  {plan.period && (
                    <span className="text-gray-500">{plan.period}</span>
                  )}
                </div>
                <CardDescription className="mt-2">
                  {plan.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2">
                      {feature.included ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <X className="h-5 w-5 text-gray-300" />
                      )}
                      <span
                        className={feature.included ? '' : 'text-gray-400'}
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <Button
                    className={`w-full ${
                      plan.highlighted
                        ? 'bg-green-700 hover:bg-green-800'
                        : ''
                    }`}
                    variant={plan.highlighted ? 'default' : 'outline'}
                  >
                    {plan.cta}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}
