export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
};

export type CategoryType = "income" | "expense";

export type Category = {
  id: string;
  name: string;
  type: CategoryType;
  is_default: boolean;
  created_by: string | null;
  created_at: string;
};

export type TransactionType = "income" | "expense";

export type PaymentMethod =
  | "pix"
  | "dinheiro"
  | "cartao_debito"
  | "cartao_credito"
  | "transferencia"
  | "boleto"
  | "outro";

export type TransactionStatus = "received" | "paid" | "pending";

export type Transaction = {
  id: string;
  type: TransactionType;
  description: string;
  category_id: string | null;
  amount: number;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  transaction_date: string;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  profile?: Profile;
};

export type AccountPayableStatus = "paid" | "pending";

export type AccountPayable = {
  id: string;
  description: string;
  category_id: string | null;
  amount: number;
  due_date: string;
  status: AccountPayableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
};

export type AccountReceivableStatus = "received" | "pending";

export type AccountReceivable = {
  id: string;
  description: string;
  source: string | null;
  amount: number;
  due_date: string;
  status: AccountReceivableStatus;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type CompanySettings = {
  id: string;
  company_name: string;
  currency: string;
  currency_symbol: string;
  updated_at: string;
};

// Labels para exibição na UI
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  pix: "PIX",
  dinheiro: "Dinheiro",
  cartao_debito: "Cartão de Débito",
  cartao_credito: "Cartão de Crédito",
  transferencia: "Transferência",
  boleto: "Boleto",
  outro: "Outro",
};

export const TRANSACTION_STATUS_LABELS: Record<TransactionStatus, string> = {
  received: "Recebido",
  paid: "Pago",
  pending: "Pendente",
};

export const ACCOUNT_STATUS_LABELS = {
  paid: "Pago",
  pending: "Pendente",
  received: "Recebido",
} as const;
