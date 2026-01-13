import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  // ❌ REMOVIDO O ADAPTER (conflita com CredentialsProvider + JWT)
  // adapter: PrismaAdapter(prisma),
  
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        console.log('➡️ AUTHORIZE CHAMADO')

        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais vazias')
          return null
        }

        console.log('📧 Email recebido:', credentials.email)

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true, subscription: true },
        })

        if (!user) {
          console.log('❌ Usuário NÃO encontrado no banco')
          return null
        }

        console.log('✅ Usuário encontrado:', {
          id: user.id,
          email: user.email,
          passwordHashExiste: !!user.passwordHash,
        })

        const isValid = await bcrypt.compare(
          credentials.password,
          user.passwordHash
        )

        console.log('🔐 Resultado bcrypt.compare:', isValid)

        if (!isValid) {
          console.log('❌ Senha incorreta')
          return null
        }

        console.log('✅ LOGIN AUTORIZADO')

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          mode: user.profile?.mode ?? null,
          isPro: user.subscription?.status === 'ACTIVE',
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.mode = (user as any).mode;
        token.isPro = (user as any).isPro;
      }
      if (trigger === 'update' && session) {
        token.mode = session.mode;
        token.isPro = session.isPro;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).mode = token.mode;
        (session.user as any).isPro = token.isPro;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    newUser: '/onboarding',
  },
};