import { createBrowserClient } from "@supabase/ssr";

const dummyQuery = {
  select: () => dummyQuery,
  eq: () => dummyQuery,
  lt: () => dummyQuery,
  lte: () => dummyQuery,
  gt: () => dummyQuery,
  gte: () => dummyQuery,
  order: () => dummyQuery,
  limit: () => dummyQuery,
  ilike: () => dummyQuery,
  update: () => dummyQuery,
  insert: () => dummyQuery,
  delete: () => dummyQuery,
  single: async () => ({ data: null, error: null }),
  then: (resolve: any) => resolve({ data: [], error: null }),
};

export function createClient() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => dummyQuery,
    } as any;
  }

  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
