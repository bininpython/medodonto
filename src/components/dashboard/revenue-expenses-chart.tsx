"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface MonthData {
  month: string;
  entradas: number;
  despesas: number;
}

interface RevenueExpensesChartProps {
  data: MonthData[];
}

export function RevenueExpensesChart({ data }: RevenueExpensesChartProps) {
  const [period, setPeriod] = useState<6 | 12>(6);

  const displayData = data.slice(-period);

  return (
    <Card className="bg-white border border-border/50 shadow-xs">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-semibold text-navy">
          Entradas x Despesas
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant={period === 6 ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod(6)}
            className={`text-xs h-7 cursor-pointer ${
              period === 6
                ? "bg-navy text-white hover:bg-navy-light"
                : "text-muted-foreground"
            }`}
          >
            6 meses
          </Button>
          <Button
            variant={period === 12 ? "default" : "ghost"}
            size="sm"
            onClick={() => setPeriod(12)}
            className={`text-xs h-7 cursor-pointer ${
              period === 12
                ? "bg-navy text-white hover:bg-navy-light"
                : "text-muted-foreground"
            }`}
          >
            12 meses
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#E5E7EB"
                vertical={false}
              />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#6B7280" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) =>
                  `${(v / 1000).toFixed(0)}k`
                }
              />
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  borderRadius: "8px",
                  border: "1px solid #E5E7EB",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
              />
              <Bar
                dataKey="entradas"
                name="Entradas"
                fill="#1B2A5B"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="despesas"
                name="Despesas"
                fill="#E8426F"
                radius={[4, 4, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
