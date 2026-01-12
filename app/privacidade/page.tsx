import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function PrivacidadePage() {
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
        <h1>Política de Privacidade</h1>
        <p className="lead">Esta política descreve como coletamos, usamos e protegemos seus dados pessoais.</p>
        
        <h2>1. Dados Coletados</h2>
        <p>Coletamos apenas os dados necessários para o funcionamento do serviço:</p>
        <ul>
          <li>Nome e email (para identificação e login)</li>
          <li>Dados financeiros inseridos manualmente (receitas, despesas, recorrências)</li>
          <li>Preferências de uso (modo pessoal/empresarial)</li>
        </ul>

        <h2>2. Uso dos Dados</h2>
        <p>Seus dados são utilizados exclusivamente para:</p>
        <ul>
          <li>Fornecer e melhorar o serviço</li>
          <li>Gerar relatórios e análises pessoais</li>
          <li>Permitir que a IA responda perguntas sobre suas finanças (plano Pro)</li>
        </ul>

        <h2>3. Compartilhamento</h2>
        <p>NÃO vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto:</p>
        <ul>
          <li>Processadores de pagamento (Stripe) para gestão de assinaturas</li>
          <li>Quando exigido por lei</li>
        </ul>

        <h2>4. Segurança</h2>
        <p>Implementamos medidas de segurança:</p>
        <ul>
          <li>Criptografia de dados em trânsito (HTTPS)</li>
          <li>Senhas armazenadas com hash forte (bcrypt)</li>
          <li>Isolamento de dados por usuário</li>
          <li>Cookies seguros</li>
        </ul>

        <h2>5. Seus Direitos (LGPD)</h2>
        <p>Você tem direito a:</p>
        <ul>
          <li>Acessar seus dados</li>
          <li>Exportar seus dados</li>
          <li>Corrigir informações</li>
          <li>Excluir sua conta e todos os dados</li>
        </ul>
        <p>Para exercer esses direitos, acesse Configurações no app ou entre em contato: <a href="mailto:contato.monexai@gmail.com">contato.monexai@gmail.com</a></p>

        <h2>6. Alterações</h2>
        <p>Esta política pode ser atualizada. Notificaremos sobre mudanças significativas.</p>

        <p className="text-sm text-gray-500 mt-8">Última atualização: Dezembro de 2025</p>
      </main>
    </div>
  );
}
