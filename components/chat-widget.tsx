'use client';

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  Bot,
  User,
  AlertCircle,
  Crown,
  Trash2,
  RefreshCw,
  Lock,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export function ChatWidget() {
  const sessionData = useSession();
  const session = sessionData?.data;
  const status = sessionData?.status || 'loading';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const [dailyCount, setDailyCount] = useState(0);
  const [limitReached, setLimitReached] = useState(false);
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | null>(null);
  const [clearingChat, setClearingChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && session?.user?.id) {
      loadChatData();
    }
  }, [isOpen, session?.user?.id]);

  const loadChatData = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch('/api/chat/history');
      const data = await res.json();

      if (res.ok) {
        setMessages(data.messages || []);
        setIsPro(data.isPro || false);
        setDailyCount(data.dailyCount || 0);
        setLimitReached(data.limitReached || false);
      } else {
        if (res.status === 403) {
          setIsPro(false);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar dados do chat:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      fetch('/api/user/avatar')
        .then((res) => res.json())
        .then((data) => {
          if (data.avatarUrl) {
            setUserAvatarUrl(data.avatarUrl);
          }
        })
        .catch((error) => {
          console.error('Erro ao carregar avatar:', error);
        });
    }
  }, [session?.user?.id]);

  const handleClearChat = async () => {
    if (!confirm('Tem certeza que deseja limpar todo o histórico do chat?')) {
      return;
    }

    setClearingChat(true);
    try {
      const res = await fetch('/api/chat/history', {
        method: 'DELETE',
      });

      if (res.ok) {
        setMessages([]);
        toast.success('Histórico do chat limpo com sucesso!');
      } else {
        const data = await res.json();
        toast.error(data.error || 'Erro ao limpar histórico');
      }
    } catch (error) {
      console.error('Erro ao limpar chat:', error);
      toast.error('Erro ao limpar histórico do chat');
    } finally {
      setClearingChat(false);
    }
  };

  const handleSend = async () => {
    if (!isPro) {
      toast.error('Chat com IA é exclusivo para usuários Pro');
      return;
    }

    if (!input.trim() || isLoading || limitReached) return;

    const userMessage = input.trim();
    setInput('');

    const tempUserMsg: Message = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: userMessage,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        
        if (res.status === 403) {
          setIsPro(false);
          toast.error('Este recurso é exclusivo para usuários Pro');
          setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsg.id));
          return;
        }
        
        throw new Error(errorData.error || 'Erro ao enviar mensagem');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream não disponível');
      }

      let assistantContent = '';
      const assistantMsg: Message = {
        id: `temp-assistant-${Date.now()}`,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMsg]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                assistantContent += parsed.content;
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMsg.id
                      ? { ...msg, content: assistantContent }
                      : msg
                  )
                );
              }
              if (parsed.dailyCount !== undefined) {
                setDailyCount(parsed.dailyCount);
              }
              if (parsed.limitReached) {
                setLimitReached(true);
              }
            } catch (e) {
              // Ignore parsing errors
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Erro ao enviar mensagem');
      setMessages((prev) => prev.filter((msg) => msg.id !== tempUserMsg.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ✅ REMOVIDO O BLOQUEIO - Agora sempre renderiza
  // Apenas não mostra se não tiver sessão
  const isAuthenticated = status === 'authenticated' && session?.user;

  return (
    <>
      {/* Floating Button - SEMPRE visível quando autenticado */}
      {!isOpen && isAuthenticated && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-700 hover:bg-green-800 text-white rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 relative group"
          aria-label="Abrir Chat IA"
        >
          <MessageCircle className="h-6 w-6" />
          {!isPro && (
            <div className="absolute -top-1 -right-1 bg-yellow-500 rounded-full p-1">
              <Lock className="h-3 w-3 text-white" />
            </div>
          )}
        </button>
      )}

      {/* Pop-up Chat Widget */}
      {isOpen && isAuthenticated && (
        <div className="fixed bottom-6 right-6 md:right-6 md:bottom-6 z-50 
                        w-[calc(100vw-2rem)] md:w-[420px] 
                        h-[calc(100vh-2rem)] md:h-[600px] 
                        max-h-[80vh] md:max-h-[80vh]
                        flex flex-col bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden
                        md:left-auto left-4">
          {/* Header */}
          <div className={`px-4 py-3 flex items-center justify-between ${
            isPro 
              ? 'bg-gradient-to-r from-green-700 to-green-600' 
              : 'bg-gradient-to-r from-gray-600 to-gray-500'
          } text-white`}>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm">Chat com IA</h3>
                  {isPro ? (
                    <Crown className="h-4 w-4 text-yellow-300" />
                  ) : (
                    <Lock className="h-4 w-4 text-gray-300" />
                  )}
                </div>
                <p className="text-xs text-white/80">
                  {isPro ? 'Assistente Financeiro Pessoal' : 'Recurso bloqueado'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={loadChatData}
                disabled={loadingHistory}
                className={`${isPro ? 'hover:bg-green-800' : 'hover:bg-gray-700'} text-white h-8 w-8 p-0`}
                title="Recarregar status"
              >
                <RefreshCw className={`h-4 w-4 ${loadingHistory ? 'animate-spin' : ''}`} />
              </Button>
              
              {isPro && messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearChat}
                  disabled={clearingChat}
                  className="hover:bg-green-800 text-white h-8 w-8 p-0"
                  title="Limpar conversa"
                >
                  {clearingChat ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className={`${isPro ? 'hover:bg-green-800' : 'hover:bg-gray-700'} text-white h-8 w-8 p-0`}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {!isPro ? (
            // VERSÃO FREE - Preview com Blur
            <div className="flex-1 flex flex-col relative">
              <div className="flex-1 p-4 relative overflow-hidden">
                <div className="space-y-4 blur-sm select-none pointer-events-none opacity-40">
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="max-w-[75%] px-3 py-2 rounded-lg bg-gray-100">
                      <p className="text-sm">Olá! Sou seu assistente financeiro. Como posso ajudar?</p>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="max-w-[75%] px-3 py-2 rounded-lg bg-green-700 text-white">
                      <p className="text-sm">Quanto gastei esse mês?</p>
                    </div>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-green-700 text-white">
                        <User className="h-5 w-5" />
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="flex gap-2 justify-start">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                      <Bot className="h-5 w-5 text-green-700" />
                    </div>
                    <div className="max-w-[75%] px-3 py-2 rounded-lg bg-gray-100">
                      <p className="text-sm">Você gastou R$ 3.450,00 este mês. A maior despesa foi em Alimentação...</p>
                    </div>
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm">
                  <div className="text-center p-6 max-w-sm">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 mb-4 shadow-lg">
                      <Lock className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="font-bold text-xl mb-2 text-gray-900">
                      Recurso Exclusivo Pro
                    </h3>
                    <p className="text-gray-600 mb-4 text-sm">
                      Desbloqueie o Chat com IA e tenha análises inteligentes das suas finanças, dicas personalizadas e muito mais!
                    </p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span>Análises financeiras inteligentes</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span>Respostas personalizadas 24/7</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Sparkles className="h-4 w-4 text-yellow-500" />
                        <span>Dicas para economizar</span>
                      </div>
                    </div>
                    <Link href="/app/assinatura">
                      <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white w-full shadow-lg">
                        <Crown className="h-4 w-4 mr-2" />
                        Assinar MonexAI Pro
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex gap-2 relative">
                  <Input
                    placeholder="Chat disponível apenas no plano Pro..."
                    disabled
                    className="flex-1 bg-white opacity-50 cursor-not-allowed"
                  />
                  <Button disabled className="bg-gray-400 cursor-not-allowed">
                    <Lock className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            // VERSÃO PRO
            <>
              <ScrollArea className="flex-1 p-4">
                {loadingHistory ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="h-8 w-8 animate-spin text-green-700" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                    <Bot className="h-12 w-12 mb-3 text-gray-300" />
                    <p className="text-sm">
                      Olá! Sou seu assistente financeiro.
                      <br />
                      Como posso ajudar você hoje?
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex gap-2 ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        {msg.role === 'assistant' && (
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                            <Bot className="h-5 w-5 text-green-700" />
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] px-3 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-green-700 text-white'
                              : 'bg-gray-100 text-gray-900'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">
                            {msg.content}
                          </p>
                        </div>
                        {msg.role === 'user' && (
                          <Avatar className="w-8 h-8 flex-shrink-0">
                            <AvatarImage src={userAvatarUrl || undefined} alt="Avatar" />
                            <AvatarFallback className="bg-green-700 text-white">
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>

              {limitReached && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-red-800">
                      Limite diário atingido. Tente novamente amanhã.
                    </p>
                  </div>
                </div>
              )}

              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua mensagem..."
                    disabled={isLoading || limitReached}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSend}
                    disabled={isLoading || !input.trim() || limitReached}
                    className="bg-green-700 hover:bg-green-800"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}