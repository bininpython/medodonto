import { z } from "zod";

export const loginSchema = z.object({
  username: z.string().min(1, "Código é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const transactionSchema = z.object({
  type: z.enum(["income", "expense"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  category_id: z.string().min(1, "Categoria é obrigatória"),
  amount: z.number().positive("Valor deve ser positivo"),
  payment_method: z.enum([
    "pix",
    "dinheiro",
    "cartao_debito",
    "cartao_credito",
    "transferencia",
    "boleto",
    "outro",
  ]),
  status: z.enum(["received", "paid", "pending"]),
  transaction_date: z.string().min(1, "Data é obrigatória"),
  notes: z.string().optional(),
});

export type TransactionFormData = z.infer<typeof transactionSchema>;

export const accountPayableSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  category_id: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  due_date: z.string().min(1, "Data de vencimento é obrigatória"),
  status: z.enum(["paid", "pending"]),
  notes: z.string().optional(),
});

export type AccountPayableFormData = z.infer<typeof accountPayableSchema>;

export const accountReceivableSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  source: z.string().optional(),
  amount: z.number().positive("Valor deve ser positivo"),
  due_date: z.string().min(1, "Data prevista é obrigatória"),
  status: z.enum(["received", "pending"]),
  notes: z.string().optional(),
});

export type AccountReceivableFormData = z.infer<
  typeof accountReceivableSchema
>;

export const categorySchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  type: z.enum(["income", "expense"]),
});

export type CategoryFormData = z.infer<typeof categorySchema>;
