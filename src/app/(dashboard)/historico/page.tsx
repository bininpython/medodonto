"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Category } from "@/types/database";

interface HistoryItem {
  id: string;
  type: "income" | "expense";
  description: string;
  amount: number;
  transaction_date: string;
  category_name: string | null;
  user_name: string | null;
}

export default function HistoricoPage() {
  const supabase = createClient();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    let query = supabase
      .from("transactions")
      .select("id, type, description, amount, transaction_date, categories(name), profiles(name)")
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.ilike("description", `%${search}%`);
    }
    if (typeFilter !== "all") {
      query = query.eq("type", typeFilter);
    }
    if (dateFrom) {
      query = query.gte("transaction_date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("transaction_date", dateTo);
    }

    const { data } = await query;

    setItems(
      (data || []).map((t) => ({
        id: t.id,
        type: t.type as "income" | "expense",
        description: t.description,
        amount: Number(t.amount),
        transaction_date: t.transaction_date,
        category_name: (t.categories as unknown as { name: string } | null)?.name || null,
        user_name: (t.profiles as unknown as { name: string } | null)?.name || null,
      }))
    );
  }, [supabase, search, typeFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Histórico</h1>
        <p className="text-sm text-muted-foreground">
          Todas as movimentações financeiras
        </p>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
            <Input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-[140px]"
            />
            <Input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-[140px]"
            />
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v || "all")}>
              <SelectTrigger className="h-9 w-[130px] cursor-pointer">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Entrada</SelectItem>
                <SelectItem value="expense">Despesa</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="text-center py-12 text-sm text-muted-foreground">
              Nenhuma movimentação encontrada
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-navy font-semibold">Data</TableHead>
                    <TableHead className="text-navy font-semibold">Tipo</TableHead>
                    <TableHead className="text-navy font-semibold">Descrição</TableHead>
                    <TableHead className="text-navy font-semibold hidden md:table-cell">
                      Categoria
                    </TableHead>
                    <TableHead className="text-navy font-semibold text-right">
                      Valor
                    </TableHead>
                    <TableHead className="text-navy font-semibold hidden lg:table-cell">
                      Usuário
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id} className="hover:bg-muted/30">
                      <TableCell className="text-sm whitespace-nowrap">
                        {formatDate(item.transaction_date)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={`text-xs ${
                            item.type === "income"
                              ? "bg-emerald-50 text-emerald-600"
                              : "bg-rose-med/10 text-rose-med"
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {item.type === "income" ? (
                              <ArrowDownLeft className="h-3 w-3" />
                            ) : (
                              <ArrowUpRight className="h-3 w-3" />
                            )}
                            {item.type === "income" ? "Entrada" : "Despesa"}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium max-w-[200px] truncate">
                        {item.description}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                        {item.category_name || "—"}
                      </TableCell>
                      <TableCell
                        className={`text-sm font-semibold text-right ${
                          item.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-med"
                        }`}
                      >
                        {item.type === "income" ? "+" : "-"}{" "}
                        {formatCurrency(item.amount)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                        {item.user_name || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
