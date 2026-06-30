import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { ProjectWorkspace } from "@/components/workspace/ProjectWorkspace";
import { createClient } from "@/lib/supabase/server";
import type { ChatMessage, Project, ProjectDocument } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("name")
    .eq("id", id)
    .single();

  return {
    title: project?.name ?? "Project",
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: document } = await supabase
    .from("project_documents")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true })
    .limit(1)
    .single();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: true });

  if (!document) {
    notFound();
  }

  return (
    <AppShell activeProjectId={id}>
      <ProjectWorkspace
        project={project as Project}
        document={document as ProjectDocument}
        messages={(messages ?? []) as ChatMessage[]}
      />
    </AppShell>
  );
}
