import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-white">
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
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-16 prose prose-green">
        <h1>Termos de Uso</h1>
        <p className="lead">Ao usar o MonexAI, você concorda com estes termos.</p>

        <h2>1. Aceitação dos Termos</h2>
        <p>Ao criar uma conta e usar o MonexAI, você aceita estes termos de uso e nossa política de privacidade.</p>

        <h2>2. Descrição do Serviço</h2>
        <p>O MonexAI é uma plataforma de gestão financeira manual, onde você registra receitas e despesas. Não realizamos integração bancária ou Open Finance.</p>

        <h2>3. Conta do Usuário</h2>
        <ul>
          <li>Você é responsável por manter a segurança da sua conta</li>
          <li>Uma conta por pessoa</li>
          <li>Informações devem ser verdadeiras</li>
        </ul>

        <h2>4. Planos e Pagamentos</h2>
        <ul>
          <li>Freemium: gratuito com limitações</li>
          <li>Pro: R$ 29,90/mês, cobrado via Stripe</li>
          <li>Cancelamento a qualquer momento via portal</li>
          <li>Sem reembolso proporcional</li>
        </ul>

        <h2>5. Limitações</h2>
        <p>O MonexAI:</p>
        <ul>
          <li>NÃO fornece consultoria financeira, fiscal ou jurídica</li>
          <li>NÃO substitui contador ou assessor financeiro</li>
          <li>NÃO garante resultados financeiros</li>
        </ul>

        <h2>6. Conteúdo Educacional</h2>
        <p>A Central Educacional sobre Reforma Tributária é meramente informativa e não constitui aconselhamento profissional.</p>

        <h2>7. Uso Proibido</h2>
        <p>É proibido:</p>
        <ul>
          <li>Violar leis ou regulamentos</li>
          <li>Tentar acessar dados de outros usuários</li>
          <li>Usar o serviço para fins ilegais</li>
          <li>Realizar engenharia reversa</li>
        </ul>

        <h2>8. Isenção de Responsabilidade</h2>
        <p>O serviço é fornecido "como está". Não nos responsabilizamos por perdas decorrentes do uso ou interpretação dos dados inseridos.</p>

        <h2>9. Alterações</h2>
        <p>Podemos alterar estes termos. Continuar usando o serviço após alterações significa aceitação.</p>

        <h2>10. Contato</h2>
        <p>Dúvidas: <a href="mailto:contato.monexai@gmail.com">contato.monexai@gmail.com</a></p>

        <p className="text-sm text-gray-500 mt-8">Última atualização: Dezembro de 2025</p>
      </main>
    </div>
  );
}
