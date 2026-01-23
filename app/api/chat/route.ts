import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

// ✅ CONFIGURAÇÕES DE SEGURANÇA
const DAILY_QUESTION_LIMIT = 16; // Limite seguro para margem de R$ 5-9
const MAX_MESSAGES_HISTORY = 15; // Histórico de conversa
const MAX_INPUT_LENGTH = 400; // Máximo de caracteres por pergunta
const MAX_TOKENS_OUTPUT = 600; // Respostas concisas
const REQUEST_TIMEOUT_MS = 30000; // 30 segundos
const SPAM_BLOCK_HOURS = 4; // Bloqueio por spam
const MAX_SIMILAR_QUESTIONS = 3; // Máximo de perguntas similares
const SIMILARITY_THRESHOLD = 0.7; // 70% de similaridade = spam

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
  timeout: REQUEST_TIMEOUT_MS,
});

// ✅ FUNÇÃO: Carregar contexto financeiro (OTIMIZADO)
async function loadUserFinancialContext(userId: string) {
  const profile = await prisma.user_profile.findUnique({
    where: { userId },
    select: { mode: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true },
  });

  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro = subscription?.status === 'ACTIVE';
  const now = new Date();
  const monthsAllowed = isPro ? 6 : 2;
  const historyStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsAllowed - 1), 1);

  // Buscar apenas últimas 100 transações (economiza tokens)
  const allTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: historyStartDate, lte: now },
    },
    include: { category: true },
    orderBy: { date: 'desc' },
    take: 100,
  });

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const currentMonthTransactions = allTransactions.filter((t: any) => {
    const tDate = new Date(t.date);
    return tDate >= startOfMonth && tDate <= endOfMonth;
  });

  const currentMonthIncome = currentMonthTransactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((sum: any, t: any) => sum + t.amountCents, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((sum: any, t: any) => sum + t.amountCents, 0);

  const expensesByCategory: Record<string, number> = {};
  currentMonthTransactions
    .filter((t: any) => t.type === 'EXPENSE')
    .forEach((t: any) => {
      const categoryName = t.category.name;
      expensesByCategory[categoryName] = (expensesByCategory[categoryName] || 0) + t.amountCents;
    });

  const topExpenseCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount: (amount / 100).toFixed(2),
    }));

  // Apenas últimas 5 transações para economizar tokens
  const recentTransactions = allTransactions.slice(0, 5).map((t: any) => ({
    date: t.date.toLocaleDateString('pt-BR'),
    description: t.description,
    amount: (t.amountCents / 100).toFixed(2),
    type: t.type,
    category: t.category.name,
  }));

  return {
    userName: user?.name || 'Usuário',
    userMode: profile?.mode === 'PERSONAL' ? 'Pessoal' : 'Empresarial',
    isPro,
    currentMonth: {
      name: now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      income: (currentMonthIncome / 100).toFixed(2),
      expenses: (currentMonthExpenses / 100).toFixed(2),
      balance: ((currentMonthIncome - currentMonthExpenses) / 100).toFixed(2),
      transactionCount: currentMonthTransactions.length,
    },
    topExpenseCategories,
    recentTransactions,
    hasData: allTransactions.length > 0,
  };
}

// ✅ PROTEÇÃO: Validação com IA (GPT-4o-mini para economizar)
async function validateQuestionWithAI(message: string): Promise<boolean> {
  try {
    const validationResponse = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é um validador. Responda APENAS "SIM" ou "NÃO".',
        },
        {
          role: 'user',
          content: `A pergunta abaixo está relacionada a finanças pessoais, gastos, receitas, despesas, categorias financeiras ou gestão de dinheiro?\n\nPergunta: "${message}"\n\nResposta:`,
        },
      ],
      temperature: 0,
      max_tokens: 5,
    });

    const answer = validationResponse.choices[0]?.message?.content?.trim().toUpperCase();
    return answer === 'SIM';
  } catch (error) {
    console.error('Erro na validação IA:', error);
    return true; // Fail-open: se der erro, permite
  }
}

// ✅ PROTEÇÃO: Detectar spam (perguntas repetidas)
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  if (s1 === s2) return 1.0;

  const words1 = s1.split(/\s+/);
  const words2 = s2.split(/\s+/);

  const commonWords = words1.filter((word) => words2.includes(word));
  const similarity = (2 * commonWords.length) / (words1.length + words2.length);

  return similarity;
}

async function checkForSpam(userId: string, currentMessage: string): Promise<boolean> {
  const recentMessages = await prisma.chat_message.findMany({
    where: {
      userId,
      role: 'user',
      createdAt: {
        gte: new Date(Date.now() - 60 * 60 * 1000), // Última 1 hora
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  let similarCount = 0;

  for (const msg of recentMessages) {
    const similarity = calculateSimilarity(currentMessage, msg.content);
    if (similarity >= SIMILARITY_THRESHOLD) {
      similarCount++;
    }
  }

  return similarCount >= MAX_SIMILAR_QUESTIONS;
}

// ✅ PROTEÇÃO: Verificar se está bloqueado por spam
async function isUserBlocked(userId: string): Promise<{ blocked: boolean; remainingMinutes?: number }> {
  const blockRecord = await prisma.userSpamBlock.findUnique({
    where: { userId },
  });

  if (!blockRecord) return { blocked: false };

  const now = new Date();
  const blockExpiry = new Date(blockRecord.blockedUntil);

  if (now < blockExpiry) {
    const remainingMinutes = Math.ceil((blockExpiry.getTime() - now.getTime()) / (60 * 1000));
    return { blocked: true, remainingMinutes };
  }

  // Desbloqueou, remover registro
  await prisma.userSpamBlock.delete({
    where: { userId },
  });

  return { blocked: false };
}

// ✅ PROTEÇÃO: Bloquear usuário por spam
async function blockUserForSpam(userId: string): Promise<void> {
  const blockedUntil = new Date(Date.now() + SPAM_BLOCK_HOURS * 60 * 60 * 1000);

  await prisma.userSpamBlock.upsert({
    where: { userId },
    create: {
      userId,
      blockedUntil,
      reason: 'Spam detectado (perguntas repetidas)',
    },
    update: {
      blockedUntil,
      reason: 'Spam detectado (perguntas repetidas)',
    },
  });
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada.' },
        { status: 500 }
      );
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    const isPro = subscription?.status === 'ACTIVE';

    if (!isPro) {
      return NextResponse.json(
        { error: 'Recurso exclusivo para usuários Pro' },
        { status: 403 }
      );
    }

    const { message } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json({ error: 'Mensagem inválida' }, { status: 400 });
    }

    // ✅ PROTEÇÃO 1: Verificar bloqueio por spam
    const blockStatus = await isUserBlocked(session.user.id);
    if (blockStatus.blocked) {
      return NextResponse.json(
        {
          error: `Detectamos um padrão de uso suspeito. Por favor, aguarde ${blockStatus.remainingMinutes} minutos antes de tentar novamente.`,
        },
        { status: 429 }
      );
    }

    // ✅ PROTEÇÃO 2: Limite de caracteres
    if (message.length > MAX_INPUT_LENGTH) {
      return NextResponse.json(
        { error: `Mensagem muito longa. Por favor, seja mais conciso (máximo ${MAX_INPUT_LENGTH} caracteres).` },
        { status: 400 }
      );
    }

    // ✅ PROTEÇÃO 3: Detectar spam
    const isSpam = await checkForSpam(session.user.id, message);
    if (isSpam) {
      await blockUserForSpam(session.user.id);
      return NextResponse.json(
        {
          error: `Detectamos perguntas repetidas. Para garantir a qualidade do serviço, bloqueamos temporariamente seu acesso por ${SPAM_BLOCK_HOURS} horas. Por favor, evite repetir as mesmas perguntas.`,
        },
        { status: 429 }
      );
    }

    // ✅ PROTEÇÃO 4: Validação com IA
    const isRelevant = await validateQuestionWithAI(message);

    if (!isRelevant) {
      const encoder = new TextEncoder();
      const refusalMessage =
        'Posso te ajudar apenas com informações relacionadas aos seus dados financeiros. Por favor, faça uma pergunta sobre seus gastos, receitas, categorias ou gestão financeira.';

      const readableStream = new ReadableStream({
        start(controller) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ content: refusalMessage })}\n\n`)
          );
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        },
      });

      return new NextResponse(readableStream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      });
    }

    // ✅ PROTEÇÃO 5: Limite diário (mensagem de spam em vez de limite)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await prisma.chat_usage.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!usage) {
      usage = await prisma.chat_usage.create({
        data: {
          userId: session.user.id,
          date: today,
          questionCount: 0,
        },
      });
    }

    if (usage.questionCount >= DAILY_QUESTION_LIMIT) {
      return NextResponse.json(
        {
          error: 'Detectamos um uso muito elevado do chat. Por segurança e para prevenir spam, pedimos que retorne amanhã. Obrigado pela compreensão!',
        },
        { status: 429 }
      );
    }

    // Incrementar contador
    await prisma.chat_usage.update({
      where: { id: usage.id },
      data: { questionCount: usage.questionCount + 1 },
    });

    const userContext = await loadUserFinancialContext(session.user.id);

    const previousMessages = await prisma.chat_message.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: MAX_MESSAGES_HISTORY - 1,
    });

    previousMessages.reverse();

    // ✅ System prompt otimizado
    const systemPrompt = `Você é o Assistente Financeiro do MonexAI para ${userContext.userName} (${userContext.userMode}).

DADOS FINANCEIROS (Mês: ${userContext.currentMonth.name}):
- Receitas: R$ ${userContext.currentMonth.income}
- Despesas: R$ ${userContext.currentMonth.expenses}
- Saldo: R$ ${userContext.currentMonth.balance}
- Transações: ${userContext.currentMonth.transactionCount}

TOP 5 CATEGORIAS DE DESPESAS:
${userContext.topExpenseCategories.map((c, i) => `${i + 1}. ${c.category}: R$ ${c.amount}`).join('\n')}

ÚLTIMAS 5 TRANSAÇÕES:
${userContext.recentTransactions.map((t: any) => `${t.date} | ${t.description} | R$ ${t.amount} | ${t.category}`).join('\n')}

INSTRUÇÕES:
- Responda de forma objetiva (máximo 3 parágrafos)
- Use APENAS os dados acima
- Se não tiver informação suficiente, diga claramente
- Seja amigável e prestativo`;

    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...previousMessages.slice(-8).map((msg: any) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user', content: message },
    ];

    await prisma.chat_message.create({
      data: {
        userId: session.user.id,
        role: 'user',
        content: message,
      },
    });

    // Limpar histórico
    const totalMessages = await prisma.chat_message.count({
      where: { userId: session.user.id },
    });

    if (totalMessages > MAX_MESSAGES_HISTORY) {
      const messagesToDelete = totalMessages - MAX_MESSAGES_HISTORY;
      const oldestMessages = await prisma.chat_message.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
        take: messagesToDelete,
      });

      await prisma.chat_message.deleteMany({
        where: { id: { in: oldestMessages.map((msg: any) => msg.id) } },
      });
    }

    // ✅ GPT-4O para respostas inteligentes
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: MAX_TOKENS_OUTPUT,
    });

    const encoder = new TextEncoder();
    let assistantContent = '';
    let tokenCount = 0;

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (Date.now() - startTime > REQUEST_TIMEOUT_MS) {
              break;
            }

            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              assistantContent += content;
              tokenCount++;

              if (tokenCount > MAX_TOKENS_OUTPUT) {
                break;
              }

              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          await prisma.chat_message.create({
            data: {
              userId: session.user.id,
              role: 'assistant',
              content: assistantContent,
            },
          });

          const updatedUsage = await prisma.chat_usage.findUnique({
            where: {
              userId_date: {
                userId: session.user.id,
                date: today,
              },
            },
          });

          const finalData = JSON.stringify({
            dailyCount: updatedUsage?.questionCount || 0,
            limitReached: (updatedUsage?.questionCount || 0) >= DAILY_QUESTION_LIMIT,
          });
          controller.enqueue(encoder.encode(`data: ${finalData}\n\n`));
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error('Erro ao processar stream:', error);
          controller.error(error);
        }
      },
    });

    return new NextResponse(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Erro no chat:', error);

    if (error?.status === 401) {
      return NextResponse.json({ error: 'Erro de autenticação com a API.' }, { status: 500 });
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Serviço temporariamente indisponível. Tente novamente em alguns instantes.' },
        { status: 429 }
      );
    }

    return NextResponse.json({ error: 'Erro ao processar sua mensagem. Tente novamente.' }, { status: 500 });
  }
}