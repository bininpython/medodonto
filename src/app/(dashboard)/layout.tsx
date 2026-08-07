import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user = null;
  let profile = null;

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      const supabase = await createClient();
      const { data } = await supabase.auth.getUser();
      user = data.user;

      if (user) {
        const { data: p } = await supabase
          .from("profiles")
          .select("name, email")
          .eq("id", user.id)
          .single();
        profile = p;
      }
    } catch (e) {
      console.error("Supabase error:", e);
    }
  }

  const userName = profile?.name || user?.email?.split("@")[0] || "Administrador";
  const userEmail = profile?.email || user?.email || "admin@medodonto.com.br";

  return (
    <div className="min-h-screen bg-[#F4F6F9]">
      <Sidebar userName={userName} userEmail={userEmail} />
      <div className="lg:pl-64">
        <Header userName={userName} userEmail={userEmail} />
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
