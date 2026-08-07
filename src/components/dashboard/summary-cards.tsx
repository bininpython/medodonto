"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface SummaryCardsProps {
  saldo: number;
  entradas: number;
  despesas: number;
  resultado: number;
}

export function SummaryCards({
  saldo,
  entradas,
  despesas,
  resultado,
}: SummaryCardsProps) {
  const cards = [
    {
      title: "Saldo Atual",
      value: saldo,
      icon: Wallet,
      iconBg: "bg-navy/10",
      iconColor: "text-navy",
      valueColor: "text-navy",
    },
    {
      title: "Entradas do Mês",
      value: entradas,
      icon: ArrowDownLeft,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-600",
    },
    {
      title: "Despesas do Mês",
      value: despesas,
      icon: ArrowUpRight,
      iconBg: "bg-rose-med/10",
      iconColor: "text-rose-med",
      valueColor: "text-rose-med",
    },
    {
      title: "Resultado do Mês",
      value: resultado,
      icon: TrendingUp,
      iconBg: resultado >= 0 ? "bg-emerald-50" : "bg-red-50",
      iconColor: resultado >= 0 ? "text-emerald-600" : "text-red-600",
      valueColor: resultado >= 0 ? "text-emerald-600" : "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card
          key={card.title}
          className="bg-white border border-border/50 shadow-xs hover:shadow-sm transition-shadow"
        >
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">
                {card.title}
              </p>
              <div
                className={`h-9 w-9 rounded-lg ${card.iconBg} flex items-center justify-center`}
              >
                <card.icon className={`h-4 w-4 ${card.iconColor}`} />
              </div>
            </div>
            <p className={`text-2xl font-bold ${card.valueColor}`}>
              {formatCurrency(card.value)}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
