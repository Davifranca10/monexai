import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GraduationCap,
  FileText,
  Scale,
  Building2,
  Calculator,
  AlertTriangle,
  HelpCircle,
  ChevronRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const topics = [
  {
    id: 'o-que-e',
    title: 'O que é a Reforma Tributária',
    description: 'Entenda os conceitos básicos da reforma tributária brasileira',
    icon: FileText,
  },
  {
    id: 'principais-mudancas',
    title: 'Principais Mudanças',
    description: 'Visão geral das alterações no sistema tributário',
    icon: Scale,
  },
  {
    id: 'modelo-atual-vs-novo',
    title: 'Modelo Atual vs Novo Modelo',
    description: 'Comparação conceitual entre os sistemas',
    icon: Calculator,
  },
  {
    id: 'impactos-pequenos-negocios',
    title: 'Impactos para Pequenos Negócios',
    description: 'O que muda para microempreendedores e PMEs',
    icon: Building2,
  },
  {
    id: 'boas-praticas',
    title: 'Boas Práticas de Organização',
    description: 'Dicas para se organizar financeiramente',
    icon: GraduationCap,
  },
  {
    id: 'o-que-nao-muda',
    title: 'O que NÃO Muda',
    description: 'Aspectos que permanecem inalterados',
    icon: AlertTriangle,
  },
  {
    id: 'faq',
    title: 'Perguntas Frequentes',
    description: 'Respostas para as dúvidas mais comuns',
    icon: HelpCircle,
  },
];

export default async function EducacionalPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) redirect('/login');

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro = subscription?.status === 'ACTIVE';

  if (!isPro) {
    redirect('/app/assinatura?upgrade=educacional');
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-100 rounded-lg">
            <GraduationCap className="h-8 w-8 text-green-700" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Central Educacional</h1>
            <p className="text-gray-600">Reforma Tributária Brasileira</p>
          </div>
          <Badge className="ml-auto bg-amber-500">Pro</Badge>
        </div>

        {/* Disclaimer */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="flex gap-3 py-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">Aviso Legal Importante</p>
              <p>
                Este conteúdo é <strong>exclusivamente educacional e informativo</strong>. 
                Não constitui consultoria fiscal, contábil ou jurídica. 
                Sempre consulte um profissional qualificado para orientações específicas.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Topics Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        {topics.map((topic) => (
          <Link
            key={topic.id}
            href={`/app/educacional/reforma-tributaria/${topic.id}`}
          >
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <topic.icon className="h-6 w-6 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1 group-hover:text-green-700 transition-colors">
                      {topic.title}
                    </h3>
                    <p className="text-sm text-gray-600">{topic.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 transition-colors" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="text-center text-sm text-gray-500 mt-8">
        Última atualização: Dezembro de 2025
      </p>
    </div>
  );
}
