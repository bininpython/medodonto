"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  transactionSchema,
  type TransactionFormData,
} from "@/lib/validators";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { Loader2 } from "lucide-react";
import type { Category, TransactionType, Transaction } from "@/types/database";
import { PAYMENT_METHOD_LABELS } from "@/types/database";

interface TransactionFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: TransactionFormData) => Promise<void>;
  type: TransactionType;
  categories: Category[];
  editData?: Transaction | null;
}

export function TransactionForm({
  open,
  onClose,
  onSubmit,
  type,
  categories,
  editData,
}: TransactionFormProps) {
  const isEditing = !!editData;
  const defaultStatus = type === "income" ? "received" : "paid";

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: editData
      ? {
          type: editData.type,
          description: editData.description,
          category_id: editData.category_id || "",
          amount: Number(editData.amount),
          payment_method: editData.payment_method,
          status: editData.status,
          transaction_date: editData.transaction_date,
          notes: editData.notes || "",
        }
      : {
          type,
          status: defaultStatus,
          payment_method: "pix",
          transaction_date: new Date().toISOString().split("T")[0],
        },
  });

  const handleFormSubmit = async (data: TransactionFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-navy">
            {isEditing ? "Editar" : "Nova"}{" "}
            {type === "income" ? "Entrada" : "Despesa"}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-4 mt-2"
        >
          <input type="hidden" {...register("type")} />

          <div className="space-y-2">
            <Label className="text-sm font-medium">Descrição</Label>
            <Input
              placeholder="Ex: Pagamento atendimento paciente"
              {...register("description")}
            />
            {errors.description && (
              <p className="text-xs text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Categoria</Label>
              <Select
                value={watch("category_id")}
                onValueChange={(v) => setValue("category_id", v || "")}
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {filteredCategories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category_id && (
                <p className="text-xs text-red-500">
                  {errors.category_id.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0,00"
                {...register("amount", { valueAsNumber: true })}
              />
              {errors.amount && (
                <p className="text-xs text-red-500">{errors.amount.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data</Label>
              <Input type="date" {...register("transaction_date")} />
              {errors.transaction_date && (
                <p className="text-xs text-red-500">
                  {errors.transaction_date.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Forma de Pagamento</Label>
              <Select
                value={watch("payment_method")}
                onValueChange={(v) =>
                  setValue(
                    "payment_method",
                    (v || "pix") as TransactionFormData["payment_method"]
                  )
                }
              >
                <SelectTrigger className="cursor-pointer">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <Select
              value={watch("status")}
              onValueChange={(v) =>
                setValue("status", (v || "pending") as TransactionFormData["status"])
              }
            >
              <SelectTrigger className="cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {type === "income" ? (
                  <>
                    <SelectItem value="received">Recebido</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </>
                ) : (
                  <>
                    <SelectItem value="paid">Pago</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                  </>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Observação (opcional)</Label>
            <Input
              placeholder="Adicione uma observação..."
              {...register("notes")}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-rose-med hover:bg-rose-dark text-white cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isEditing ? (
                "Salvar"
              ) : (
                "Registrar"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
