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
              <div
                key={project.id}
                className={cn(
                  "group flex items-center gap-0.5 rounded-lg transition",
                  active
                    ? "bg-gradient-to-r from-brand-600/80 to-brand-700/60 shadow-sm"
                    : "hover:bg-white/5",
                )}
              >
                <Link
                  href={`/projects/${project.id}`}
                  className={cn(
                    "min-w-0 flex-1 px-3 py-2 text-sm transition",
                    active
                      ? "font-medium text-white"
                      : "text-sidebar-muted group-hover:text-white",
                  )}
                >
                  <span className="line-clamp-1">{project.name}</span>
                </Link>
                <DeleteProjectButton
                  projectId={project.id}
                  projectName={project.name}
                  variant="sidebar-tab"
                  active={active}
                />
              </div>
            );
          })}
        </nav>

        {!activeProjectId ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              Training
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
              Edit AI output and Kleeg saves your corrections for future models.
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-white/10 p-4">
        <SignOutButton variant="sidebar" />
      </div>
    </aside>
  );
}
