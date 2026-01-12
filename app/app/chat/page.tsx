import { redirect } from 'next/navigation';

// Chat agora é exclusivamente via widget flutuante
// Redirecionando para o dashboard
export default function ChatPage() {
  redirect('/app/dashboard');
}
