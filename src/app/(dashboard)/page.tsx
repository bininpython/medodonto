import { createClient } from "@/lib/supabase/server";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { RevenueExpensesChart } from "@/components/dashboard/revenue-expenses-chart";
import { CashFlowChart } from "@/components/dashboard/cash-flow-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { MonthResult } from "@/components/dashboard/month-result";
import { MonthlyComparison } from "@/components/dashboard/monthly-comparison";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

export default async function DashboardPage() {
  let currentIncome = null;
  let currentExpenses = null;
  let prevIncome = null;
  let prevExpenses = null;
  let allIncome = null;
  let allExpenses = null;
  let recentTx = null;
  
  const monthlyData = [];
  let cumulativeSaldo = 0;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      
      // Current month income (received only)
      const { data: ci } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("status", "received")
        .gte("transaction_date", currentMonthStart)
        .lte("transaction_date", currentMonthEnd);
      currentIncome = ci;

      // Current month expenses (paid only)
      const { data: ce } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("status", "paid")
        .gte("transaction_date", currentMonthStart)
        .lte("transaction_date", currentMonthEnd);
      currentExpenses = ce;

      // Previous month income
      const { data: pi } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("status", "received")
        .gte("transaction_date", prevMonthStart)
        .lte("transaction_date", prevMonthEnd);
      prevIncome = pi;

      // Previous month expenses
      const { data: pe } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("status", "paid")
        .gte("transaction_date", prevMonthStart)
        .lte("transaction_date", prevMonthEnd);
      prevExpenses = pe;

      // Total balance (all time)
      const { data: ai } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("status", "received");
      allIncome = ai;

      const { data: ae } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("status", "paid");
      allExpenses = ae;

      // Recent transactions
      const { data: rtx } = await supabase
        .from("transactions")
        .select("id, description, type, amount, transaction_date, category_id, categories(name)")
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false })
        .limit(10);
      recentTx = rtx;

      // Pre-calculate initial balance before 12 months ago
      const twelveMonthsAgo = startOfMonth(subMonths(now, 11))
        .toISOString()
        .split("T")[0];

      const { data: preIncome } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "income")
        .eq("status", "received")
        .lt("transaction_date", twelveMonthsAgo);

      const { data: preExpenses } = await supabase
        .from("transactions")
        .select("amount")
        .eq("type", "expense")
        .eq("status", "paid")
        .lt("transaction_date", twelveMonthsAgo);

      cumulativeSaldo =
        (preIncome || []).reduce((sum, t) => sum + Number(t.amount), 0) -
        (preExpenses || []).reduce((sum, t) => sum + Number(t.amount), 0);

      for (let i = 11; i >= 0; i--) {
        const monthDate = subMonths(now, i);
        const mStart = startOfMonth(monthDate).toISOString().split("T")[0];
        const mEnd = endOfMonth(monthDate).toISOString().split("T")[0];

        const { data: mIncome } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "income")
          .eq("status", "received")
          .gte("transaction_date", mStart)
          .lte("transaction_date", mEnd);

        const { data: mExpenses } = await supabase
          .from("transactions")
          .select("amount")
          .eq("type", "expense")
          .eq("status", "paid")
          .gte("transaction_date", mStart)
          .lte("transaction_date", mEnd);

        const entradas = (mIncome || []).reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );
        const despesas = (mExpenses || []).reduce(
          (sum, t) => sum + Number(t.amount),
          0
        );
        cumulativeSaldo += entradas - despesas;

        monthlyData.push({
          month: format(monthDate, "MMM", { locale: ptBR }),
          entradas,
          despesas,
          saldo: cumulativeSaldo,
        });
      }
    } catch (error) {
      console.error("Dashboard data fetch error:", error);
    }
  }

  // Se o Supabase não estiver configurado, preencher o array mensal com zero para evitar quebrar o gráfico
  if (monthlyData.length === 0) {
    for (let i = 11; i >= 0; i--) {
      monthlyData.push({
        month: format(subMonths(now, i), "MMM", { locale: ptBR }),
        entradas: 0,
        despesas: 0,
        saldo: 0,
      });
    }
  }

  // Calculate totals
  const totalCurrentIncome = (currentIncome || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalCurrentExpenses = (currentExpenses || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalPrevIncome = (prevIncome || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalPrevExpenses = (prevExpenses || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalAllIncome = (allIncome || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );
  const totalAllExpenses = (allExpenses || []).reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  const saldo = totalAllIncome - totalAllExpenses;
  const resultado = totalCurrentIncome - totalCurrentExpenses;
  const prevResultado = totalPrevIncome - totalPrevExpenses;

  // Percentage changes
  const receitaChange =
    totalPrevIncome === 0
      ? 0
      : ((totalCurrentIncome - totalPrevIncome) / totalPrevIncome) * 100;
  const despesasChange =
    totalPrevExpenses === 0
      ? 0
      : ((totalCurrentExpenses - totalPrevExpenses) / totalPrevExpenses) * 100;
  const resultadoChange =
    prevResultado === 0
      ? 0
      : ((resultado - prevResultado) / Math.abs(prevResultado)) * 100;

  // Format recent transactions
  const formattedRecentTx = (recentTx || []).map((tx) => ({
    id: tx.id,
    description: tx.description,
    type: tx.type as "income" | "expense",
    amount: Number(tx.amount),
    transaction_date: tx.transaction_date,
    category_name: (tx.categories as unknown as { name: string } | null)?.name,
  }));

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div>
        <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visão geral das finanças da empresa
        </p>
      </div>

      {/* Summary Cards */}
      <SummaryCards
        saldo={saldo}
        entradas={totalCurrentIncome}
        despesas={totalCurrentExpenses}
        resultado={resultado}
      />

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <RevenueExpensesChart data={monthlyData} />
        <CashFlowChart data={monthlyData} />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentTransactions transactions={formattedRecentTx} />
        </div>
        <div className="space-y-6">
          <MonthResult
            receita={totalCurrentIncome}
            despesas={totalCurrentExpenses}
          />
          <MonthlyComparison
            receitaChange={receitaChange}
            despesasChange={despesasChange}
            resultadoChange={resultadoChange}
          />
        </div>
      </div>
    </div>
  );
}
