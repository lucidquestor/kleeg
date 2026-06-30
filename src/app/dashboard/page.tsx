import { AppShell } from "@/components/layout/AppShell";
import { NewProjectButton } from "@/components/dashboard/NewProjectButton";
import { ProjectCard } from "@/components/dashboard/ProjectCard";
import { createClient } from "@/lib/supabase/server";
import type { Project } from "@/lib/types";

export const metadata = {
  title: "Projects",
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("updated_at", { ascending: false });

  return (
    <AppShell>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:py-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">
              Workspace
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Your projects</h1>
            <p className="mt-2 max-w-xl text-app-muted">
              Pick a project from the sidebar or start a new one.
            </p>
          </div>
          <NewProjectButton />
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(projects as Project[]).map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="card-app px-6 py-16 text-center">
            <p className="text-sm text-app-muted">No projects yet.</p>
            <p className="mt-2 text-sm text-zinc-500">
              Click <strong className="text-zinc-300">New project</strong> to create your
              first workspace.
            </p>
          </div>
        )}
      </main>
    </AppShell>
  );
}
