import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Temporarily bypass login for now
  // if (!user) {
  //   redirect("/login");
  // }

  let profile = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, email")
      .eq("id", user.id)
      .single();
    profile = data;
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
