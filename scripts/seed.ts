import { PrismaClient } from '@prisma/client';

type UserMode = 'PERSONAL' | 'BUSINESS';
type TransactionType = 'INCOME' | 'EXPENSE';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Categorias de DESPESA - Modo Pessoal
const personalExpenseCategories = [
  'Alimentação', 'Moradia', 'Transporte', 'Saúde', 'Educação',
  'Contas', 'Assinaturas', 'Compras', 'Lazer', 'Família', 'Outros'
];

// Categorias de RECEITA - Modo Pessoal
const personalIncomeCategories = [
  'Salário', 'Vendas', 'Presente', 'Comissão', 'Serviços', 'Outros Receitas'
];

// Categorias de DESPESA - Modo Empresarial
const businessExpenseCategories = [
  'Fornecedores', 'Marketing', 'Ferramentas/Software', 'Impostos/Taxas',
  'Pró-labore', 'Serviços Terceirizados', 'Logística', 'Operacional', 'Outros'
];

// Categorias de RECEITA - Modo Empresarial
const businessIncomeCategories = [
  'Vendas', 'Serviços', 'Comissão', 'Reembolsos', 'Outros Receitas'
];

// Templates REDUZIDOS para Freemium: 5 templates (3 despesa, 2 receita)
const personalTemplates = [
  // 3 templates de despesa
  { name: 'Supermercado', type: TransactionType.EXPENSE, category: 'Alimentação', amountCents: 30000 },
  { name: 'Conta de Luz', type: TransactionType.EXPENSE, category: 'Contas', amountCents: 15000 },
  { name: 'Transporte/Combustível', type: TransactionType.EXPENSE, category: 'Transporte', amountCents: 20000 },
  // 2 templates de receita
  { name: 'Salário Mensal', type: TransactionType.INCOME, category: 'Salário', amountCents: 350000 },
  { name: 'Renda Extra', type: TransactionType.INCOME, category: 'Serviços', amountCents: 50000 },
];

const businessTemplates = [
  // 3 templates de despesa
  { name: 'Fornecedores', type: TransactionType.EXPENSE, category: 'Fornecedores', amountCents: 100000 },
  { name: 'Marketing Digital', type: TransactionType.EXPENSE, category: 'Marketing', amountCents: 50000 },
  { name: 'Impostos Mensais', type: TransactionType.EXPENSE, category: 'Impostos/Taxas', amountCents: 30000 },
  // 2 templates de receita
  { name: 'Venda de Produto', type: TransactionType.INCOME, category: 'Vendas', amountCents: 15000 },
  { name: 'Serviço Prestado', type: TransactionType.INCOME, category: 'Serviços', amountCents: 50000 },
];

async function main() {
  console.log('Seeding database...');

  // Create EXPENSE categories for PERSONAL mode
  const personalCats: Record<string, string> = {};
  for (const name of personalExpenseCategories) {
    const cat = await prisma.category.upsert({
      where: { id: `personal-expense-${name.toLowerCase().replace(/[^a-z]/g, '')}` },
      update: { type: TransactionType.EXPENSE },
      create: {
        id: `personal-expense-${name.toLowerCase().replace(/[^a-z]/g, '')}`,
        name,
        mode: UserMode.PERSONAL,
        type: TransactionType.EXPENSE,
        isSystem: true,
      },
    });
    personalCats[name] = cat.id;
  }

  // Create INCOME categories for PERSONAL mode
  for (const name of personalIncomeCategories) {
    const cat = await prisma.category.upsert({
      where: { id: `personal-income-${name.toLowerCase().replace(/[^a-z]/g, '')}` },
      update: { type: TransactionType.INCOME },
      create: {
        id: `personal-income-${name.toLowerCase().replace(/[^a-z]/g, '')}`,
        name,
        mode: UserMode.PERSONAL,
        type: TransactionType.INCOME,
        isSystem: true,
      },
    });
    personalCats[name] = cat.id;
  }

  // Create EXPENSE categories for BUSINESS mode
  const businessCats: Record<string, string> = {};
  for (const name of businessExpenseCategories) {
    const cat = await prisma.category.upsert({
      where: { id: `business-expense-${name.toLowerCase().replace(/[^a-z]/g, '')}` },
      update: { type: TransactionType.EXPENSE },
      create: {
        id: `business-expense-${name.toLowerCase().replace(/[^a-z]/g, '')}`,
        name,
        mode: UserMode.BUSINESS,
        type: TransactionType.EXPENSE,
        isSystem: true,
      },
    });
    businessCats[name] = cat.id;
  }

  // Create INCOME categories for BUSINESS mode
  for (const name of businessIncomeCategories) {
    const cat = await prisma.category.upsert({
      where: { id: `business-income-${name.toLowerCase().replace(/[^a-z]/g, '')}` },
      update: { type: TransactionType.INCOME },
      create: {
        id: `business-income-${name.toLowerCase().replace(/[^a-z]/g, '')}`,
        name,
        mode: UserMode.BUSINESS,
        type: TransactionType.INCOME,
        isSystem: true,
      },
    });
    businessCats[name] = cat.id;
  }

  // Delete old templates to apply new reduced set
  await prisma.template.deleteMany({ where: { isSystem: true } });

  // Create PERSONAL templates (5 total)
  for (const tmpl of personalTemplates) {
    const categoryId = personalCats[tmpl.category];
    if (!categoryId) continue;
    await prisma.template.create({
      data: {
        name: tmpl.name,
        type: tmpl.type,
        categoryId,
        mode: UserMode.PERSONAL,
        isSystem: true,
        amountCents: tmpl.amountCents,
      },
    });
  }

  // Create BUSINESS templates (5 total)
  for (const tmpl of businessTemplates) {
    const categoryId = businessCats[tmpl.category];
    if (!categoryId) continue;
    await prisma.template.create({
      data: {
        name: tmpl.name,
        type: tmpl.type,
        categoryId,
        mode: UserMode.BUSINESS,
        isSystem: true,
        amountCents: tmpl.amountCents,
      },
    });
  }

  // Create test user
  const passwordHash = await bcrypt.hash('senha123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'teste@monexai.com' },
    update: {},
    create: {
      email: 'teste@monexai.com',
      name: 'Usuário Teste',
      passwordHash,
    },
  });

  // Create profile
  await prisma.userProfile.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      mode: UserMode.PERSONAL,
    },
  });

  // Create freemium subscription
  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      status: 'FREEMIUM',
    },
  });

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
