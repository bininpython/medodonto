"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import type { AccountPayable, AccountReceivable, Category } from "@/types/database";

export default function ContasPage() {
  const supabase = createClient();
  const [payables, setPayables] = useState<AccountPayable[]>([]);
  const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  // Payable form
  const [payableFormOpen, setPayableFormOpen] = useState(false);
  const [editingPayable, setEditingPayable] = useState<AccountPayable | null>(null);
  const [payableForm, setPayableForm] = useState({
    description: "",
    category_id: "",
    amount: "",
    due_date: "",
    status: "pending" as "paid" | "pending",
    notes: "",
  });

  // Receivable form
  const [receivableFormOpen, setReceivableFormOpen] = useState(false);
  const [editingReceivable, setEditingReceivable] = useState<AccountReceivable | null>(null);
  const [receivableForm, setReceivableForm] = useState({
    description: "",
    source: "",
    amount: "",
    due_date: "",
    status: "pending" as "received" | "pending",
    notes: "",
  });

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: "payable" | "receivable"; id: string } | null>(null);

  const fetchData = useCallback(async () => {
    const { data: pay } = await supabase
      .from("accounts_payable")
      .select("*, categories(name)")
      .order("due_date", { ascending: true });

    setPayables(
      (pay || []).map((p) => ({
        ...p,
        category: p.categories as unknown as Category,
      }))
    );

    const { data: rec } = await supabase
      .from("accounts_receivable")
      .select("*")
      .order("due_date", { ascending: true });

    setReceivables(rec || []);

    const { data: cats } = await supabase.from("categories").select("*").order("name");
    setCategories(cats || []);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getPayableStatus = (item: AccountPayable) => {
    if (item.status === "paid") return "paid";
    const today = new Date().toISOString().split("T")[0];
    if (item.due_date < today) return "overdue";
    return "pending";
  };

  const getReceivableStatus = (item: AccountReceivable) => {
    if (item.status === "received") return "received";
    const today = new Date().toISOString().split("T")[0];
    if (item.due_date < today) return "overdue";
    return "pending";
  };

  const statusBadge = (status: string) => {
    const styles: Record<string, string> = {
      paid: "bg-emerald-50 text-emerald-600",
      received: "bg-emerald-50 text-emerald-600",
      pending: "bg-amber-50 text-amber-600",
      overdue: "bg-red-50 text-red-600",
    };
    const labels: Record<string, string> = {
      paid: "Pago",
      received: "Recebido",
      pending: "Pendente",
      overdue: "Vencido",
    };
    return (
      <Badge variant="secondary" className={`text-xs ${styles[status] || ""}`}>
        {labels[status] || status}
      </Badge>
    );
  };

  // Payable handlers
  const handlePayableSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      description: payableForm.description,
      category_id: payableForm.category_id || null,
      amount: parseFloat(payableForm.amount),
      due_date: payableForm.due_date,
      status: payableForm.status,
      notes: payableForm.notes || null,
      created_by: user?.id,
    };

    if (editingPayable) {
      const { error } = await supabase.from("accounts_payable").update(payload).eq("id", editingPayable.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Conta atualizada");
    } else {
      const { error } = await supabase.from("accounts_payable").insert(payload);
      if (error) { toast.error("Erro ao registrar"); return; }
      toast.success("Conta a pagar registrada");
    }
    setPayableFormOpen(false);
    setEditingPayable(null);
    setPayableForm({ description: "", category_id: "", amount: "", due_date: "", status: "pending", notes: "" });
    fetchData();
  };

  // Receivable handlers
  const handleReceivableSubmit = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = {
      description: receivableForm.description,
      source: receivableForm.source || null,
      amount: parseFloat(receivableForm.amount),
      due_date: receivableForm.due_date,
      status: receivableForm.status,
      notes: receivableForm.notes || null,
      created_by: user?.id,
    };

    if (editingReceivable) {
      const { error } = await supabase.from("accounts_receivable").update(payload).eq("id", editingReceivable.id);
      if (error) { toast.error("Erro ao atualizar"); return; }
      toast.success("Conta atualizada");
    } else {
      const { error } = await supabase.from("accounts_receivable").insert(payload);
      if (error) { toast.error("Erro ao registrar"); return; }
      toast.success("Conta a receber registrada");
    }
    setReceivableFormOpen(false);
    setEditingReceivable(null);
    setReceivableForm({ description: "", source: "", amount: "", due_date: "", status: "pending", notes: "" });
    fetchData();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const table = deleteTarget.type === "payable" ? "accounts_payable" : "accounts_receivable";
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
    if (error) {
      toast.error("Erro ao excluir");
    } else {
      toast.success("Registro excluído");
    }
    setDeleteTarget(null);
    fetchData();
  };

  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Contas</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie contas a pagar e a receber
        </p>
      </div>

      <Tabs defaultValue="payable">
        <TabsList className="bg-white border">
          <TabsTrigger value="payable" className="cursor-pointer">Contas a Pagar</TabsTrigger>
          <TabsTrigger value="receivable" className="cursor-pointer">Contas a Receber</TabsTrigger>
        </TabsList>

        {/* CONTAS A PAGAR */}
        <TabsContent value="payable" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingPayable(null);
                setPayableForm({ description: "", category_id: "", amount: "", due_date: "", status: "pending", notes: "" });
                setPayableFormOpen(true);
              }}
              className="bg-rose-med hover:bg-rose-dark text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Conta a Pagar
            </Button>
          </div>
          <Card className="bg-white border border-border/50 shadow-xs">
            <CardContent className="p-0">
              {payables.length === 0 ? (
                <p className="text-center py-12 text-sm text-muted-foreground">Nenhuma conta a pagar</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-navy font-semibold">Descrição</TableHead>
                        <TableHead className="text-navy font-semibold hidden md:table-cell">Categoria</TableHead>
                        <TableHead className="text-navy font-semibold text-right">Valor</TableHead>
                        <TableHead className="text-navy font-semibold">Vencimento</TableHead>
                        <TableHead className="text-navy font-semibold">Status</TableHead>
                        <TableHead className="text-navy font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payables.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">{item.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{item.category?.name || "—"}</TableCell>
                          <TableCell className="text-sm font-semibold text-right text-rose-med">{formatCurrency(Number(item.amount))}</TableCell>
                          <TableCell className="text-sm">{formatDate(item.due_date)}</TableCell>
                          <TableCell>{statusBadge(getPayableStatus(item))}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => {
                                setEditingPayable(item);
                                setPayableForm({
                                  description: item.description,
                                  category_id: item.category_id || "",
                                  amount: String(item.amount),
                                  due_date: item.due_date,
                                  status: item.status,
                                  notes: item.notes || "",
                                });
                                setPayableFormOpen(true);
                              }}>
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setDeleteTarget({ type: "payable", id: item.id })}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CONTAS A RECEBER */}
        <TabsContent value="receivable" className="space-y-4">
          <div className="flex justify-end">
            <Button
              onClick={() => {
                setEditingReceivable(null);
                setReceivableForm({ description: "", source: "", amount: "", due_date: "", status: "pending", notes: "" });
                setReceivableFormOpen(true);
              }}
              className="bg-rose-med hover:bg-rose-dark text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" /> Nova Conta a Receber
            </Button>
          </div>
          <Card className="bg-white border border-border/50 shadow-xs">
            <CardContent className="p-0">
              {receivables.length === 0 ? (
                <p className="text-center py-12 text-sm text-muted-foreground">Nenhuma conta a receber</p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-navy font-semibold">Descrição</TableHead>
                        <TableHead className="text-navy font-semibold hidden md:table-cell">Cliente / Origem</TableHead>
                        <TableHead className="text-navy font-semibold text-right">Valor</TableHead>
                        <TableHead className="text-navy font-semibold">Data Prevista</TableHead>
                        <TableHead className="text-navy font-semibold">Status</TableHead>
                        <TableHead className="text-navy font-semibold text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {receivables.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-sm font-medium">{item.description}</TableCell>
                          <TableCell className="text-sm text-muted-foreground hidden md:table-cell">{item.source || "—"}</TableCell>
                          <TableCell className="text-sm font-semibold text-right text-emerald-600">{formatCurrency(Number(item.amount))}</TableCell>
                          <TableCell className="text-sm">{formatDate(item.due_date)}</TableCell>
                          <TableCell>{statusBadge(getReceivableStatus(item))}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => {
                                setEditingReceivable(item);
                                setReceivableForm({
                                  description: item.description,
                                  source: item.source || "",
                                  amount: String(item.amount),
                                  due_date: item.due_date,
                                  status: item.status,
                                  notes: item.notes || "",
                                });
                                setReceivableFormOpen(true);
                              }}>
                                <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 cursor-pointer" onClick={() => setDeleteTarget({ type: "receivable", id: item.id })}>
                                <Trash2 className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payable Form Dialog */}
      <Dialog open={payableFormOpen} onOpenChange={setPayableFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {editingPayable ? "Editar" : "Nova"} Conta a Pagar
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={payableForm.description} onChange={(e) => setPayableForm({ ...payableForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={payableForm.category_id} onValueChange={(v) => setPayableForm({ ...payableForm, category_id: v || "" })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {expenseCategories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={payableForm.amount} onChange={(e) => setPayableForm({ ...payableForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vencimento</Label>
                <Input type="date" value={payableForm.due_date} onChange={(e) => setPayableForm({ ...payableForm, due_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={payableForm.status} onValueChange={(v) => setPayableForm({ ...payableForm, status: (v || "pending") as "paid" | "pending" })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="paid">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input value={payableForm.notes} onChange={(e) => setPayableForm({ ...payableForm, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setPayableFormOpen(false)} className="flex-1 cursor-pointer">Cancelar</Button>
              <Button onClick={handlePayableSubmit} className="flex-1 bg-rose-med hover:bg-rose-dark text-white cursor-pointer">
                {editingPayable ? "Salvar" : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Receivable Form Dialog */}
      <Dialog open={receivableFormOpen} onOpenChange={setReceivableFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-navy">
              {editingReceivable ? "Editar" : "Nova"} Conta a Receber
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input value={receivableForm.description} onChange={(e) => setReceivableForm({ ...receivableForm, description: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cliente / Origem</Label>
                <Input value={receivableForm.source} onChange={(e) => setReceivableForm({ ...receivableForm, source: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input type="number" step="0.01" value={receivableForm.amount} onChange={(e) => setReceivableForm({ ...receivableForm, amount: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Prevista</Label>
                <Input type="date" value={receivableForm.due_date} onChange={(e) => setReceivableForm({ ...receivableForm, due_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={receivableForm.status} onValueChange={(v) => setReceivableForm({ ...receivableForm, status: (v || "pending") as "received" | "pending" })}>
                  <SelectTrigger className="cursor-pointer"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="received">Recebido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Observação (opcional)</Label>
              <Input value={receivableForm.notes} onChange={(e) => setReceivableForm({ ...receivableForm, notes: e.target.value })} />
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setReceivableFormOpen(false)} className="flex-1 cursor-pointer">Cancelar</Button>
              <Button onClick={handleReceivableSubmit} className="flex-1 bg-rose-med hover:bg-rose-dark text-white cursor-pointer">
                {editingReceivable ? "Salvar" : "Registrar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <DeleteDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
