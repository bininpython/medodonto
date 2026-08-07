"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MonthlyComparisonProps {
  receitaChange: number;
  despesasChange: number;
  resultadoChange: number;
}

export function MonthlyComparison({
  receitaChange,
  despesasChange,
  resultadoChange,
}: MonthlyComparisonProps) {
  const getIndicator = (value: number, invertColors = false) => {
    const isPositive = value > 0;
    const isNeutral = value === 0;

    if (isNeutral) {
      return {
        color: "text-muted-foreground",
        bg: "bg-muted",
        text: "0%",
      };
    }

    const goodTrend = invertColors ? !isPositive : isPositive;

    return {
      color: goodTrend ? "text-emerald-600" : "text-rose-med",
      bg: goodTrend ? "bg-emerald-50" : "bg-rose-med/10",
      text: `${isPositive ? "↑" : "↓"} ${Math.abs(value).toFixed(1)}%`,
    };
  };

  const items = [
    { name: "Receita", indicator: getIndicator(receitaChange) },
    { name: "Despesas", indicator: getIndicator(despesasChange, true) },
    { name: "Resultado", indicator: getIndicator(resultadoChange) },
  ];

  return (
    <Card className="bg-white border border-border/50 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-navy">
          Comparativo Mensal
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Este mês vs mês anterior
        </p>
      </CardHeader>
      <CardContent className="pt-0 space-y-3">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex items-center justify-between py-2"
          >
            <span className="text-sm text-muted-foreground">{item.name}</span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${item.indicator.bg} ${item.indicator.color}`}
            >
              {item.indicator.text}
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
