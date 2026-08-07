"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { TransactionForm } from "@/components/transactions/transaction-form";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionFilters } from "@/components/transactions/transaction-filters";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import type { Transaction, Category } from "@/types/database";
import type { TransactionFormData } from "@/lib/validators";
import { toast } from "sonner";

export default function EntradasPage() {
  const supabase = createClient();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentMethodFilter, setPaymentMethodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchData = useCallback(async () => {
    let query = supabase
      .from("transactions")
      .select("*, categories(name)")
      .eq("type", "income")
      .order("transaction_date", { ascending: false });

    if (search) {
      query = query.ilike("description", `%${search}%`);
    }
    if (categoryFilter !== "all") {
      query = query.eq("category_id", categoryFilter);
    }
    if (statusFilter !== "all") {
      query = query.eq("status", statusFilter);
    }
    if (paymentMethodFilter !== "all") {
      query = query.eq("payment_method", paymentMethodFilter);
    }
    if (dateFrom) {
      query = query.gte("transaction_date", dateFrom);
    }
    if (dateTo) {
      query = query.lte("transaction_date", dateTo);
    }

    const { data } = await query;
    setTransactions(
      (data || []).map((t) => ({
        ...t,
        category: t.categories as unknown as Category,
      }))
    );

    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("name");
    setCategories(cats || []);
  }, [supabase, search, categoryFilter, statusFilter, paymentMethodFilter, dateFrom, dateTo]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSubmit = async (data: TransactionFormData) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (editingTx) {
      const { error } = await supabase
        .from("transactions")
        .update({
          ...data,
          amount: data.amount,
        })
        .eq("id", editingTx.id);

      if (error) {
        toast.error("Erro ao atualizar entrada");
        return;
      }
      toast.success("Entrada atualizada com sucesso");
    } else {
      const { error } = await supabase.from("transactions").insert({
        ...data,
        amount: data.amount,
        created_by: user?.id,
      });

      if (error) {
        toast.error("Erro ao registrar entrada");
        return;
      }
      toast.success("Entrada registrada com sucesso");
    }

    setEditingTx(null);
    fetchData();
  };

  const handleEdit = (tx: Transaction) => {
    setEditingTx(tx);
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deletingTx) return;
    setIsDeleting(true);
    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", deletingTx.id);

    if (error) {
      toast.error("Erro ao excluir registro");
    } else {
      toast.success("Registro excluído");
    }
    setIsDeleting(false);
    setDeletingTx(null);
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-navy">Entradas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as receitas da empresa
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingTx(null);
            setIsFormOpen(true);
          }}
          className="bg-rose-med hover:bg-rose-dark text-white cursor-pointer"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Entrada
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardContent className="p-4">
          <TransactionFilters
            search={search}
            onSearchChange={setSearch}
            category={categoryFilter}
            onCategoryChange={setCategoryFilter}
            status={statusFilter}
            onStatusChange={setStatusFilter}
            paymentMethod={paymentMethodFilter}
            onPaymentMethodChange={setPaymentMethodFilter}
            dateFrom={dateFrom}
            onDateFromChange={setDateFrom}
            dateTo={dateTo}
            onDateToChange={setDateTo}
            categories={categories}
            type="income"
          />
        </CardContent>
      </Card>

      {/* Table */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardContent className="p-0">
          <TransactionTable
            transactions={transactions}
            onEdit={handleEdit}
            onDelete={(tx) => setDeletingTx(tx)}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <TransactionForm
        open={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTx(null);
        }}
        onSubmit={handleSubmit}
        type="income"
        categories={categories}
        editData={editingTx}
      />

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
