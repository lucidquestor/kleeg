import { notFound, redirect } from "next/navigation";
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
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
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
    <ProjectWorkspace
      project={project as Project}
      document={document as ProjectDocument}
      messages={(messages ?? []) as ChatMessage[]}
    />
  );
}
