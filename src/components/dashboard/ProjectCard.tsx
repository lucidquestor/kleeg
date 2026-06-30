"use client";

import Link from "next/link";
import { DeleteProjectButton } from "@/components/projects/DeleteProjectButton";
import type { Project } from "@/lib/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <div className="card-app card-app-hover group relative p-6">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="mb-3 h-1 w-8 rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition group-hover:w-12" />
        <h3 className="pr-8 text-lg font-semibold text-white">{project.name}</h3>
        {project.description ? (
          <p className="mt-2 line-clamp-2 text-sm text-app-muted">{project.description}</p>
        ) : (
          <p className="mt-2 text-sm text-zinc-500">No description yet.</p>
        )}
        <p className="mt-4 text-xs text-zinc-500">
          Updated {new Date(project.updated_at).toLocaleDateString()}
        </p>
      </Link>
      <div className="absolute right-4 top-4">
        <DeleteProjectButton
          projectId={project.id}
          projectName={project.name}
          variant="card"
        />
      </div>
    </div>
  );
}
