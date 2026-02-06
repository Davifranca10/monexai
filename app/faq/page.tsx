import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    question: 'O que é o MonexAI?',
    answer: 'É uma plataforma de gestão financeira onde você registra manualmente suas receitas e despesas, sem integração bancária. Total privacidade e controle dos seus dados.',
  },
  {
    question: 'Preciso conectar minha conta bancária?',
    answer: 'Não! O MonexAI é 100% manual. Você registra seus lançamentos sem nenhuma integração com bancos ou Open Finance.',
  },
  {
    question: 'Qual a diferença entre Freemium e Pro?',
    answer: 'O plano Freemium oferece até 12 lançamentos/mês, 3 meses de histórico e 3 recorrências. O Pro é ilimitado e inclui Chat com IA, templates personalizados e Central Educacional.',
  },
  {
    question: 'O que é o Chat com IA?',
    answer: 'Exclusivo do plano Pro, permite fazer perguntas sobre suas finanças como "Quanto gastei em alimentação esse mês?" e a IA responde baseada nos seus dados.',
  },
  {
    question: 'Posso cancelar a assinatura?',
    answer: 'Sim! Você pode cancelar a qualquer momento pelo portal de assinatura. Continuará tendo acesso até o fim do período pago.',
  },
  {
    question: 'Meus dados estão seguros?',
    answer: 'Sim! Usamos criptografia, senhas com hash forte e seguimos a LGPD. Você pode exportar ou excluir seus dados a qualquer momento.',
  },
  {
    question: 'O que são recorrências?',
    answer: 'São lançamentos automáticos criados pelo sistema. Por exemplo: aluguel mensal, salário semanal ou compras parceladas.',
  },
  {
    question: 'Posso mudar de modo Pessoal para Empresarial?',
    answer: 'No momento, o modo escolhido no onboarding é definitivo. Cada modo tem categorias e templates específicos.',
  },
];

export default function FAQPage() {
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

      <main className="max-w-3xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Perguntas Frequentes</h1>
          <p className="text-xl text-gray-600">
            Tire suas dúvidas sobre o MonexAI
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-lg flex items-start gap-2">
                  <ChevronDown className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                  {faq.question}
                </h3>
                <p className="text-gray-600 mt-2 ml-7">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">Ainda tem dúvidas?</p>
          <a href="mailto:contato.monexai@gmail.com">
            <Button variant="outline">Fale Conosco</Button>
          </a>
        </div>
      </main>
    </div>
  );
}
