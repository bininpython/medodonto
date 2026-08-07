"use client";

import { MobileNav } from "./mobile-nav";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

interface HeaderProps {
  userName?: string;
  userEmail?: string;
}

export function Header({ userName, userEmail }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="flex items-center justify-between h-14 px-4 lg:px-6">
        {/* Mobile menu */}
        <MobileNav userName={userName} userEmail={userEmail} />

        {/* Search */}
        <div className="flex-1 max-w-md mx-4 hidden sm:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar movimentação..."
              className="pl-9 h-9 bg-muted/50 border-0 focus-visible:bg-white focus-visible:border-border"
            />
          </div>
        </div>

        {/* User badge (desktop) */}
        <div className="hidden lg:flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-navy/10 flex items-center justify-center">
            <span className="text-xs font-semibold text-navy">
              {userName?.charAt(0)?.toUpperCase() || "U"}
            </span>
          </div>
          <span className="text-sm font-medium text-navy">
            {userName || "Usuário"}
          </span>
        </div>
      </div>
    </header>
  );
}
