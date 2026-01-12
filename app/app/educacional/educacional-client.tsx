'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import {
  BookOpen, TrendingUp, Building2, Calendar, CheckCircle2, XCircle,
  Lightbulb, HelpCircle, AlertTriangle, ArrowRight, Shield, Target,
  Users, Wallet, FileText, Clock, Star, Zap, Home, Heart, Sparkles,
  ShoppingCart, Briefcase, CircleDollarSign, Ban, RefreshCw, Gift, Info
} from 'lucide-react';
import Image from 'next/image';

export function EducacionalClient() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-12 max-w-5xl mx-auto">
      {/* A) Seção de Abertura */}
      <section className="text-center space-y-6">
        <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 text-sm px-4 py-1">
          <Star className="h-4 w-4 mr-1" /> Exclusivo Pro
        </Badge>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
          Entenda a Reforma Tributária<br/>
          <span className="text-emerald-600">de forma simples</span>
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Este conteúdo foi feito para você que não é contador, não é advogado, mas quer entender
          o que está mudando nos impostos do Brasil — sem complicação.
        </p>
        
        <div className="relative w-full max-w-md mx-auto aspect-[16/10] bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/30 dark:to-emerald-800/20 rounded-2xl overflow-hidden flex items-center justify-center">
          <div className="flex gap-4 items-end">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-lg">
              <CircleDollarSign className="h-12 w-12 text-emerald-600 mx-auto" />
              <p className="text-xs mt-2 font-medium">Impostos</p>
            </div>
            <ArrowRight className="h-8 w-8 text-emerald-500" />
            <div className="bg-emerald-600 text-white rounded-xl p-4 shadow-lg">
              <Sparkles className="h-12 w-12 mx-auto" />
              <p className="text-xs mt-2 font-medium">Simplificado</p>
            </div>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded-xl p-6 max-w-xl mx-auto">
          <h3 className="font-semibold text-emerald-800 dark:text-emerald-200 mb-3">O que você vai aprender aqui:</h3>
          <ul className="text-left space-y-2 text-emerald-700 dark:text-emerald-300 text-sm">
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> O que é a Reforma Tributária</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> O que muda (e o que não muda) na prática</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> Como se organizar financeiramente</li>
            <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 flex-shrink-0" /> Dicas para pequenos negócios</li>
          </ul>
        </div>
      </section>

      {/* B) O que é a Reforma Tributária */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 dark:bg-emerald-900 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold">O que é a Reforma Tributária?</h2>
        </div>

        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/30 dark:to-gray-900">
          <CardContent className="pt-6 space-y-4">
            <p className="text-lg leading-relaxed">
              Imagine que hoje, ao comprar um produto ou contratar um serviço, você paga vários impostos
              diferentes, cada um com suas regras. É como ter <strong>5 contas de luz diferentes</strong>,
              cada uma vindo de um lugar.
            </p>
            <p className="text-lg leading-relaxed">
              A Reforma Tributária vai <span className="text-emerald-600 font-semibold">juntar esses impostos em poucos</span>,
              tornando tudo mais simples e transparente. Você ainda paga impostos, mas de forma mais clara.
            </p>
            <p className="text-lg leading-relaxed">
              O objetivo não é aumentar impostos, e sim <span className="font-semibold">organizar melhor</span> o sistema
              que temos hoje.
            </p>
          </CardContent>
        </Card>

        {/* Mind Map: Antes e Depois */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-red-200 dark:border-red-800">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <XCircle className="h-5 w-5 text-red-500" />
                <h3 className="font-bold text-red-800 dark:text-red-300">ANTES (Atual)</h3>
              </div>
              <div className="relative bg-red-50 dark:bg-red-950/30 rounded-xl p-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {['PIS', 'COFINS', 'ICMS', 'ISS', 'IPI'].map((imp) => (
                    <div key={imp} className="bg-white dark:bg-gray-800 border border-red-300 rounded-lg px-3 py-2 text-sm font-medium">
                      {imp}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-red-700 dark:text-red-300">5 impostos diferentes, cada um com suas regras</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200 dark:border-emerald-800">
            <CardContent className="pt-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-emerald-800 dark:text-emerald-300">DEPOIS (Novo)</h3>
              </div>
              <div className="relative bg-emerald-50 dark:bg-emerald-950/30 rounded-xl p-4">
                <div className="flex flex-wrap justify-center gap-2">
                  {['IBS', 'CBS'].map((imp) => (
                    <div key={imp} className="bg-emerald-600 text-white rounded-lg px-4 py-2 text-sm font-bold">
                      {imp}
                    </div>
                  ))}
                </div>
                <p className="mt-4 text-sm text-emerald-700 dark:text-emerald-300">2 impostos principais, regras unificadas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exemplo do dia a dia */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <ShoppingCart className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">Exemplo: Compra no supermercado</h4>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  Hoje, quando você compra arroz, feijão e carne, cada produto pode ter uma combinação diferente
                  de impostos (ICMS, PIS, COFINS). Com a reforma, todos terão o mesmo tratamento simplificado,
                  e você verá claramente na nota fiscal quanto está pagando de imposto.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* C) Por que a Reforma foi criada */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-amber-100 dark:bg-amber-900 p-2 rounded-lg">
            <HelpCircle className="h-6 w-6 text-amber-600" />
          </div>
          <h2 className="text-2xl font-bold">Por que a Reforma Tributária foi criada?</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300 text-lg">
          O Brasil tem um dos sistemas tributários mais complexos do mundo.
          Empresas gastam <strong>1.500 horas por ano</strong> só para cumprir obrigações fiscais.
        </p>

        {/* Quadro Problema vs Solução */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-red-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" /> Problemas do sistema atual
              </h3>
              <div className="space-y-3">
                {[
                  { icon: FileText, text: 'Muitos impostos diferentes' },
                  { icon: Clock, text: 'Burocracia excessiva' },
                  { icon: HelpCircle, text: 'Falta de clareza nos valores' },
                  { icon: Building2, text: 'Guerra fiscal entre estados' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                    <item.icon className="h-5 w-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-emerald-200">
            <CardContent className="pt-6">
              <h3 className="font-bold text-emerald-800 dark:text-emerald-200 mb-4 flex items-center gap-2">
                <Target className="h-5 w-5" /> Soluções da reforma
              </h3>
              <div className="space-y-3">
                {[
                  { icon: Sparkles, text: 'Menos impostos, mais simplicidade' },
                  { icon: Clock, text: 'Menos papelada e obrigações' },
                  { icon: CheckCircle2, text: 'Transparência total na nota' },
                  { icon: Users, text: 'Regras iguais para todo o país' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                    <item.icon className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                    <span className="text-sm">{item.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* D) O que muda na prática */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
            <RefreshCw className="h-6 w-6 text-purple-600" />
          </div>
          <h2 className="text-2xl font-bold">O que muda na prática?</h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { icon: FileText, title: 'Novos nomes de impostos', desc: 'IBS e CBS substituem PIS, COFINS, ICMS e ISS. Menos impostos para lembrar.' },
            { icon: Target, title: 'Imposto no destino', desc: 'O imposto vai para onde o produto é consumido, não onde é fabricado. Mais justo.' },
            { icon: CheckCircle2, title: 'Nota fiscal clara', desc: 'Você verá exatamente quanto paga de imposto em cada compra.' },
            { icon: Gift, title: 'Cashback para famílias', desc: 'Famílias de baixa renda podem receber de volta parte dos impostos.' },
          ].map((item, i) => (
            <Card key={i} className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-gray-900">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100 dark:bg-purple-900 p-2 rounded-lg">
                    <item.icon className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{item.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Fluxograma simples */}
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="pt-6">
            <h4 className="font-semibold mb-4 text-center">Como funciona o novo sistema</h4>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border w-full sm:w-auto">
                <ShoppingCart className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Você compra</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 sm:rotate-0" />
              <div className="bg-emerald-100 dark:bg-emerald-900 rounded-lg p-4 shadow-sm w-full sm:w-auto">
                <CircleDollarSign className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-medium">IBS + CBS (unificados)</p>
              </div>
              <ArrowRight className="h-6 w-6 text-gray-400 rotate-90 sm:rotate-0" />
              <div className="bg-blue-100 dark:bg-blue-900 rounded-lg p-4 shadow-sm w-full sm:w-auto">
                <FileText className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-sm font-medium">Nota clara</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* E) O que NÃO muda */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Ban className="h-6 w-6 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold">O que NÃO muda</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          Fique tranquilo! Algumas coisas importantes permanecem como estão:
        </p>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Imposto de Renda', desc: 'Continua igual para pessoa física e jurídica' },
            { title: 'Simples Nacional', desc: 'MEIs e pequenas empresas mantêm tratamento especial' },
            { title: 'IPTU e IPVA', desc: 'Impostos sobre propriedade não mudam' },
            { title: 'Cesta básica', desc: 'Itens essenciais terão alíquota zero' },
          ].map((item, i) => (
            <Card key={i} className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
              <CardContent className="pt-4 pb-4 text-center">
                <Badge className="bg-blue-600 mb-2">Não muda</Badge>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* F) Modelo atual vs modelo novo */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-orange-100 dark:bg-orange-900 p-2 rounded-lg">
            <TrendingUp className="h-6 w-6 text-orange-600" />
          </div>
          <h2 className="text-2xl font-bold">Modelo atual vs modelo novo</h2>
        </div>

        <Card>
          <CardContent className="pt-6 overflow-x-auto">
            <table className="w-full min-w-[500px]">
              <thead>
                <tr>
                  <th className="text-left py-3 px-4 bg-gray-100 dark:bg-gray-800 rounded-tl-lg">Aspecto</th>
                  <th className="text-center py-3 px-4 bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-200">Sistema Atual</th>
                  <th className="text-center py-3 px-4 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-200 rounded-tr-lg">Sistema Novo</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { aspect: 'Quantidade de impostos', old: '5 impostos principais', new: '2 principais + 1 seletivo' },
                  { aspect: 'Complexidade', old: 'Muito alta', new: 'Simplificada' },
                  { aspect: 'Transparência', old: 'Baixa (valores escondidos)', new: 'Alta (valor claro na nota)' },
                  { aspect: 'Regras', old: 'Variam por estado/cidade', new: 'Iguais em todo o país' },
                  { aspect: 'Base de cálculo', old: 'Diferentes para cada imposto', new: 'Unificada' },
                  { aspect: 'Burocracia', old: '1.500+ horas/ano', new: 'Significativamente menor' },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="py-3 px-4 font-medium text-sm">{row.aspect}</td>
                    <td className="py-3 px-4 text-center text-sm text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/20">{row.old}</td>
                    <td className="py-3 px-4 text-center text-sm text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/20">{row.new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        <div className="grid grid-cols-3 gap-4 text-center">
          <Card className="bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="py-6">
              <p className="text-3xl font-bold text-emerald-600">-70%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">complexidade</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="py-6">
              <p className="text-3xl font-bold text-emerald-600">1</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">nota clara</p>
            </CardContent>
          </Card>
          <Card className="bg-emerald-50 dark:bg-emerald-950/30">
            <CardContent className="py-6">
              <p className="text-3xl font-bold text-emerald-600">100%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">transparência</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* G) Impactos para pequenos negócios */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-100 dark:bg-indigo-900 p-2 rounded-lg">
            <Building2 className="h-6 w-6 text-indigo-600" />
          </div>
          <h2 className="text-2xl font-bold">Impactos para pequenos negócios</h2>
        </div>

        <Card className="bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-3">
              <Heart className="h-6 w-6 text-emerald-600" />
              <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Boa notícia para MEIs!</h3>
            </div>
            <p className="text-emerald-700 dark:text-emerald-300">
              O Simples Nacional continua existindo! Se você é MEI ou tem uma pequena empresa no Simples,
              vai continuar com o tratamento diferenciado que já tem.
            </p>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <Card className="border-emerald-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <Star className="h-5 w-5 text-yellow-500" /> Vantagens
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  'Menos burocracia fiscal',
                  'Créditos tributários mais simples',
                  'Competição mais justa entre estados',
                  'Menos erros em obrigações',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="border-amber-200">
            <CardContent className="pt-6">
              <h4 className="font-semibold flex items-center gap-2 mb-4">
                <AlertTriangle className="h-5 w-5 text-amber-500" /> Pontos de atenção
              </h4>
              <ul className="space-y-2 text-sm">
                {[
                  'Período de transição longo (até 2033)',
                  'Sistemas precisam se adaptar',
                  'Contadores precisam se atualizar',
                  'Novas regras para aprender',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Exemplo prático */}
        <Card className="bg-gray-50 dark:bg-gray-900">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <Briefcase className="h-6 w-6 text-indigo-600" />
              <h4 className="font-semibold">Exemplo: Lojinha de roupas da Maria</h4>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg">
                <p className="font-medium text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" /> Hoje
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Maria lida com ICMS diferente em cada estado, calcula PIS/COFINS separadamente,
                  emite notas com várias informações confusas.
                </p>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 rounded-lg">
                <p className="font-medium text-emerald-800 dark:text-emerald-200 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" /> Depois
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Maria terá um único imposto unificado (IBS+CBS), regras iguais para todo o Brasil,
                  nota fiscal simples e clara.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* H) ATENÇÃO: SPLIT Payment - Ponto Crítico */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">ATENÇÃO: Split Payment - O que você precisa saber</h2>
        </div>

        <Card className="border-red-300 bg-red-50 dark:bg-red-950/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-bold text-red-900 dark:text-red-100 text-lg mb-2">
                  Este é um ponto negativo importante da reforma
                </h3>
                <p className="text-red-800 dark:text-red-200">
                  A Reforma Tributária não é só positiva. Um dos pontos mais críticos é o <strong>Split Payment</strong>,
                  que afeta diretamente prestadores de serviço, autônomos e profissionais sem CLT.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                O que é o Split Payment?
              </h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                É um sistema onde <strong>o imposto é retido na hora do pagamento</strong>. Isso significa que
                quando você recebe um pagamento pelos seus serviços, o imposto já é separado automaticamente
                <strong> antes mesmo do dinheiro chegar na sua conta</strong>.
              </p>
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Exemplo:</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Cliente pagou:</span>
                    <span className="font-semibold">R$ 1.000,00</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-red-600">
                    <span>Imposto retido (27%):</span>
                    <span className="font-semibold">- R$ 270,00</span>
                  </div>
                  <div className="border-t pt-2 flex items-center justify-between font-bold">
                    <span>Você recebe:</span>
                    <span className="text-emerald-600">R$ 730,00</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-amber-300">
            <CardContent className="pt-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5 text-amber-600" />
                Quem é afetado?
              </h3>
              <div className="space-y-3">
                {[
                  'Eletricistas',
                  'Encanadores',
                  'Faxineiras',
                  'Diaristas',
                  'Cabeleireiros',
                  'Manicures',
                  'Pintores',
                  'Freelancers',
                  'Profissionais autônomos sem CNPJ',
                ].map((prof, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-amber-500 rounded-full" />
                    <span>{prof}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Problema do limite de R$ 5.000 */}
        <Card className="border-red-300">
          <CardContent className="pt-6">
            <h3 className="font-bold text-red-800 dark:text-red-200 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Problema sério: Limite de R$ 5.000
            </h3>
            <div className="bg-red-50 dark:bg-red-950/30 p-4 rounded-lg mb-4">
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                Se você é <strong>pessoa física</strong> prestando serviços e ganha <strong>acima de R$ 5.000 por mês</strong>,
                você será <span className="text-red-600 font-semibold">mais taxado do que se fosse Pessoa Jurídica</span>.
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-red-600 mb-2">Como Pessoa Física</p>
                  <p className="text-2xl font-bold text-red-600">Até 27%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">de imposto sobre seus serviços</p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-xs font-semibold text-emerald-600 mb-2">Como Pessoa Jurídica (MEI/ME)</p>
                  <p className="text-2xl font-bold text-emerald-600">6% a 15%</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">dependendo do regime escolhido</p>
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Resultado:</strong> Muitos profissionais vão precisar abrir CNPJ para não perder muito dinheiro em impostos.
            </p>
          </CardContent>
        </Card>

        {/* Dicas de organização */}
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950/30 dark:to-emerald-900/20 border-emerald-300">
          <CardContent className="pt-6">
            <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-4 flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-emerald-600" />
              Como se proteger e pagar menos impostos
            </h3>
            <div className="space-y-4">
              {[
                {
                  num: 1,
                  title: 'Considere abrir um CNPJ (MEI ou ME)',
                  desc: 'Se você ganha mais de R$ 5.000/mês, abrir um CNPJ pode reduzir seus impostos de 27% para 6-15%. Vale muito a pena.',
                },
                {
                  num: 2,
                  title: 'Organize-se como Pessoa Jurídica',
                  desc: 'MEI paga apenas R$ 70-75 por mês. Microempresa no Simples Nacional paga entre 6% e 15% dependendo do faturamento.',
                },
                {
                  num: 3,
                  title: 'Separe suas contas',
                  desc: 'Tenha uma conta bancária só para o negócio. Não misture dinheiro pessoal com profissional.',
                },
                {
                  num: 4,
                  title: 'Guarde dinheiro para impostos',
                  desc: 'Reserve pelo menos 30% de cada pagamento para impostos e despesas do negócio. Não gaste tudo.',
                },
                {
                  num: 5,
                  title: 'Converse com um contador',
                  desc: 'Um contador pode te mostrar qual regime tributário é melhor para você: MEI, Simples Nacional ou outro.',
                },
                {
                  num: 6,
                  title: 'Planeje a transição',
                  desc: 'A reforma começa em 2026 e vai até 2033. Use esse tempo para se organizar e se formalizar.',
                },
              ].map((dica) => (
                <div key={dica.num} className="bg-white dark:bg-gray-800 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className="bg-emerald-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {dica.num}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{dica.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{dica.desc}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Comparação de cenários */}
        <Card>
          <CardContent className="pt-6">
            <h3 className="font-bold mb-4">Comparação: Vale a pena abrir CNPJ?</h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Cenário</th>
                    <th className="text-center py-3 px-4">Faturamento mensal</th>
                    <th className="text-center py-3 px-4">Como PF (27%)</th>
                    <th className="text-center py-3 px-4 bg-emerald-50 dark:bg-emerald-950/30">Como PJ MEI/ME</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  <tr>
                    <td className="py-3 px-4 font-medium">Prestador iniciante</td>
                    <td className="py-3 px-4 text-center">R$ 3.000</td>
                    <td className="py-3 px-4 text-center text-red-600 font-semibold">R$ 810</td>
                    <td className="py-3 px-4 text-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-semibold">
                      R$ 70 (MEI)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Prestador médio</td>
                    <td className="py-3 px-4 text-center">R$ 6.000</td>
                    <td className="py-3 px-4 text-center text-red-600 font-semibold">R$ 1.620</td>
                    <td className="py-3 px-4 text-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-semibold">
                      R$ 360-540 (Simples)
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-medium">Prestador consolidado</td>
                    <td className="py-3 px-4 text-center">R$ 10.000</td>
                    <td className="py-3 px-4 text-center text-red-600 font-semibold">R$ 2.700</td>
                    <td className="py-3 px-4 text-center bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 font-semibold">
                      R$ 600-1.100 (Simples)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              * Valores aproximados. MEI tem limite de R$ 81.000/ano. Simples Nacional varia conforme atividade.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-amber-50 dark:bg-amber-950/30 border-amber-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-6 w-6 text-amber-600 flex-shrink-0 mt-1" />
              <div>
                <h4 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">Resumo importante</h4>
                <ul className="space-y-2 text-sm text-amber-800 dark:text-amber-200">
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>O Split Payment retém o imposto <strong>antes</strong> de você receber o pagamento</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Taxação de até <strong>27%</strong> para pessoa física</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Se você ganha mais de <strong>R$ 5.000/mês</strong>, considere abrir CNPJ</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>MEI ou Simples Nacional pagam <strong>muito menos</strong> impostos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold">•</span>
                    <span>Use o MonexAI para organizar suas finanças e ver se vale a pena se formalizar</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* IMPORTANTE: Aumento Gradual da Taxação */}
        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-300">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Clock className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  ATENÇÃO: A taxa não começa em 27% de imediato!
                </h4>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-lg mb-3">
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    A porcentagem de <strong>27% é o valor máximo</strong> que será atingido gradualmente.
                    <span className="text-blue-600 font-semibold"> Não é aplicada de uma vez no dia 1º de janeiro</span>.
                  </p>
                  <p className="text-gray-700 dark:text-gray-300">
                    <strong>Como funciona:</strong> A partir de 2026, a alíquota do Split Payment começará <strong>baixa</strong> 
                    e irá <strong>aumentando progressivamente</strong> ao longo dos meses e anos, até chegar ao teto de 27%.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                      📅 2026 - Início suave
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      A taxa começa baixa (exemplo: 5-8%) e vai subindo ao longo do ano
                    </p>
                  </div>

                  <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                      📅 2027-2032 - Aumento progressivo
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      A cada ano, a porcentagem aumenta gradualmente até atingir o valor máximo
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg">
                    <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                      📅 2033 - Taxa máxima
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Ao final da transição, a taxa chega ao máximo de 27% para pessoa física
                    </p>
                  </div>
                </div>

                <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg mt-4">
                  <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
                    <Lightbulb className="h-5 w-5 flex-shrink-0 mt-0.5" />
                    <span>
                      <strong>Resumo:</strong> Você tem tempo para se preparar! O impacto não será total em 2026.
                      Use esse período de transição para se organizar, avaliar se vale a pena abrir um CNPJ,
                      e planejar suas finanças para quando a taxa máxima entrar em vigor.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* I) Como se organizar financeiramente */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-cyan-100 dark:bg-cyan-900 p-2 rounded-lg">
            <Wallet className="h-6 w-6 text-cyan-600" />
          </div>
          <h2 className="text-2xl font-bold">Como se organizar financeiramente</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          A transição será gradual (até 2033), então você tem tempo para se preparar.
          Veja o checklist:
        </p>

        <div className="space-y-3">
          {[
            { step: 1, title: 'Organize suas finanças', desc: 'Use o MonexAI para registrar todos os seus gastos e receitas. Ter controle é o primeiro passo.' },
            { step: 2, title: 'Separe o dinheiro dos impostos', desc: 'Se você tem negócio, reserve uma conta só para impostos. Não misture com dinheiro operacional.' },
            { step: 3, title: 'Mantenha documentos organizados', desc: 'Guarde notas fiscais e comprovantes. A transição pode exigir documentação.' },
            { step: 4, title: 'Acompanhe as notícias', desc: 'Fique de olho nas regulamentações. O MonexAI vai te manter informado.' },
            { step: 5, title: 'Converse com seu contador', desc: 'Se você tem negócio, seu contador deve estar acompanhando as mudanças.' },
          ].map((item) => (
            <Card key={item.step}>
              <CardContent className="flex items-start gap-4 py-4">
                <div className="bg-cyan-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h4 className="font-semibold">{item.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* I) Boas práticas no dia a dia */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-pink-100 dark:bg-pink-900 p-2 rounded-lg">
            <Lightbulb className="h-6 w-6 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold">Boas práticas no dia a dia</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { num: 1, title: 'Registre cada gasto', desc: 'Por menor que seja, registre. Pequenos valores somam.' },
            { num: 2, title: 'Categorize corretamente', desc: 'Separe receitas e despesas por categoria para análises.' },
            { num: 3, title: 'Revise semanalmente', desc: 'Reserve 10 minutos por semana para ver suas finanças.' },
            { num: 4, title: 'Use templates', desc: 'Agilize lançamentos recorrentes com templates prontos.' },
            { num: 5, title: 'Configure recorrências', desc: 'Contas fixas devem ser automáticas.' },
            { num: 6, title: 'Analise os gráficos', desc: 'Veja mensalmente para onde seu dinheiro está indo.' },
          ].map((item) => (
            <Card key={item.num} className="bg-gradient-to-br from-pink-50 to-white dark:from-pink-950/20 dark:to-gray-900">
              <CardContent className="pt-4 pb-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-pink-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold">
                    {item.num}
                  </div>
                  <h4 className="font-semibold text-sm">{item.title}</h4>
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* J) Mitos e Verdades */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 dark:bg-red-900 p-2 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold">Mitos e Verdades</h2>
        </div>

        <div className="space-y-4">
          {[
            { myth: 'A reforma vai aumentar todos os impostos', truth: 'Falso. O objetivo é manter a carga tributária total, não aumentar.' },
            { myth: 'MEIs vão pagar mais', truth: 'Falso. O Simples Nacional continua com tratamento diferenciado.' },
            { myth: 'Preciso mudar tudo agora', truth: 'Falso. A transição vai até 2033. Você tem tempo.' },
            { myth: 'Cesta básica vai ficar mais cara', truth: 'Falso. Produtos da cesta básica terão alíquota zero.' },
            { myth: 'É só trocar nome dos impostos', truth: 'Parcialmente verdade. Além dos nomes, muda como calcular e cobrar.' },
          ].map((item, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="bg-red-50 dark:bg-red-950/30 p-4 flex items-center gap-3 border-b">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
                <span className="font-medium text-red-800 dark:text-red-200">"{item.myth}"</span>
                <Badge className="bg-red-600 ml-auto">Mito</Badge>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <p className="text-emerald-800 dark:text-emerald-200">{item.truth}</p>
                <Badge className="bg-emerald-600 ml-auto">Verdade</Badge>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* K) Perguntas frequentes */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 dark:bg-violet-900 p-2 rounded-lg">
            <HelpCircle className="h-6 w-6 text-violet-600" />
          </div>
          <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
        </div>

        <Card>
          <CardContent className="pt-6">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: 'Vou pagar mais impostos?', a: 'A reforma não tem como objetivo aumentar a carga tributária total. O foco é simplificar e dar transparência. Alguns produtos podem ter ajustes, mas não é um aumento geral.' },
                { q: 'Preciso fazer alguma coisa agora?', a: 'Não precisa se desesperar! A transição será gradual até 2033. Por agora, o mais importante é manter suas finanças organizadas e acompanhar as novidades.' },
                { q: 'MEI vai ser afetado?', a: 'O Simples Nacional (que inclui MEIs) continua existindo com tratamento diferenciado. Se você é MEI, continue pagando seu DAS normalmente.' },
                { q: 'Como vou saber quanto pago de imposto?', a: 'Essa é uma das grandes melhorias! Com o novo sistema, a nota fiscal vai mostrar claramente o valor do imposto em cada compra.' },
                { q: 'E a cesta básica?', a: 'Produtos da cesta básica nacional terão alíquota zero. Isso significa que não haverá imposto sobre itens essenciais.' },
                { q: 'Meu contador precisa mudar?', a: 'Não necessariamente, mas ele vai precisar se atualizar sobre as novas regras. Mantenha contato com seu contador durante a transição.' },
                { q: 'O que é o cashback?', a: 'É a devolução de parte dos impostos para famílias de baixa renda. O governo vai devolver automaticamente uma parte do que foi pago em impostos sobre consumo.' },
                { q: 'Posso continuar usando o MonexAI?', a: 'Claro! O MonexAI continuará funcionando normalmente e vai se adaptar às mudanças quando necessário. Continue registrando suas finanças aqui.' },
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left hover:no-underline">{item.q}</AccordionTrigger>
                  <AccordionContent className="text-gray-600 dark:text-gray-400">{item.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </section>

      {/* L) Linha do tempo da transição */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-lg">
            <Calendar className="h-6 w-6 text-teal-600" />
          </div>
          <h2 className="text-2xl font-bold">Linha do tempo da transição</h2>
        </div>

        <p className="text-gray-600 dark:text-gray-300">
          A mudança será gradual para não causar impactos bruscos. Veja o cronograma:
        </p>

        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500 via-amber-500 to-gray-300" />
              
              <div className="space-y-6">
                {[
                  { year: '2023', title: 'Aprovação', desc: 'Reforma aprovada pelo Congresso', status: 'done', color: 'emerald' },
                  { year: '2024', title: 'Regulamentação', desc: 'Leis complementares sendo criadas', status: 'current', color: 'amber' },
                  { year: '2026', title: 'Início', desc: 'CBS e IBS em alíquota de teste (0,9%)', status: 'future', color: 'gray' },
                  { year: '2027-28', title: 'Transição', desc: 'Alíquotas sobem gradualmente', status: 'future', color: 'gray' },
                  { year: '2029-32', title: 'Plena', desc: 'Substituição progressiva dos impostos', status: 'future', color: 'gray' },
                  { year: '2033', title: 'Completo', desc: 'Sistema novo 100% em vigor', status: 'future', color: 'gray' },
                ].map((item, i) => (
                  <div key={i} className="relative flex items-start gap-4 pl-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                      item.status === 'done' ? 'bg-emerald-500' :
                      item.status === 'current' ? 'bg-amber-500 animate-pulse' :
                      'bg-gray-300'
                    }`}>
                      {item.status === 'done' && <CheckCircle2 className="h-3 w-3 text-white" />}
                      {item.status === 'current' && <Zap className="h-3 w-3 text-white" />}
                      {item.status === 'future' && <Clock className="h-3 w-3 text-gray-500" />}
                    </div>
                    <div className="flex-1 -mt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={item.status === 'done' ? 'default' : item.status === 'current' ? 'secondary' : 'outline'} className={item.status === 'done' ? 'bg-emerald-600' : item.status === 'current' ? 'bg-amber-500' : ''}>
                          {item.year}
                        </Badge>
                        <span className="font-semibold">{item.title}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 dark:bg-blue-950/30 border-blue-200">
          <CardContent className="py-4">
            <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start gap-2">
              <Lightbulb className="h-5 w-5 flex-shrink-0" />
              <span>Você tem até 2033 para se adaptar completamente. Use esse tempo para organizar suas finanças e entender as mudanças gradualmente.</span>
            </p>
          </CardContent>
        </Card>
      </section>

      {/* M) Encerramento */}
      <section className="space-y-6">
        <Card className="bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/50 dark:to-emerald-950/30 border-emerald-200">
          <CardContent className="pt-8 pb-8 text-center space-y-4">
            <div className="bg-emerald-600 text-white w-16 h-16 rounded-full flex items-center justify-center mx-auto">
              <Shield className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-900 dark:text-emerald-100">
              Você está no caminho certo!
            </h2>
            <p className="text-emerald-800 dark:text-emerald-200 max-w-lg mx-auto">
              Ao usar o MonexAI e se informar sobre a Reforma Tributária, você está se preparando
              para o futuro. Continue organizando suas finanças e acompanhando as novidades aqui.
            </p>
            <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center justify-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Com o plano Pro, você tem acesso completo a esta Central Educacional, Chat IA financeiro e histórico detalhado.
              </p>
            </div>
            <p className="text-xs text-emerald-700 dark:text-emerald-300">
              Este conteúdo é educacional. Para decisões específicas, consulte um contador ou advogado tributarista.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
