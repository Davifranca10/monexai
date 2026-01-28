import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {


        try {
          if (!credentials?.email || !credentials?.password) {

            return null;
          }



          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { userProfile: true, subscription: true },
          });



          if (!user) {

            return null;
          }

          // TODO: Descomentar quando implementar envio de email de verificação
          // IMPORTANTE: Bloqueio de login para usuários não verificados
          // if (!user.emailVerified) {
          //   throw new Error('Email não verificado. Por favor, confirme seu email antes de fazer login.');
          // }

          const isValid = await bcrypt.compare(
            credentials.password,
            user.passwordHash
          );


          if (!isValid) {
            return null;
          }


          return {
            id: user.id,
            email: user.email,
            name: user.name,
            mode: user.userProfile?.mode ?? null,
            isPro: user.subscription?.status === 'ACTIVE',
          };
        } catch (error) {
          console.error('🚨 ERRO CRÍTICO:', error);
          return null;
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
  debug: false,
};