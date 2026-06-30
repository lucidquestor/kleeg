"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import { SidebarProfileMenu } from "@/components/layout/SidebarProfileMenu";
import { ActionIcon, KleegLogo } from "@/components/ui/icons";
import type { Project } from "@/lib/types";
import { cn } from "@/lib/cn";

interface AppSidebarProps {
  projects: Project[];
  allProjectsCount: number;
  activeProjectId?: string;
  search: string;
  onSearchChange: (value: string) => void;
  userEmail: string;
}

export function AppSidebar({
  projects,
  allProjectsCount,
  activeProjectId,
  search,
  onSearchChange,
  userEmail,
}: AppSidebarProps) {
  const pathname = usePathname();
  const onDashboard = pathname === "/dashboard";

  return (
    <aside className="workspace-sidebar">
      <div className="shrink-0 border-b border-white/10 p-4">
        <Link href="/dashboard">
          <KleegLogo wordmarkClassName="text-white" />
        </Link>
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
          Projects
        </p>

        <div className="relative mt-2">
          <ActionIcon
            name="search"
            className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-sidebar-muted"
          />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects…"
            className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-8 pr-3 text-xs text-white outline-none placeholder:text-sidebar-muted focus:border-brand-400/50 focus:bg-white/10"
          />
        </div>

        <nav className="mt-3 space-y-1">
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

          {search && projects.length === 0 ? (
            <p className="px-3 py-2 text-xs text-sidebar-muted">No projects match.</p>
          ) : null}
        </nav>

        {!activeProjectId ? (
          <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-sidebar-muted">
              Training
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-zinc-300">
              Edit AI output and Kleeg saves your corrections for future models.
            </p>
            {allProjectsCount > 0 ? (
              <p className="mt-2 text-[10px] text-sidebar-muted">
                {allProjectsCount} project{allProjectsCount === 1 ? "" : "s"} total
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <SidebarProfileMenu userEmail={userEmail} />
    </aside>
  );
}
