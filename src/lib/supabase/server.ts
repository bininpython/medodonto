import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { SupabaseClient } from "@supabase/supabase-js";

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

export async function createClient() {
  const cookieStore = await cookies();

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes("dummy")) {
    return {
      auth: {
        getUser: async () => ({ data: { user: null }, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => dummyQuery,
    } as unknown as SupabaseClient<any, "public", any>;
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing sessions.
          }
        },
      },
    }
  );
}
