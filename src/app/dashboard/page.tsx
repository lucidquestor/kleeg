import { AppShell } from "@/components/layout/AppShell";
import { NewProjectForm } from "@/components/dashboard/NewProjectForm";
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
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-brand-600">
            Workspace
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-ink">Your projects</h1>
          <p className="mt-2 max-w-xl text-ink-muted">
            Pick a project from the sidebar or create a new one below.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <section>
            {projects && projects.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {(projects as Project[]).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            ) : (
              <div className="card px-6 py-12 text-center">
                <p className="text-sm text-ink-muted">
                  No projects yet. Create your first workspace on the right.
                </p>
              </div>
            )}
          </section>
          <NewProjectForm />
        </div>
      </main>
    </AppShell>
  );
}
