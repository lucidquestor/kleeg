import { redirect } from "next/navigation";
import { AppShellClient } from "@/components/layout/AppShellClient";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export async function AppShell({
  children,
  activeProjectId,
}: {
  children: React.ReactNode;
  activeProjectId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  return (
    <AppShellClient
      projects={(projects ?? []) as Project[]}
      activeProjectId={activeProjectId}
      userEmail={user.email ?? "user"}
    >
      {children}
    </AppShellClient>
  );
}
