'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  LayoutDashboard,
  Receipt,
  Repeat,
  FileText,
  MessageSquare,
  GraduationCap,
  Settings,
  CreditCard,
  LogOut,
  Crown,
  Menu,
  X,
} from 'lucide-react';
import { UserMode } from '@prisma/client';

const navItems = [
  { href: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/app/lancamentos', label: 'Lançamentos', icon: Receipt },
  { href: '/app/recorrencias', label: 'Recorrências', icon: Repeat },
  { href: '/app/templates', label: 'Templates', icon: FileText },
  { href: '/app/educacional', label: 'Central Educacional', icon: GraduationCap, proOnly: true },
  { href: '/app/configuracoes', label: 'Configurações', icon: Settings },
  { href: '/app/assinatura', label: 'Assinatura', icon: CreditCard },
];

export function AppSidebar({ mode, isPro }: { mode: UserMode; isPro: boolean }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const SidebarContent = () => (
    <>
      <div className="p-4 border-b">
        <Link href="/app/dashboard" className="flex items-center gap-2" onClick={() => setIsOpen(false)}>
          <Image src="/Logo.png" alt="MonexAI" width={36} height={36} />
          <span className="font-bold text-lg text-green-800">MonexAI</span>
        </Link>
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant="secondary" className="text-xs">
            {mode === 'PERSONAL' ? 'Pessoal' : 'Empresarial'}
          </Badge>
          {isPro && (
            <Badge className="bg-amber-500 text-xs">
              <Crown className="h-3 w-3 mr-1" /> Pro
            </Badge>
          )}
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const isLocked = item.proOnly && !isPro;

          return (
            <Link
              key={item.href}
              href={isLocked ? '/app/assinatura' : item.href}
              onClick={() => setIsOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              } ${isLocked ? 'opacity-60' : ''}`}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="flex-1 text-sm">{item.label}</span>
              {item.proOnly && !isPro && (
                <Crown className="h-4 w-4 text-amber-500 flex-shrink-0" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start text-gray-600"
          onClick={() => signOut({ callbackUrl: '/' })}
        >
          <LogOut className="h-5 w-5 mr-3" />
          Sair
        </Button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b px-4 py-3 flex items-center justify-between">
        <Link href="/app/dashboard" className="flex items-center gap-2">
          <Image src="/Logo.png" alt="MonexAI" width={32} height={32} />
          <span className="font-bold text-green-800">MonexAI</span>
        </Link>
        <div className="flex items-center gap-2">
          {isPro && (
            <Badge className="bg-amber-500 text-xs">
              <Crown className="h-3 w-3" />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-40 pt-14"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 left-0 bottom-0 w-72 bg-white z-50 flex flex-col transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <SidebarContent />
      </aside>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r h-screen sticky top-0 flex-col">
        <SidebarContent />
      </aside>
    </>
  );
}
