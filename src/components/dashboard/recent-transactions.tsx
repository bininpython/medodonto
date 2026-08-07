"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency, formatDateShort } from "@/lib/utils";
import { ArrowDownLeft, ArrowUpRight } from "lucide-react";

interface RecentTransaction {
  id: string;
  description: string;
  type: "income" | "expense";
  amount: number;
  transaction_date: string;
  category_name?: string;
}

interface RecentTransactionsProps {
  transactions: RecentTransaction[];
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  return (
    <Card className="bg-white border border-border/50 shadow-xs">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold text-navy">
          Movimentações Recentes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            Nenhuma movimentação registrada
          </p>
        ) : (
          <div className="space-y-1">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 py-2.5 px-2 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                    tx.type === "income"
                      ? "bg-emerald-50"
                      : "bg-rose-med/10"
                  }`}
                >
                  {tx.type === "income" ? (
                    <ArrowDownLeft className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-rose-med" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDateShort(tx.transaction_date)}
                    {tx.category_name && ` · ${tx.category_name}`}
                  </p>
                </div>
                <p
                  className={`text-sm font-semibold whitespace-nowrap ${
                    tx.type === "income"
                      ? "text-emerald-600"
                      : "text-rose-med"
                  }`}
                >
                  {tx.type === "income" ? "+" : "-"}{" "}
                  {formatCurrency(tx.amount)}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
