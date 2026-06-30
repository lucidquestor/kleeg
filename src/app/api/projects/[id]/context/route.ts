import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const contextText = body.contextText as string | undefined;

    if (contextText === undefined) {
      return NextResponse.json({ error: "contextText is required." }, { status: 400 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { data: project, error } = await supabase
      .from("projects")
      .update({ context_text: contextText })
      .eq("id", id)
      .eq("user_id", user.id)
      .select("id, context_text")
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: error?.message ?? "Project not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ contextText: project.context_text });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
