import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import OpenAI from 'openai';

export const dynamic = 'force-dynamic';

const DAILY_QUESTION_LIMIT = 50;
const MAX_MESSAGES_HISTORY = 30;

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || '',
});

// Helper function to load user financial data
async function loadUserFinancialContext(userId: string) {
  // Get user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId },
    select: { mode: true },
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true },
  });

  // Get subscription status
  const subscription = await prisma.subscription.findUnique({
    where: { userId },
  });

  const isPro = subscription?.status === 'ACTIVE';

  // Calculate history limits based on plan
  // Free: current month + 1 previous month (2 months total)
  // Pro: current month + 5 previous months (6 months total)
  const now = new Date();
  const monthsAllowed = isPro ? 6 : 2;
  const historyStartDate = new Date(now.getFullYear(), now.getMonth() - (monthsAllowed - 1), 1);

  // Get all transactions within allowed period
  const allAllowedTransactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: { gte: historyStartDate, lte: now },
    },
    include: {
      category: true,
    },
    orderBy: { date: 'desc' },
  });

  // Get current month transactions
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const currentMonthTransactions = allAllowedTransactions.filter((t) => {
    const tDate = new Date(t.date);
    return tDate >= startOfMonth && tDate <= endOfMonth;
  });

  // Calculate current month summary
  const currentMonthIncome = currentMonthTransactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const currentMonthExpenses = currentMonthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + t.amountCents, 0);

  const currentMonthBalance = currentMonthIncome - currentMonthExpenses;

  // Calculate spending by category (current month)
  const expensesByCategory: Record<string, number> = {};
  currentMonthTransactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const categoryName = t.category.name;
      expensesByCategory[categoryName] =
        (expensesByCategory[categoryName] || 0) + t.amountCents;
    });

  // Calculate income by category (current month)
  const incomeByCategory: Record<string, number> = {};
  currentMonthTransactions
    .filter((t) => t.type === 'INCOME')
    .forEach((t) => {
      const categoryName = t.category.name;
      incomeByCategory[categoryName] =
        (incomeByCategory[categoryName] || 0) + t.amountCents;
    });

  // Get top 5 expense categories (from all allowed period)
  const allExpensesByCategory: Record<string, number> = {};
  allAllowedTransactions
    .filter((t) => t.type === 'EXPENSE')
    .forEach((t) => {
      const categoryName = t.category.name;
      allExpensesByCategory[categoryName] =
        (allExpensesByCategory[categoryName] || 0) + t.amountCents;
    });

  const topExpenseCategories = Object.entries(allExpensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([category, amount]) => ({
      category,
      amount: (amount / 100).toFixed(2),
    }));

  // Get active recurring rules
  const recurringRules = await prisma.recurringRule.findMany({
    where: {
      userId,
      isActive: true,
    },
    include: {
      category: true,
    },
    take: 10,
  });

  // Format recurring rules
  const formattedRecurrences = recurringRules.map((r) => ({
    description: r.description,
    amount: (r.amountCents / 100).toFixed(2),
    type: r.transactionType,
    frequency: r.type,
    category: r.category.name,
  }));

  // Get recent transactions (last 10 from allowed period)
  const recentTransactions = allAllowedTransactions.slice(0, 10).map((t) => ({
    date: t.date.toLocaleDateString('pt-BR'),
    description: t.description,
    amount: (t.amountCents / 100).toFixed(2),
    type: t.type,
    category: t.category.name,
  }));

  // Calculate monthly comparison (current vs last month) - only if last month is within allowed period
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  let lastMonthIncome = 0;
  let lastMonthExpenses = 0;

  // Only calculate if last month is within allowed period
  if (lastMonth >= historyStartDate) {
    const lastMonthTransactions = allAllowedTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= lastMonth && tDate <= lastMonthEnd;
    });

    lastMonthIncome = lastMonthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountCents, 0);

    lastMonthExpenses = lastMonthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountCents, 0);
  }

  // Calculate monthly breakdown for historical analysis with detailed category data
  const monthlyBreakdown: Array<{
    month: string;
    monthKey: string;
    income: string;
    expenses: string;
    balance: string;
    transactionCount: number;
    expensesByCategory: Array<{ category: string; amount: string; count: number }>;
    incomeByCategory: Array<{ category: string; amount: string; count: number }>;
    topExpenseCategory: { category: string; amount: string } | null;
  }> = [];

  for (let i = 0; i < monthsAllowed; i++) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0, 23, 59, 59);

    const monthTransactions = allAllowedTransactions.filter((t) => {
      const tDate = new Date(t.date);
      return tDate >= monthStart && tDate <= monthEnd;
    });

    const monthIncome = monthTransactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amountCents, 0);

    const monthExpenses = monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amountCents, 0);

    // Calculate expenses by category for this month
    const monthExpensesByCategory: Record<string, { amount: number; count: number }> = {};
    monthTransactions
      .filter((t) => t.type === 'EXPENSE')
      .forEach((t) => {
        const categoryName = t.category.name;
        if (!monthExpensesByCategory[categoryName]) {
          monthExpensesByCategory[categoryName] = { amount: 0, count: 0 };
        }
        monthExpensesByCategory[categoryName].amount += t.amountCents;
        monthExpensesByCategory[categoryName].count += 1;
      });

    // Calculate income by category for this month
    const monthIncomeByCategory: Record<string, { amount: number; count: number }> = {};
    monthTransactions
      .filter((t) => t.type === 'INCOME')
      .forEach((t) => {
        const categoryName = t.category.name;
        if (!monthIncomeByCategory[categoryName]) {
          monthIncomeByCategory[categoryName] = { amount: 0, count: 0 };
        }
        monthIncomeByCategory[categoryName].amount += t.amountCents;
        monthIncomeByCategory[categoryName].count += 1;
      });

    // Sort and format expense categories
    const sortedExpenseCategories = Object.entries(monthExpensesByCategory)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([category, data]) => ({
        category,
        amount: (data.amount / 100).toFixed(2),
        count: data.count,
      }));

    // Sort and format income categories
    const sortedIncomeCategories = Object.entries(monthIncomeByCategory)
      .sort(([, a], [, b]) => b.amount - a.amount)
      .map(([category, data]) => ({
        category,
        amount: (data.amount / 100).toFixed(2),
        count: data.count,
      }));

    // Get top expense category for this month
    const topExpenseCategory = sortedExpenseCategories.length > 0
      ? { category: sortedExpenseCategories[0].category, amount: sortedExpenseCategories[0].amount }
      : null;

    monthlyBreakdown.push({
      month: monthDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      monthKey: `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`,
      income: (monthIncome / 100).toFixed(2),
      expenses: (monthExpenses / 100).toFixed(2),
      balance: ((monthIncome - monthExpenses) / 100).toFixed(2),
      transactionCount: monthTransactions.length,
      expensesByCategory: sortedExpenseCategories,
      incomeByCategory: sortedIncomeCategories,
      topExpenseCategory,
    });
  }

  // Format period description
  const periodStart = historyStartDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  const periodEnd = now.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  return {
    userName: user?.name || 'Usuário',
    userMode: profile?.mode === 'PERSONAL' ? 'Pessoal' : 'Empresarial',
    isPro,
    monthsAllowed,
    periodDescription: `${periodStart} até ${periodEnd}`,
    currentMonth: {
      name: new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
      income: (currentMonthIncome / 100).toFixed(2),
      expenses: (currentMonthExpenses / 100).toFixed(2),
      balance: (currentMonthBalance / 100).toFixed(2),
      transactionCount: currentMonthTransactions.length,
    },
    lastMonth: {
      income: (lastMonthIncome / 100).toFixed(2),
      expenses: (lastMonthExpenses / 100).toFixed(2),
      available: lastMonth >= historyStartDate,
    },
    monthlyBreakdown,
    topExpenseCategories,
    incomeByCategory: Object.entries(incomeByCategory).map(([category, amount]) => ({
      category,
      amount: (amount / 100).toFixed(2),
    })),
    recentTransactions,
    recurringRules: formattedRecurrences,
    hasData: allAllowedTransactions.length > 0,
    totalTransactions: allAllowedTransactions.length,
  };
}

// Helper function to validate if question is relevant
function isQuestionRelevant(message: string): boolean {
  // Convert to lowercase for easier matching
  const lowerMessage = message.toLowerCase();

  // Keywords related to financial management
  const relevantKeywords = [
    'gasto',
    'despesa',
    'receita',
    'saldo',
    'categoria',
    'lançamento',
    'transação',
    'mês',
    'meses',
    'financeiro',
    'dinheiro',
    'pagar',
    'receber',
    'economizar',
    'poupar',
    'investir',
    'orçamento',
    'conta',
    'quanto',
    'onde',
    'como',
    'reduzir',
    'aumentar',
    'dica',
    'conselho',
    'ajuda',
    'dashboard',
    'relatório',
    'análise',
    'resumo',
    'total',
    'valor',
    'recorrente',
    'recorrência',
    'parcelado',
    'parcela',
    'alimentação',
    'transporte',
    'saúde',
    'educação',
    'lazer',
    'moradia',
    'salário',
    'renda',
  ];

  // Check if message contains any relevant keyword
  const hasRelevantKeyword = relevantKeywords.some((keyword) =>
    lowerMessage.includes(keyword)
  );

  return hasRelevantKeyword;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
      return NextResponse.json(
        { error: 'OpenAI API key não configurada. Por favor, configure a variável OPENAI_API_KEY no arquivo .env' },
        { status: 500 }
      );
    }

    // Check subscription status
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
      return NextResponse.json(
        { error: 'Mensagem inválida' },
        { status: 400 }
      );
    }

    // Validate if question is relevant to financial context
    if (!isQuestionRelevant(message)) {
      // Return a polite refusal without using the API
      const encoder = new TextEncoder();
      const refusalMessage =
        'Posso te ajudar apenas com informações relacionadas aos seus dados financeiros e ao funcionamento do sistema MonexAI. Por favor, faça uma pergunta sobre seus gastos, receitas, categorias ou gestão financeira.';

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

    // Check daily limit
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let usage = await prisma.chatUsage.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!usage) {
      usage = await prisma.chatUsage.create({
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
          error:
            'Por motivos de segurança e prevenção de spam, o limite diário de perguntas foi atingido. Tente novamente amanhã.',
        },
        { status: 429 }
      );
    }

    // Increment usage count
    await prisma.chatUsage.update({
      where: { id: usage.id },
      data: { questionCount: usage.questionCount + 1 },
    });

    // Load user's financial context
    const userContext = await loadUserFinancialContext(session.user.id);

    // Get last 30 messages for context
    const previousMessages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 29, // Get 29 previous messages + current = 30
    });

    // Reverse to chronological order
    previousMessages.reverse();

    // Build detailed system prompt with user data
    const systemPrompt = `Você é o Assistente Financeiro Pessoal do MonexAI.

**REGRAS CRÍTICAS (OBRIGATÓRIAS):**
1. Você DEVE responder APENAS com base nos dados fornecidos abaixo.
2. NUNCA invente ou assuma informações que não estão nos dados.
3. Se os dados não forem suficientes para responder, diga isso claramente.
4. NÃO responda perguntas genéricas, curiosidades ou temas não relacionados às finanças do usuário.
5. Se a pergunta não puder ser respondida com os dados disponíveis, informe: "Não tenho informações suficientes nos seus dados para responder isso."
6. Seja objetivo, claro e personalizado.
7. Use os dados reais para criar respostas relevantes e úteis.
8. RESPEITE RIGOROSAMENTE o período de dados disponível. Não faça inferências sobre períodos fora do alcance.

**DADOS DO USUÁRIO:**
Nome: ${userContext.userName}
Modo: ${userContext.userMode}
Plano: ${userContext.isPro ? 'Pro (acesso a 6 meses de histórico)' : 'Freemium (acesso limitado a 2 meses)'}

**PERÍODO DE DADOS DISPONÍVEL:**
${userContext.periodDescription}
Total de ${userContext.monthsAllowed} ${userContext.monthsAllowed === 1 ? 'mês' : 'meses'} de histórico
${userContext.totalTransactions} transações no período

**IMPORTANTE:** ${userContext.isPro 
  ? 'Como usuário Pro, você tem acesso aos últimos 6 meses de dados detalhados.'
  : 'Como usuário Freemium, você tem acesso apenas ao mês atual e ao mês anterior. Para análises de períodos mais longos, sugira o upgrade para o plano Pro.'
}

**MÊS ATUAL (${userContext.currentMonth.name}):**
- Receitas: R$ ${userContext.currentMonth.income}
- Despesas: R$ ${userContext.currentMonth.expenses}
- Saldo: R$ ${userContext.currentMonth.balance}
- Total de lançamentos: ${userContext.currentMonth.transactionCount}

**MÊS ANTERIOR:**
${userContext.lastMonth.available 
  ? `- Receitas: R$ ${userContext.lastMonth.income}
- Despesas: R$ ${userContext.lastMonth.expenses}`
  : '- Dados do mês anterior não disponíveis neste período'
}

**EVOLUÇÃO MENSAL DETALHADA:**
${userContext.monthlyBreakdown.map((m) => `
📅 ${m.month} (${m.transactionCount} lançamentos):
  💰 Receitas: R$ ${m.income}
  💸 Despesas: R$ ${m.expenses}
  📊 Saldo: R$ ${m.balance}
  
  ${m.topExpenseCategory ? `🔝 Maior gasto: ${m.topExpenseCategory.category} (R$ ${m.topExpenseCategory.amount})` : ''}
  
  📁 Despesas por categoria:
  ${m.expensesByCategory.length > 0 
    ? m.expensesByCategory.map((cat, idx) => `    ${idx + 1}. ${cat.category}: R$ ${cat.amount} (${cat.count} lançamento${cat.count > 1 ? 's' : ''})`).join('\n  ')
    : '    Nenhuma despesa registrada'
  }
  
  💵 Receitas por categoria:
  ${m.incomeByCategory.length > 0
    ? m.incomeByCategory.map((cat, idx) => `    ${idx + 1}. ${cat.category}: R$ ${cat.amount} (${cat.count} lançamento${cat.count > 1 ? 's' : ''})`).join('\n  ')
    : '    Nenhuma receita registrada'
  }
`).join('\n---\n')}

**TOP 5 CATEGORIAS DE DESPESAS (período completo):**
${userContext.topExpenseCategories.length > 0 
  ? userContext.topExpenseCategories.map((cat, i) => `${i + 1}. ${cat.category}: R$ ${cat.amount}`).join('\n')
  : 'Nenhuma despesa registrada no período.'
}

**RECEITAS POR CATEGORIA (mês atual):**
${userContext.incomeByCategory.length > 0 
  ? userContext.incomeByCategory.map((cat) => `- ${cat.category}: R$ ${cat.amount}`).join('\n') 
  : 'Nenhuma receita registrada no mês atual.'
}

**ÚLTIMAS TRANSAÇÕES:**
${userContext.recentTransactions.length > 0 
  ? userContext.recentTransactions.map((t) => `- ${t.date} | ${t.description} | R$ ${t.amount} | ${t.type === 'INCOME' ? 'Receita' : 'Despesa'} | ${t.category}`).join('\n') 
  : 'Nenhuma transação registrada no período.'
}

**RECORRÊNCIAS ATIVAS:**
${userContext.recurringRules.length > 0 
  ? userContext.recurringRules.map((r) => `- ${r.description} | R$ ${r.amount} | ${r.type === 'INCOME' ? 'Receita' : 'Despesa'} | ${r.frequency} | ${r.category}`).join('\n') 
  : 'Nenhuma recorrência ativa.'
}

**INSTRUÇÕES FINAIS:**
1. Use APENAS os dados fornecidos acima para responder.
2. Se a pergunta não estiver relacionada aos dados ou ao sistema MonexAI, recuse educadamente.
3. Quando analisar padrões ou tendências, mencione o período considerado (${userContext.periodDescription}).
4. Se o usuário perguntar sobre períodos fora do alcance, informe claramente o limite do plano dele.
5. ${!userContext.isPro ? 'Se uma análise mais completa exigir mais histórico, sugira o upgrade para Pro (acesso a 6 meses).' : ''}
6. Sempre responda em português do Brasil, de forma amigável mas profissional.
7. Seja específico ao comparar meses ou identificar tendências - sempre cite os valores reais dos dados.
8. **IMPORTANTE:** Quando o usuário perguntar sobre categorias específicas ou "onde gastei mais", use os dados detalhados de "Despesas por categoria" e "Receitas por categoria" da seção "EVOLUÇÃO MENSAL DETALHADA". NUNCA diga que não tem informações suficientes se os dados estiverem disponíveis nos breakdowns mensais acima.
9. **ANÁLISE POR MÊS:** Você tem acesso aos dados de CADA MÊS separadamente. Se o usuário perguntar sobre o "mês passado" ou qualquer mês específico, consulte o breakdown daquele mês e responda com base nas categorias detalhadas fornecidas.
10. **COMPARAÇÕES:** Ao comparar meses, sempre cite valores específicos de ambos os meses e identifique mudanças nas categorias.`;

    // Build conversation history for OpenAI
    const conversationHistory: OpenAI.Chat.Completions.ChatCompletionMessageParam[] =
      [
        {
          role: 'system',
          content: systemPrompt,
        },
        ...previousMessages.map(
          (msg) =>
            ({
              role: msg.role as 'user' | 'assistant',
              content: msg.content,
            } as OpenAI.Chat.Completions.ChatCompletionMessageParam)
        ),
        {
          role: 'user',
          content: message,
        },
      ];

    // Save user message to database
    await prisma.chatMessage.create({
      data: {
        userId: session.user.id,
        role: 'user',
        content: message,
      },
    });

    // Maintain only last 30 messages - delete oldest if exceeding
    const totalMessages = await prisma.chatMessage.count({
      where: { userId: session.user.id },
    });

    if (totalMessages > MAX_MESSAGES_HISTORY) {
      const messagesToDelete = totalMessages - MAX_MESSAGES_HISTORY;
      const oldestMessages = await prisma.chatMessage.findMany({
        where: { userId: session.user.id },
        orderBy: { createdAt: 'asc' },
        take: messagesToDelete,
      });

      await prisma.chatMessage.deleteMany({
        where: {
          id: { in: oldestMessages.map((msg) => msg.id) },
        },
      });
    }

    // Stream response from OpenAI
    const stream = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: conversationHistory,
      stream: true,
      temperature: 0.7,
      max_tokens: 1000,
    });

    // Create a ReadableStream for SSE
    const encoder = new TextEncoder();
    let assistantContent = '';

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              assistantContent += content;
              const data = JSON.stringify({ content });
              controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            }
          }

          // Save assistant response to database
          await prisma.chatMessage.create({
            data: {
              userId: session.user.id,
              role: 'assistant',
              content: assistantContent,
            },
          });

          // Send final metadata
          const updatedUsage = await prisma.chatUsage.findUnique({
            where: {
              userId_date: {
                userId: session.user.id,
                date: today,
              },
            },
          });

          const finalData = JSON.stringify({
            dailyCount: updatedUsage?.questionCount || 0,
            limitReached:
              (updatedUsage?.questionCount || 0) >= DAILY_QUESTION_LIMIT,
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

    // Check if it's an OpenAI API error
    if (error?.status === 401) {
      return NextResponse.json(
        { error: 'OpenAI API key inválida. Verifique a configuração.' },
        { status: 500 }
      );
    }

    if (error?.status === 429) {
      return NextResponse.json(
        { error: 'Limite de requisições da OpenAI atingido. Tente novamente em alguns instantes.' },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error?.message || 'Erro ao processar mensagem' },
      { status: 500 }
    );
  }
}
