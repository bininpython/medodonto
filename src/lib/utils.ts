import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata um valor numérico para moeda brasileira (BRL)
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata uma data string ISO para formato brasileiro
 */
export function formatDate(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch {
    return dateString;
  }
}

/**
 * Formata data abreviada (ex: 07 AGO)
 */
export function formatDateShort(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "dd MMM", { locale: ptBR }).toUpperCase();
  } catch {
    return dateString;
  }
}

/**
 * Formata data para nome do mês (ex: Janeiro)
 */
export function formatMonthName(dateString: string): string {
  try {
    const date = parseISO(dateString);
    return format(date, "MMMM", { locale: ptBR });
  } catch {
    return dateString;
  }
}

/**
 * Calcula a porcentagem de variação entre dois valores
 */
export function calculatePercentageChange(
  current: number,
  previous: number
): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Calcula a margem financeira
 */
export function calculateMargin(revenue: number, expenses: number): number {
  if (revenue === 0) return 0;
  return ((revenue - expenses) / revenue) * 100;
}

/**
 * Parseia valor em string para número (formato brasileiro)
 */
export function parseCurrencyInput(value: string): number {
  const cleaned = value.replace(/[^\d,.-]/g, "").replace(",", ".");
  return parseFloat(cleaned) || 0;
}

/**
 * Gera cor baseada no status
 */
export function getStatusColor(status: string): string {
  switch (status) {
    case "received":
    case "paid":
      return "text-emerald-600 bg-emerald-50";
    case "pending":
      return "text-amber-600 bg-amber-50";
    case "overdue":
      return "text-red-600 bg-red-50";
    default:
      return "text-gray-600 bg-gray-50";
  }
}

/**
 * Retorna o label em português do status
 */
export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    received: "Recebido",
    paid: "Pago",
    pending: "Pendente",
    overdue: "Vencido",
  };
  return labels[status] || status;
}
