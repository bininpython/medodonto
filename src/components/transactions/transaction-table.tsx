"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency, formatDate, getStatusColor, getStatusLabel } from "@/lib/utils";
import { PAYMENT_METHOD_LABELS } from "@/types/database";
import type { Transaction } from "@/types/database";

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transaction: Transaction) => void;
}

export function TransactionTable({
  transactions,
  onEdit,
  onDelete,
}: TransactionTableProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p className="text-sm">Nenhum registro encontrado</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-navy font-semibold">Data</TableHead>
            <TableHead className="text-navy font-semibold">Descrição</TableHead>
            <TableHead className="text-navy font-semibold hidden md:table-cell">
              Categoria
            </TableHead>
            <TableHead className="text-navy font-semibold hidden lg:table-cell">
              Forma
            </TableHead>
            <TableHead className="text-navy font-semibold text-right">
              Valor
            </TableHead>
            <TableHead className="text-navy font-semibold hidden sm:table-cell">
              Status
            </TableHead>
            <TableHead className="text-navy font-semibold text-right">
              Ações
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id} className="hover:bg-muted/30">
              <TableCell className="text-sm whitespace-nowrap">
                {formatDate(tx.transaction_date)}
              </TableCell>
              <TableCell className="text-sm font-medium max-w-[200px] truncate">
                {tx.description}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden md:table-cell">
                {tx.category?.name || "—"}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground hidden lg:table-cell">
                {PAYMENT_METHOD_LABELS[tx.payment_method]}
              </TableCell>
              <TableCell
                className={`text-sm font-semibold text-right ${
                  tx.type === "income"
                    ? "text-emerald-600"
                    : "text-rose-med"
                }`}
              >
                {tx.type === "income" ? "+" : "-"}{" "}
                {formatCurrency(Number(tx.amount))}
              </TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge
                  variant="secondary"
                  className={`text-xs ${getStatusColor(tx.status)}`}
                >
                  {getStatusLabel(tx.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => onEdit(tx)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 cursor-pointer"
                    onClick={() => onDelete(tx)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
