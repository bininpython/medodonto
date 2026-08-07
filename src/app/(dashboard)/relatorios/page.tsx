"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Printer, FileDown } from "lucide-react";

const COLORS = [
  "#1B2A5B", "#E8426F", "#10B981", "#F59E0B", "#8B5CF6",
  "#06B6D4", "#EC4899", "#14B8A6", "#F97316", "#6366F1",
];

export default function RelatoriosPage() {
  const supabase = createClient();
  const now = new Date();
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    .toISOString()
    .split("T")[0];

  const [dateFrom, setDateFrom] = useState(firstDay);
  const [dateTo, setDateTo] = useState(lastDay);
  const [totals, setTotals] = useState({ entradas: 0, despesas: 0 });
  const [incomeByCategory, setIncomeByCategory] = useState<{ name: string; value: number }[]>([]);
  const [expenseByCategory, setExpenseByCategory] = useState<{ name: string; value: number }[]>([]);
  const [byPaymentMethod, setByPaymentMethod] = useState<{ name: string; value: number }[]>([]);

  const PAYMENT_LABELS: Record<string, string> = {
    pix: "PIX",
    dinheiro: "Dinheiro",
    cartao_debito: "Cartão de Débito",
    cartao_credito: "Cartão de Crédito",
    transferencia: "Transferência",
    boleto: "Boleto",
    outro: "Outro",
  };

  const fetchReport = useCallback(async () => {
    // Income
    const { data: income } = await supabase
      .from("transactions")
      .select("amount, category_id, payment_method, categories(name)")
      .eq("type", "income")
      .gte("transaction_date", dateFrom)
      .lte("transaction_date", dateTo);

    // Expenses
    const { data: expenses } = await supabase
      .from("transactions")
      .select("amount, category_id, payment_method, categories(name)")
      .eq("type", "expense")
      .gte("transaction_date", dateFrom)
      .lte("transaction_date", dateTo);

    const totalIncome = (income || []).reduce((s, t) => s + Number(t.amount), 0);
    const totalExpenses = (expenses || []).reduce((s, t) => s + Number(t.amount), 0);
    setTotals({ entradas: totalIncome, despesas: totalExpenses });

    // Group income by category
    const incCat: Record<string, number> = {};
    (income || []).forEach((t) => {
      const name = (t.categories as unknown as { name: string } | null)?.name || "Outros";
      incCat[name] = (incCat[name] || 0) + Number(t.amount);
    });
    setIncomeByCategory(Object.entries(incCat).map(([name, value]) => ({ name, value })));

    // Group expenses by category
    const expCat: Record<string, number> = {};
    (expenses || []).forEach((t) => {
      const name = (t.categories as unknown as { name: string } | null)?.name || "Outros";
      expCat[name] = (expCat[name] || 0) + Number(t.amount);
    });
    setExpenseByCategory(Object.entries(expCat).map(([name, value]) => ({ name, value })));

    // Group by payment method
    const pmAll: Record<string, number> = {};
    [...(income || []), ...(expenses || [])].forEach((t) => {
      const pm = PAYMENT_LABELS[t.payment_method] || t.payment_method;
      pmAll[pm] = (pmAll[pm] || 0) + Number(t.amount);
    });
    setByPaymentMethod(Object.entries(pmAll).map(([name, value]) => ({ name, value })));
  }, [supabase, dateFrom, dateTo]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const resultado = totals.entradas - totals.despesas;
  const saldo = totals.entradas - totals.despesas;

  const quickPeriods = [
    {
      label: "Este mês",
      fn: () => {
        setDateFrom(firstDay);
        setDateTo(lastDay);
      },
    },
    {
      label: "Mês passado",
      fn: () => {
        const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        setDateFrom(prev.toISOString().split("T")[0]);
        setDateTo(
          new Date(now.getFullYear(), now.getMonth(), 0)
            .toISOString()
            .split("T")[0]
        );
      },
    },
    {
      label: "Este ano",
      fn: () => {
        setDateFrom(`${now.getFullYear()}-01-01`);
        setDateTo(`${now.getFullYear()}-12-31`);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Relatórios</h1>
          <p className="text-sm text-muted-foreground">
            Análise detalhada das finanças
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="cursor-pointer"
          >
            <Printer className="h-4 w-4 mr-2" />
            Imprimir
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled
            className="cursor-pointer"
            title="Em breve"
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Period */}
      <Card className="bg-white border border-border/50 shadow-xs no-print">
        <CardContent className="p-4">
          <div className="flex flex-wrap items-end gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Data inicial</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9 w-[160px]"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Data final</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9 w-[160px]"
              />
            </div>
            <div className="flex gap-1">
              {quickPeriods.map((p) => (
                <Button
                  key={p.label}
                  variant="ghost"
                  size="sm"
                  onClick={p.fn}
                  className="text-xs cursor-pointer"
                >
                  {p.label}
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="bg-white border shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Entradas</p>
            <p className="text-xl font-bold text-emerald-600">
              {formatCurrency(totals.entradas)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Total Despesas</p>
            <p className="text-xl font-bold text-rose-med">
              {formatCurrency(totals.despesas)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Resultado</p>
            <p className={`text-xl font-bold ${resultado >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatCurrency(resultado)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border shadow-xs">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Saldo</p>
            <p className={`text-xl font-bold ${saldo >= 0 ? "text-navy" : "text-red-600"}`}>
              {formatCurrency(saldo)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income by category */}
        <Card className="bg-white border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">
              Entradas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {incomeByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados no período
              </p>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={incomeByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                      }
                      labelLine={false}
                    >
                      {incomeByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Expense by category */}
        <Card className="bg-white border shadow-xs">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-navy">
              Despesas por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            {expenseByCategory.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Sem dados no período
              </p>
            ) : (
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseByCategory}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) =>
                        `${name} ${percent !== undefined ? (percent * 100).toFixed(0) : "0"}%`
                      }
                      labelLine={false}
                    >
                      {expenseByCategory.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Payment methods */}
      <Card className="bg-white border shadow-xs">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-navy">
            Formas de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          {byPaymentMethod.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Sem dados no período
            </p>
          ) : (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={byPaymentMethod}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 80, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" horizontal={false} />
                  <XAxis type="number" tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 11, fill: "#6B7280" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#374151" }} axisLine={false} tickLine={false} width={80} />
                  <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                  <Bar dataKey="value" name="Total" fill="#1B2A5B" radius={[0, 4, 4, 0]} maxBarSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
