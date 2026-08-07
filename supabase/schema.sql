-- =============================================
-- MED ODONTO - Schema do Banco de Dados
-- Sistema de Gestão Financeira
-- =============================================

-- Habilitar extensão UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- Tabela: profiles
-- Extensão da auth.users do Supabase
-- =============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Tabela: categories
-- Categorias de entradas e despesas
-- =============================================
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  is_default BOOLEAN DEFAULT FALSE,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Tabela: transactions
-- Entradas e despesas
-- =============================================
CREATE TABLE IF NOT EXISTS transactions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  payment_method TEXT NOT NULL CHECK (payment_method IN (
    'pix', 'dinheiro', 'cartao_debito', 'cartao_credito', 
    'transferencia', 'boleto', 'outro'
  )),
  status TEXT NOT NULL CHECK (status IN ('received', 'paid', 'pending')),
  transaction_date DATE NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Tabela: accounts_payable
-- Contas a pagar
-- =============================================
CREATE TABLE IF NOT EXISTS accounts_payable (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('paid', 'pending')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Tabela: accounts_receivable
-- Contas a receber
-- =============================================
CREATE TABLE IF NOT EXISTS accounts_receivable (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  description TEXT NOT NULL,
  source TEXT,
  amount DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('received', 'pending')),
  notes TEXT,
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Tabela: company_settings
-- Configurações da empresa
-- =============================================
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  company_name TEXT NOT NULL DEFAULT 'Med Odonto',
  currency TEXT NOT NULL DEFAULT 'BRL',
  currency_symbol TEXT NOT NULL DEFAULT 'R$',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- =============================================
-- Row Level Security (RLS)
-- =============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_payable ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts_receivable ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;

-- Profiles: usuário pode ver e editar seu próprio perfil
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Categories: todos os usuários autenticados podem ver e gerenciar
CREATE POLICY "Authenticated users can view categories" ON categories
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert categories" ON categories
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update categories" ON categories
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete non-default categories" ON categories
  FOR DELETE TO authenticated USING (is_default = false);

-- Transactions: todos os usuários autenticados podem gerenciar
CREATE POLICY "Authenticated users can view transactions" ON transactions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert transactions" ON transactions
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update transactions" ON transactions
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete transactions" ON transactions
  FOR DELETE TO authenticated USING (true);

-- Accounts Payable
CREATE POLICY "Authenticated users can view accounts_payable" ON accounts_payable
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert accounts_payable" ON accounts_payable
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts_payable" ON accounts_payable
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete accounts_payable" ON accounts_payable
  FOR DELETE TO authenticated USING (true);

-- Accounts Receivable
CREATE POLICY "Authenticated users can view accounts_receivable" ON accounts_receivable
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert accounts_receivable" ON accounts_receivable
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update accounts_receivable" ON accounts_receivable
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated users can delete accounts_receivable" ON accounts_receivable
  FOR DELETE TO authenticated USING (true);

-- Company Settings
CREATE POLICY "Authenticated users can view settings" ON company_settings
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Authenticated users can update settings" ON company_settings
  FOR UPDATE TO authenticated USING (true);

-- =============================================
-- Trigger: auto-create profile on signup
-- =============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================
-- Trigger: updated_at automático
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_transactions_updated_at
  BEFORE UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accounts_payable_updated_at
  BEFORE UPDATE ON accounts_payable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_accounts_receivable_updated_at
  BEFORE UPDATE ON accounts_receivable
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =============================================
-- Seed: categorias padrão
-- =============================================

-- Categorias de Entrada
INSERT INTO categories (name, type, is_default) VALUES
  ('Consultas', 'income', true),
  ('Procedimentos', 'income', true),
  ('Convênios', 'income', true),
  ('Particular', 'income', true),
  ('Pagamentos recebidos', 'income', true),
  ('Outros', 'income', true);

-- Categorias de Despesa
INSERT INTO categories (name, type, is_default) VALUES
  ('Funcionários', 'expense', true),
  ('Salários', 'expense', true),
  ('Fornecedores', 'expense', true),
  ('Aluguel', 'expense', true),
  ('Energia', 'expense', true),
  ('Água', 'expense', true),
  ('Internet', 'expense', true),
  ('Materiais odontológicos', 'expense', true),
  ('Materiais médicos', 'expense', true),
  ('Equipamentos', 'expense', true),
  ('Manutenção', 'expense', true),
  ('Impostos', 'expense', true),
  ('Marketing', 'expense', true),
  ('Contabilidade', 'expense', true),
  ('Serviços', 'expense', true),
  ('Transporte', 'expense', true),
  ('Outros', 'expense', true);

-- Configurações iniciais da empresa
INSERT INTO company_settings (company_name, currency, currency_symbol)
VALUES ('Med Odonto', 'BRL', 'R$');
