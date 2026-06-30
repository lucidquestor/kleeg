import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = body.projectId as string | undefined;
    const documentId = body.documentId as string | undefined;
    const action = body.action as string | undefined;
    const sourceText = body.sourceText as string | undefined;
    const aiOutput = body.aiOutput as string | undefined;
    const correctedText = body.correctedText as string | undefined;
    const language = body.language as string | undefined;

    if (
      !projectId ||
      !action ||
      !sourceText?.trim() ||
      !aiOutput?.trim() ||
      !correctedText?.trim()
    ) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    if (aiOutput.trim() === correctedText.trim()) {
      return NextResponse.json({ skipped: true, reason: "No changes from AI output." });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const { data: correction, error } = await supabase
      .from("ai_corrections")
      .insert({
        user_id: user.id,
        project_id: projectId,
        document_id: documentId ?? null,
        action,
        source_text: sourceText.trim(),
        ai_output: aiOutput.trim(),
        corrected_text: correctedText.trim(),
        language: language ?? null,
      })
      .select("id")
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ id: correction.id });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
