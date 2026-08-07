"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, calculateMargin } from "@/lib/utils";

interface MonthResultProps {
  receita: number;
  despesas: number;
}

export function MonthResult({ receita, despesas }: MonthResultProps) {
  const resultado = receita - despesas;
  const margem = calculateMargin(receita, despesas);

  return (
    <Card className="bg-white border border-border/50 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-navy">
          Resultado do Mês
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0 space-y-4">
        <div className="flex items-center justify-between py-2">
          <span className="text-sm text-muted-foreground">Receita</span>
          <span className="text-sm font-semibold text-emerald-600">
            {formatCurrency(receita)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-dashed border-border">
          <span className="text-sm text-muted-foreground">Despesas</span>
          <span className="text-sm font-semibold text-rose-med">
            {formatCurrency(despesas)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm font-medium text-navy">Resultado</span>
          <span
            className={`text-lg font-bold ${
              resultado >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {formatCurrency(resultado)}
          </span>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Margem</span>
          <span
            className={`text-sm font-semibold ${
              margem >= 0 ? "text-emerald-600" : "text-red-600"
            }`}
          >
            {margem.toFixed(1)}%
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
