"use client";

import { useMemo, useState } from "react";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import type { Project } from "@/lib/types";

interface AppShellClientProps {
  children: React.ReactNode;
  projects: Project[];
  activeProjectId?: string;
  userEmail: string;
}

export function AppShellClient({
  children,
  projects,
  activeProjectId,
  userEmail,
}: AppShellClientProps) {
  const [search, setSearch] = useState("");

  const filteredProjects = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return projects;

    return projects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.description?.toLowerCase().includes(query),
    );
  }, [projects, search]);

  return (
    <div className="workspace-shell min-h-screen">
      <AppSidebar
        projects={filteredProjects}
        allProjectsCount={projects.length}
        activeProjectId={activeProjectId}
        search={search}
        onSearchChange={setSearch}
      />

      <div className="workspace-main flex min-h-screen flex-col lg:pl-64">
        <AppTopBar userEmail={userEmail} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
