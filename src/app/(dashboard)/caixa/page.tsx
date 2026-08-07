import { createClient } from "@/lib/supabase/server";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ArrowDownLeft, ArrowUpRight, Equal } from "lucide-react";

export default async function CaixaPage() {
  const supabase = await createClient();

  // All-time received income
  const { data: allIncome } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .eq("status", "received");

  // All-time paid expenses
  const { data: allExpenses } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "expense")
    .eq("status", "paid");

  const totalIncome = (allIncome || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalExpenses = (allExpenses || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const saldo = totalIncome - totalExpenses;

  // Monthly breakdown for the current year
  const currentYear = new Date().getFullYear();
  const { data: yearIncome } = await supabase
    .from("transactions")
    .select("amount, transaction_date")
    .eq("type", "income")
    .eq("status", "received")
    .gte("transaction_date", `${currentYear}-01-01`)
    .lte("transaction_date", `${currentYear}-12-31`);

  const { data: yearExpenses } = await supabase
    .from("transactions")
    .select("amount, transaction_date")
    .eq("type", "expense")
    .eq("status", "paid")
    .gte("transaction_date", `${currentYear}-01-01`)
    .lte("transaction_date", `${currentYear}-12-31`);

  // Group by month
  const monthlyData: Record<string, { entradas: number; despesas: number }> = {};
  const months = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez",
  ];

  months.forEach((m, i) => {
    monthlyData[String(i + 1).padStart(2, "0")] = { entradas: 0, despesas: 0 };
  });

  (yearIncome || []).forEach((t) => {
    const month = t.transaction_date.split("-")[1];
    if (monthlyData[month]) monthlyData[month].entradas += Number(t.amount);
  });

  (yearExpenses || []).forEach((t) => {
    const month = t.transaction_date.split("-")[1];
    if (monthlyData[month]) monthlyData[month].despesas += Number(t.amount);
  });

  // Pending amounts
  const { data: pendingIncome } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "income")
    .eq("status", "pending");

  const { data: pendingExpenses } = await supabase
    .from("transactions")
    .select("amount")
    .eq("type", "expense")
    .eq("status", "pending");

  const totalPendingIncome = (pendingIncome || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalPendingExpenses = (pendingExpenses || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Caixa</h1>
        <p className="text-sm text-muted-foreground">
          Visão consolidada do caixa da empresa
        </p>
      </div>

      {/* Cash Flow Summary */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">
            Resumo do Caixa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 items-center">
            {/* Entradas */}
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-emerald-50 flex items-center justify-center mx-auto mb-3">
                <ArrowDownLeft className="h-6 w-6 text-emerald-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Total Entradas
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {formatCurrency(totalIncome)}
              </p>
            </div>

            {/* Minus */}
            <div className="hidden sm:flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <span className="text-lg font-bold text-muted-foreground">
                  −
                </span>
              </div>
            </div>

            {/* Despesas */}
            <div className="text-center">
              <div className="h-12 w-12 rounded-xl bg-rose-med/10 flex items-center justify-center mx-auto mb-3">
                <ArrowUpRight className="h-6 w-6 text-rose-med" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">
                Total Despesas
              </p>
              <p className="text-xl font-bold text-rose-med">
                {formatCurrency(totalExpenses)}
              </p>
            </div>

            {/* Equals */}
            <div className="text-center border-t sm:border-t-0 sm:border-l border-border pt-4 sm:pt-0 sm:pl-6">
              <div className="h-12 w-12 rounded-xl bg-navy/10 flex items-center justify-center mx-auto mb-3">
                <Wallet className="h-6 w-6 text-navy" />
              </div>
              <p className="text-xs text-muted-foreground mb-1">Saldo Atual</p>
              <p
                className={`text-2xl font-bold ${
                  saldo >= 0 ? "text-navy" : "text-red-600"
                }`}
              >
                {formatCurrency(saldo)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pending */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-white border border-border/50 shadow-xs">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Entradas Pendentes
            </p>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(totalPendingIncome)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Valores a receber ainda não confirmados
            </p>
          </CardContent>
        </Card>
        <Card className="bg-white border border-border/50 shadow-xs">
          <CardContent className="p-5">
            <p className="text-sm text-muted-foreground mb-1">
              Despesas Pendentes
            </p>
            <p className="text-xl font-bold text-amber-600">
              {formatCurrency(totalPendingExpenses)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Valores a pagar ainda não confirmados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">
            Movimentação Mensal — {currentYear}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 font-semibold text-navy">
                    Mês
                  </th>
                  <th className="text-right py-2 font-semibold text-emerald-600">
                    Entradas
                  </th>
                  <th className="text-right py-2 font-semibold text-rose-med">
                    Despesas
                  </th>
                  <th className="text-right py-2 font-semibold text-navy">
                    Resultado
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthlyData).map(([monthNum, data]) => {
                  const idx = parseInt(monthNum) - 1;
                  const resultado = data.entradas - data.despesas;
                  return (
                    <tr
                      key={monthNum}
                      className="border-b border-border/50 hover:bg-muted/30"
                    >
                      <td className="py-2.5 font-medium">{months[idx]}</td>
                      <td className="py-2.5 text-right text-emerald-600">
                        {data.entradas > 0
                          ? formatCurrency(data.entradas)
                          : "—"}
                      </td>
                      <td className="py-2.5 text-right text-rose-med">
                        {data.despesas > 0
                          ? formatCurrency(data.despesas)
                          : "—"}
                      </td>
                      <td
                        className={`py-2.5 text-right font-semibold ${
                          resultado >= 0
                            ? "text-emerald-600"
                            : "text-red-600"
                        }`}
                      >
                        {data.entradas > 0 || data.despesas > 0
                          ? formatCurrency(resultado)
                          : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
