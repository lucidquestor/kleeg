import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/AppSidebar";
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
    <div className="workspace-shell flex min-h-screen flex-col lg:flex-row">
      <AppSidebar
        projects={(projects ?? []) as Project[]}
        activeProjectId={activeProjectId}
      />
      <div className="workspace-main min-h-0 flex-1 bg-surface">{children}</div>
    </div>
  );
}
