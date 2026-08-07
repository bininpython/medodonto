"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { navigation } from "./sidebar";
import { createClient } from "@/lib/supabase/client";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Menu, LogOut, User } from "lucide-react";

interface MobileNavProps {
  userName?: string;
  userEmail?: string;
}

export function MobileNav({ userName, userEmail }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/login");
    router.refresh();
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="lg:hidden inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium hover:bg-accent cursor-pointer"
      >
        <Menu className="h-5 w-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-72 p-0">
        <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-border">
          <Image src="/logo.svg" alt="Med Odonto" width={36} height={36} />
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
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setOpen(false)}
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

        {/* User */}
        <div className="border-t border-border p-4 mt-auto">
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
            className="flex items-center gap-2 px-3 py-2 w-full text-sm text-muted-foreground hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
