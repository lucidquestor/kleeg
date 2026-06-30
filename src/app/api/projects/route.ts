import { NextResponse } from "next/server";
import { getProjectTemplate } from "@/lib/project-templates";
import { createClient } from "@/lib/supabase/server";

function plainTextToContent(text: string): Record<string, unknown> {
  return {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: text ? [{ type: "text", text }] : [],
      },
    ],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = (body.name as string | undefined)?.trim();
    const description = (body.description as string | undefined)?.trim() || null;
    const templateId = body.templateId as string | undefined;

    if (!name) {
      return NextResponse.json({ error: "Project name is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const template = getProjectTemplate(templateId);

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        name,
        description,
        user_id: user.id,
      })
      .select("id")
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: projectError?.message ?? "Could not create project." },
        { status: 500 },
      );
    }

    const { data: document, error: docError } = await supabase
      .from("project_documents")
      .select("id")
      .eq("project_id", project.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .single();

    if (docError || !document) {
      return NextResponse.json(
        { error: docError?.message ?? "Could not initialize document." },
        { status: 500 },
      );
    }

    if (template.initialText || template.documentTitle !== "Main document") {
      await supabase
        .from("project_documents")
        .update({
          title: template.documentTitle,
          content: plainTextToContent(template.initialText),
          plain_text: template.initialText,
        })
        .eq("id", document.id);
    }

    return NextResponse.json({ id: project.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
