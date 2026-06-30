"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { KleegLogo } from "@/components/ui/icons";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";

interface AppSidebarProps {
  projects: Project[];
  activeProjectId?: string;
}

export function AppSidebar({ projects, activeProjectId }: AppSidebarProps) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard";
  const activeProject = projects.find((p) => p.id === activeProjectId);

  return (
    <aside className="workspace-sidebar lg:min-h-screen">
      <div className="border-b border-white/10 p-4">
        <Link href="/dashboard">
          <KleegLogo wordmarkClassName="text-white" />
        </Link>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Projects
        </p>

        <nav className="mt-2 space-y-1">
          <Link
            href="/dashboard"
            className={cn(
              "block rounded-lg px-3 py-2 text-sm transition",
              onDashboard
                ? "bg-white/10 font-medium text-white"
                : "text-sidebar-muted hover:bg-white/5 hover:text-white",
            )}
          >
            All projects
          </Link>

          {projects.map((project) => {
            const active = project.id === activeProjectId;
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className={cn(
                  "block rounded-lg px-3 py-2 text-sm transition",
                  active
                    ? "bg-gradient-to-r from-brand-600/80 to-brand-700/60 font-medium text-white shadow-sm"
                    : "text-sidebar-muted hover:bg-white/5 hover:text-white",
                )}
              >
                <span className="line-clamp-1">{project.name}</span>
              </Link>
            );
          })}
        </nav>

        {activeProject ? (
          <div className="mt-6 space-y-3 border-t border-white/10 pt-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
                Current
              </p>
              <p className="mt-1 text-sm font-medium text-white">{activeProject.name}</p>
              {activeProject.description ? (
                <p className="mt-1 text-xs leading-relaxed text-sidebar-muted">
                  {activeProject.description}
                </p>
              ) : null}
            </div>
            <DeleteProjectButton
              projectId={activeProject.id}
              projectName={activeProject.name}
            />
          </div>
        ) : (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              Training
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
              Edit AI output and Kleeg saves your corrections for future models.
            </p>
          </div>
        )}
      </div>

      <div className="border-t border-white/10 p-4">
        <SignOutButton variant="sidebar" />
      </div>
    </aside>
  );
}
