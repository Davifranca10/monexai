import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  
  await resend.emails.send({
    from: 'MonexAI <contato@monex-ai.com>',
    to: email,
    subject: 'Verifique seu email - MonexAI',
    html: `
      <h1>Bem-vindo ao MonexAI!</h1>
      <p>Clique no link abaixo para verificar seu email:</p>
      <a href="${verificationUrl}">Verificar Email</a>
      <p>Este link expira em 24 horas.</p>
    `,
  });
}