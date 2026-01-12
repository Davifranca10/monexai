import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, AlertTriangle, Download } from 'lucide-react';

export const dynamic = 'force-dynamic';

const topicsContent: Record<string, { title: string; content: string }> = {
  'o-que-e': {
    title: 'O que é a Reforma Tributária',
    content: `A Reforma Tributária brasileira é uma das maiores transformações do sistema de impostos do país nas últimas décadas.

**Objetivo Principal**
Simplificar o sistema tributário brasileiro, que é considerado um dos mais complexos do mundo.

**O que está mudando?**
- Unificação de impostos sobre consumo
- Criação do IVA (Imposto sobre Valor Agregado) dual
- Fim de diversos impostos atuais como ICMS, ISS, IPI, PIS e COFINS
- Criação da CBS (federal) e IBS (estadual/municipal)

**Transição**
A mudança será gradual, com período de transição de vários anos para adaptação.

**Por que importa?**
- Impacta diretamente o preço de produtos e serviços
- Muda a forma como empresas calculam impostos
- Pode alterar a carga tributária de diferentes setores`,
  },
  'principais-mudancas': {
    title: 'Principais Mudanças',
    content: `**Impostos que serão extintos:**
- ICMS (Imposto sobre Circulação de Mercadorias)
- ISS (Imposto sobre Serviços)
- IPI (Imposto sobre Produtos Industrializados)
- PIS (Programa de Integração Social)
- COFINS (Contribuição para Financiamento da Seguridade Social)

**Novos impostos:**

*CBS (Contribuição sobre Bens e Serviços)*
- Âmbito federal
- Substitui PIS e COFINS

*IBS (Imposto sobre Bens e Serviços)*
- Âmbito estadual e municipal
- Substitui ICMS e ISS

*IS (Imposto Seletivo)*
- "Imposto do pecado"
- Incide sobre produtos prejudiciais à saúde e meio ambiente

**Mudança Fundamental:**
Tributação no DESTINO (onde o produto/serviço é consumido), não mais na ORIGEM.`,
  },
  'modelo-atual-vs-novo': {
    title: 'Modelo Atual vs Novo Modelo',
    content: `**Sistema Atual (Complexo)**

| Característica | Sistema Atual |
|---------------|---------------|
| Número de impostos | Diversos (5+ sobre consumo) |
| Legislação | Cada estado/município tem regras próprias |
| Cobrança | Na origem |
| Cumulatividade | Parcialmente cumulativo |
| Créditos | Complexo e restrito |

**Sistema Novo (Simplificado)**

| Característica | Novo Sistema |
|---------------|---------------|
| Número de impostos | 2 principais (CBS + IBS) |
| Legislação | Nacional unificada |
| Cobrança | No destino |
| Cumulatividade | Não-cumulativo |
| Créditos | Amplo e simplificado |

**Benefícios Esperados:**
- Redução do "Custo Brasil"
- Fim da guerra fiscal entre estados
- Maior transparência
- Simplificação de obrigações`,
  },
  'impactos-pequenos-negocios': {
    title: 'Impactos para Pequenos Negócios',
    content: `**Simples Nacional Mantido**
O regime do Simples Nacional continua existindo para micro e pequenas empresas.

**O que pode mudar para MEIs e MPEs:**

*Positivo:*
- Simplificação de cálculo de impostos
- Menos obrigações acessórias
- Redução de custos com compliance
- Maior previsibilidade tributária

*Atenção:*
- Período de adaptação aos novos sistemas
- Possível necessidade de atualizar sistemas
- Capacitação necessária

**Recomendações:**
1. Mantenha-se informado sobre o cronograma
2. Converse com seu contador
3. Organize sua contabilidade
4. Planeje recursos para possíveis adaptações
5. Participe de capacitações oferecidas`,
  },
  'boas-praticas': {
    title: 'Boas Práticas de Organização',
    content: `**1. Organize sua Contabilidade**
- Mantenha registros atualizados
- Separe finanças pessoais das empresariais
- Guarde documentos fiscais pelo prazo legal

**2. Fluxo de Caixa**
- Registre todas as entradas e saídas
- Projete pagamentos de impostos
- Mantenha reserva para obrigações fiscais

**3. Acompanhe as Mudanças**
- Siga fontes oficiais de informação
- Participe de eventos e capacitações
- Mantenha contato próximo com seu contador

**4. Planejamento**
- Antecipe possíveis impactos no seu negócio
- Avalie se seu sistema de gestão precisará de atualização
- Considere custos de adaptação no planejamento

**5. Use Ferramentas**
- Utilize sistemas de gestão financeira (como o MonexAI!)
- Automatize registros quando possível
- Gere relatórios regulares`,
  },
  'o-que-nao-muda': {
    title: 'O que NÃO Muda',
    content: `**Impostos que permanecem:**

*Imposto de Renda (IR)*
- Pessoa Física e Jurídica
- Continua com as regras atuais

*INSS/Contribuições Previdenciárias*
- Mantém estrutura atual
- Trabalhador e empregador

*IPTU e IPVA*
- Impostos sobre propriedade
- Continuam com estados e municípios

*ITBI e ITCMD*
- Impostos sobre transmissão
- Mantidos nas esferas atuais

**Regimes Especiais Mantidos:**
- Simples Nacional
- Zona Franca de Manaus (com adaptações)
- Alguns setores com tratamento diferenciado

**O que permanece igual:**
- Obrigação de emissão de notas fiscais
- Necessidade de contabilidade organizada
- Responsabilidade pelo pagamento de tributos`,
  },
  'faq': {
    title: 'Perguntas Frequentes',
    content: `**Quando a reforma começa a valer?**
A transição é gradual, iniciando em 2026 e se estendendo até 2033.

**Vou pagar mais ou menos impostos?**
Depende do setor. A reforma busca neutralidade de carga, mas alguns setores podem ter aumento e outros redução.

**O Simples Nacional vai acabar?**
Não. O Simples Nacional continua para micro e pequenas empresas.

**Preciso mudar meu sistema de gestão?**
Provavelmente será necessário atualizar sistemas para se adequar às novas regras.

**Como acompanhar as mudanças?**
- Portal do Governo Federal
- Receita Federal
- Sebrae
- Seu contador

**O que devo fazer agora?**
1. Manter contabilidade organizada
2. Conversar com seu contador
3. Acompanhar as regulações
4. Não tomar decisões precipitadas

**Posso me preparar antecipadamente?**
Sim! Organização financeira e contabilídade em dia são a melhor preparação.`,
  },
};

export default async function TopicoPage({
  params,
}: {
  params: { topico: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  if (!userId) redirect('/login');

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  if (subscription?.status !== 'ACTIVE') {
    redirect('/app/assinatura?upgrade=educacional');
  }

  const topic = topicsContent[params?.topico ?? ''];

  if (!topic) {
    notFound();
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Link href="/app/educacional/reforma-tributaria">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </Link>

      <h1 className="text-3xl font-bold mb-6">{topic.title}</h1>

      {/* Disclaimer */}
      <Card className="bg-amber-50 border-amber-200 mb-6">
        <CardContent className="flex gap-3 py-4">
          <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0" />
          <p className="text-sm text-amber-800">
            Conteúdo educacional. Não substitui consultoria profissional.
          </p>
        </CardContent>
      </Card>

      {/* Content */}
      <Card>
        <CardContent className="pt-6 prose prose-green max-w-none">
          <div
            dangerouslySetInnerHTML={{
              __html: topic.content
                .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                .replace(/\*(.+?)\*/g, '<em>$1</em>')
                .replace(/\n\n/g, '</p><p>')
                .replace(/\n-/g, '<br/>-')
                .replace(/^/, '<p>')
                .replace(/$/, '</p>'),
            }}
          />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-gray-500 mt-8">
        Última atualização: Dezembro de 2025
      </p>
    </div>
  );
}
