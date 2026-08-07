"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { DeleteDialog } from "@/components/ui/delete-dialog";
import { Plus, Trash2, Building2 } from "lucide-react";
import { toast } from "sonner";
import type { Category, CompanySettings } from "@/types/database";
import Image from "next/image";

export default function ConfiguracoesPage() {
  const supabase = createClient();
  const [categories, setCategories] = useState<Category[]>([]);
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryType, setNewCategoryType] = useState<"income" | "expense">(
    "expense"
  );
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null
  );

  const fetchData = useCallback(async () => {
    const { data: cats } = await supabase
      .from("categories")
      .select("*")
      .order("type")
      .order("name");
    setCategories(cats || []);

    const { data: settingsData } = await supabase
      .from("company_settings")
      .select("*")
      .limit(1)
      .single();
    setSettings(settingsData);
  }, [supabase]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Nome da categoria é obrigatório");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error } = await supabase.from("categories").insert({
      name: newCategoryName.trim(),
      type: newCategoryType,
      is_default: false,
      created_by: user?.id,
    });

    if (error) {
      toast.error("Erro ao adicionar categoria");
      return;
    }

    toast.success("Categoria adicionada");
    setNewCategoryName("");
    fetchData();
  };

  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("id", deletingCategory.id);

    if (error) {
      toast.error("Erro ao excluir categoria");
    } else {
      toast.success("Categoria excluída");
    }
    setDeletingCategory(null);
    fetchData();
  };

  const incomeCategories = categories.filter((c) => c.type === "income");
  const expenseCategories = categories.filter((c) => c.type === "expense");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Dados da empresa e configurações do sistema
        </p>
      </div>

      {/* Company Info */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Dados da Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-6">
            <Image
              src="/logo.svg"
              alt="Med Odonto"
              width={64}
              height={64}
              className="rounded-lg"
            />
            <div>
              <p className="text-lg font-bold text-navy">
                {settings?.company_name || "Med Odonto"}
              </p>
              <p className="text-sm text-muted-foreground">
                Moeda: {settings?.currency || "BRL"} —{" "}
                {settings?.currency_symbol || "R$"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Formato: R$ 1.234,56
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <Card className="bg-white border border-border/50 shadow-xs">
        <CardHeader>
          <CardTitle className="text-base font-semibold text-navy">
            Categorias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add new */}
          <div className="flex flex-wrap gap-3 items-end p-4 bg-muted/30 rounded-lg">
            <div className="flex-1 min-w-[200px] space-y-1">
              <Label className="text-xs">Nova categoria</Label>
              <Input
                placeholder="Nome da categoria"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="h-9"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddCategory();
                }}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select
                value={newCategoryType}
                onValueChange={(v) =>
                  setNewCategoryType((v || "expense") as "income" | "expense")
                }
              >
                <SelectTrigger className="h-9 w-[140px] cursor-pointer">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="income">Entrada</SelectItem>
                  <SelectItem value="expense">Despesa</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={handleAddCategory}
              size="sm"
              className="h-9 bg-rose-med hover:bg-rose-dark text-white cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-1" />
              Adicionar
            </Button>
          </div>

          {/* List */}
          <Tabs defaultValue="income">
            <TabsList className="bg-white border">
              <TabsTrigger value="income" className="cursor-pointer">
                Entradas ({incomeCategories.length})
              </TabsTrigger>
              <TabsTrigger value="expense" className="cursor-pointer">
                Despesas ({expenseCategories.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="income" className="mt-3">
              <div className="flex flex-wrap gap-2">
                {incomeCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{cat.name}</span>
                    {cat.is_default && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Padrão
                      </Badge>
                    )}
                    {!cat.is_default && (
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="expense" className="mt-3">
              <div className="flex flex-wrap gap-2">
                {expenseCategories.map((cat) => (
                  <div
                    key={cat.id}
                    className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded-lg"
                  >
                    <span className="text-sm">{cat.name}</span>
                    {cat.is_default && (
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                        Padrão
                      </Badge>
                    )}
                    {!cat.is_default && (
                      <button
                        onClick={() => setDeletingCategory(cat)}
                        className="text-red-400 hover:text-red-600 cursor-pointer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <DeleteDialog
        open={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={handleDeleteCategory}
        title="Excluir categoria?"
        description="Esta ação removerá a categoria. Registros existentes com esta categoria serão mantidos."
      />
    </div>
  );
}
