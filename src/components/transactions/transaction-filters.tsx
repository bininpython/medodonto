"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import type { Category } from "@/types/database";
import { PAYMENT_METHOD_LABELS } from "@/types/database";

interface TransactionFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  status: string;
  onStatusChange: (value: string) => void;
  paymentMethod: string;
  onPaymentMethodChange: (value: string) => void;
  dateFrom: string;
  onDateFromChange: (value: string) => void;
  dateTo: string;
  onDateToChange: (value: string) => void;
  categories: Category[];
  type: "income" | "expense";
}

export function TransactionFilters({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  status,
  onStatusChange,
  paymentMethod,
  onPaymentMethodChange,
  dateFrom,
  onDateFromChange,
  dateTo,
  onDateToChange,
  categories,
  type,
}: TransactionFiltersProps) {
  const filteredCategories = categories.filter((c) => c.type === type);

  return (
    <div className="flex flex-wrap gap-3">
      {/* Search */}
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 h-9"
        />
      </div>

      {/* Date Range */}
      <Input
        type="date"
        value={dateFrom}
        onChange={(e) => onDateFromChange(e.target.value)}
        className="h-9 w-[140px]"
        placeholder="De"
      />
      <Input
        type="date"
        value={dateTo}
        onChange={(e) => onDateToChange(e.target.value)}
        className="h-9 w-[140px]"
        placeholder="Até"
      />

      {/* Category */}
      <Select value={category} onValueChange={(v) => onCategoryChange(v || "all")}>
        <SelectTrigger className="h-9 w-[160px] cursor-pointer">
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {filteredCategories.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              {cat.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Status */}
      <Select value={status} onValueChange={(v) => onStatusChange(v || "all")}>
        <SelectTrigger className="h-9 w-[130px] cursor-pointer">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
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

      {/* Payment Method */}
      <Select value={paymentMethod} onValueChange={(v) => onPaymentMethodChange(v || "all")}>
        <SelectTrigger className="h-9 w-[160px] cursor-pointer">
          <SelectValue placeholder="Forma" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas</SelectItem>
          {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
            <SelectItem key={key} value={key}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
