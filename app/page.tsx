import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Wallet, BarChart3, Repeat, Bot, Shield, Sparkles,
  ArrowRight, CheckCircle2 
} from 'lucide-react';

const features = [
  {
    icon: Wallet,
    title: 'Lançamentos Manuais',
    description: 'Registre receitas e despesas de forma simples e organizada',
  },
  {
    icon: Repeat,
    title: 'Recorrências Automáticas',
    description: 'Configure pagamentos recorrentes e parcelados',
  },
  {
    icon: BarChart3,
    title: 'Dashboard Intuitivo',
    description: 'Visualize suas finanças com gráficos e relatórios',
  },
  {
    icon: Bot,
    title: 'Chat com IA',
    description: 'Tire dúvidas sobre suas finanças com inteligência artificial',
  },
  {
    icon: Shield,
    title: 'Segurança Total',
    description: 'Seus dados protegidos com criptografia e LGPD',
  },
  {
    icon: Sparkles,
    title: 'Templates Inteligentes',
    description: 'Use templates prontos ou crie os seus (Pro)',
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/Logo.png"
              alt="MonexAI"
              width={40}
              height={40}
              className="rounded-lg"
            />
            <span className="font-bold text-xl text-green-800">MonexAI</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/precos" className="text-gray-600 hover:text-green-700">
              Preços
            </Link>
            <Link href="/faq" className="text-gray-600 hover:text-green-700">
              FAQ
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost">Entrar</Button>
            </Link>
            <Link href="/cadastro">
              <Button className="bg-green-700 hover:bg-green-800">
                Criar Conta
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-20 text-center">
        <div className="mb-6">
          <span className="inline-block px-4 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            Gestão Financeira Simplificada
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Controle suas finanças com{' '}
          <span className="text-green-600">inteligência</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Organize receitas, despesas e recorrências de forma manual e segura.
          Sem integração bancária, total privacidade.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/cadastro">
            <Button size="lg" className="bg-green-700 hover:bg-green-800 w-full sm:w-auto">
              Começar Grátis <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          <Link href="/precos">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Ver Planos
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Tudo que você precisa para organizar suas finanças
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <feature.icon className="h-10 w-10 text-green-600 mb-4" />
                <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="bg-green-800 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Plano Pro por apenas</h2>
          <p className="text-5xl font-bold mb-4">
            R$ 29,90<span className="text-lg font-normal">/mês</span>
          </p>
          <ul className="inline-flex flex-col items-start gap-2 mb-8">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Chat com IA
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Templates ilimitados
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Recorrências ilimitadas
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" /> Central Educacional
            </li>
          </ul>
          <Link href="/cadastro">
            <Button size="lg" className="bg-white text-green-800 hover:bg-gray-100">
              Começar Agora
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <Image src="/Logo.png" alt="MonexAI" width={32} height={32} />
            <span className="font-semibold text-green-800">MonexAI</span>
          </div>
          <nav className="flex gap-6 text-sm text-gray-600">
            <Link href="/privacidade" className="hover:text-green-700">Privacidade</Link>
            <Link href="/termos" className="hover:text-green-700">Termos</Link>
          </nav>
          <p className="text-sm text-gray-500">
            © 2025 MonexAI. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
