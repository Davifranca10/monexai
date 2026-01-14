'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { User, Building2, Loader2, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

export default function OnboardingPage() {
  const { data: session, update } = useSession() || {};
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'PERSONAL' | 'BUSINESS' | null>(null);
  const isSubmitting = useRef(false); // Previne duplo clique

  // Se o usuário já tiver perfil na sessão, manda ele direto pro dashboard
  useEffect(() => {
    if (session?.user?.mode) {
      router.replace('/app/dashboard');
    }
  }, [session, router]);

  const handleContinue = async () => {
    // Previne múltiplos cliques
    if (isSubmitting.current) {
      console.log('Já está processando, ignorando clique duplicado');
      return;
    }

    if (!selectedMode) {
      toast.error('Selecione um modo');
      return;
    }

    isSubmitting.current = true;
    setLoading(true);

    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: selectedMode }),
      });

      const data = await res.json().catch(() => ({}));

      // Caso 1: Perfil já existe no banco - redirecionar direto
      if (res.status === 400 && data?.error === 'Perfil já configurado') {
        toast.info('Você já tem um perfil configurado. Redirecionando...');
        router.replace('/app/dashboard');
        return;
      }

      // Caso 2: Não autorizado (sessão expirada) - pedir login
      if (res.status === 401) {
        toast.error('Sessão expirada. Faça login novamente.');
        router.replace('/login');
        return;
      }

      // Caso 3: Sucesso - perfil criado agora
      if (res.ok) {
        toast.success('Perfil criado com sucesso!');
        
        // Atualiza a sessão de forma não-bloqueante
        if (typeof update === 'function') {
          update({ mode: selectedMode }).catch((err) => {
            console.warn('Falha ao atualizar sessão local:', err);
          });
        }

        // Redireciona IMEDIATAMENTE sem esperar a sessão atualizar
        router.replace('/app/dashboard');
        return;
      }

      // Outros erros
      toast.error(data?.error || 'Erro ao configurar perfil');
      isSubmitting.current = false; // Libera para tentar novamente apenas em caso de erro
    } catch (error) {
      console.error('Onboarding error (client):', error);
      toast.error('Erro ao configurar perfil');
      isSubmitting.current = false; // Libera para tentar novamente apenas em caso de erro
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <Image
            src="/Logo.png"
            alt="MonexAI"
            width={64}
            height={64}
            className="mx-auto mb-4"
          />
          <h1 className="text-3xl font-bold text-gray-900">Bem-vindo ao MonexAI!</h1>
          <p className="text-gray-600 mt-2">
            Escolha como deseja usar a plataforma. Esta escolha é definitiva.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === 'PERSONAL'
                ? 'ring-2 ring-green-600 bg-green-50'
                : ''
            } ${loading ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => !loading && setSelectedMode('PERSONAL')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <User className="h-8 w-8 text-green-700" />
              </div>
              <CardTitle>Modo Pessoal</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Ideal para controle de finanças pessoais. Categorias como
                Alimentação, Moradia, Transporte, Saúde, etc.
              </CardDescription>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-lg ${
              selectedMode === 'BUSINESS'
                ? 'ring-2 ring-green-600 bg-green-50'
                : ''
            } ${loading ? 'pointer-events-none opacity-50' : ''}`}
            onClick={() => !loading && setSelectedMode('BUSINESS')}
          >
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
                <Building2 className="h-8 w-8 text-green-700" />
              </div>
              <CardTitle>Modo Empresarial</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Para negócios e empreendedores. Categorias como Fornecedores,
                Marketing, Impostos, Vendas, etc.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            className="bg-green-700 hover:bg-green-800"
            onClick={handleContinue}
            disabled={!selectedMode || loading}
          >
            {loading ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Configurando...</>
            ) : (
              <>Continuar <ArrowRight className="ml-2 h-5 w-5" /></>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}