import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** @deprecated Use PATCH /api/projects/[id]/documents/[docId] instead */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const documentId = body.documentId as string | undefined;
    const title = body.title as string | undefined;
    const content = body.content as Record<string, unknown> | undefined;
    const plainText = body.plainText as string | undefined;

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
      .eq("id", id)
      .eq("user_id", user.id)
      .single();

    if (!project) {
      return NextResponse.json({ error: "Project not found." }, { status: 404 });
    }

    const updates: Record<string, unknown> = {};
    if (title !== undefined) updates.title = title;
    if (content !== undefined) updates.content = content;
    if (plainText !== undefined) updates.plain_text = plainText;

    let query = supabase.from("project_documents").update(updates).eq("project_id", id);

    if (documentId) {
      query = query.eq("id", documentId);
    }

    const { data: document, error } = await query.select("*").single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ document });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
