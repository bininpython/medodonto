"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  Wallet,
  BarChart3,
  History,
  Settings,
  LogOut,
  User,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Entradas", href: "/entradas", icon: ArrowDownLeft },
  { name: "Despesas", href: "/despesas", icon: ArrowUpRight },
  { name: "Contas", href: "/contas", icon: FileText },
  { name: "Caixa", href: "/caixa", icon: Wallet },
  { name: "Relatórios", href: "/relatorios", icon: BarChart3 },
  { name: "Histórico", href: "/historico", icon: History },
  { name: "Configurações", href: "/configuracoes", icon: Settings },
];

interface SidebarProps {
  userName?: string;
  userEmail?: string;
}

export function Sidebar({ userName, userEmail }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r border-border">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
        <Image src="/logo.svg" alt="Med Odonto" width={40} height={40} />
        <div>
          <h2 className="text-sm font-bold text-navy leading-tight">
            MED ODONTO
          </h2>
          <p className="text-[10px] text-muted-foreground">
            Gestão Financeira
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-navy text-white"
                  : "text-muted-foreground hover:bg-muted hover:text-navy"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info */}
      <div className="border-t border-border p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center">
            <User className="h-4 w-4 text-navy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-navy truncate">
              {userName || "Usuário"}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {userEmail || ""}
            </p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center gap-2 px-3 py-2 w-full text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}

export { navigation };
