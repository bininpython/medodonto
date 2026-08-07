"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setError("E-mail ou senha incorretos.");
      setIsLoading(false);
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <div className="w-full max-w-sm mx-auto px-6">
      {/* Logo */}
      <div className="flex flex-col items-center mb-10">
        <Image
          src="/logo.svg"
          alt="Med Odonto Logo"
          width={120}
          height={120}
          className="mb-6"
          priority
        />
        <h1 className="text-2xl font-bold text-navy tracking-tight">
          MED ODONTO
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Gestão Financeira</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 text-center">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="email" className="text-navy font-medium text-sm">
            E-mail
          </Label>
          <Input
            id="email"
            type="email"
            placeholder="seu@email.com"
            autoComplete="email"
            {...register("email")}
            className="h-11"
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-navy font-medium text-sm">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="••••••"
            autoComplete="current-password"
            {...register("password")}
            className="h-11"
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 bg-rose-med hover:bg-rose-dark text-white font-semibold text-sm tracking-wide cursor-pointer"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "ENTRAR"
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="text-xs text-center text-muted-foreground mt-8">
        © {new Date().getFullYear()} Med Odonto — Todos os direitos reservados
      </p>
    </div>
  );
}
