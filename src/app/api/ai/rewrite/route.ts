import { NextResponse } from "next/server";
import { rewriteText } from "@/lib/ai/gateway";
import { createClient } from "@/lib/supabase/server";
import type { ModelMode } from "@/lib/types";

const ACTION_PROMPTS: Record<string, string> = {
  improve: "Improve this writing while keeping the meaning",
  professional: "Rewrite this in a more professional tone",
  shorten: "Shorten this while keeping the key points",
  translate_en: "Translate this to English",
  translate_he: "Translate this to Hebrew",
  translate_yi: "Translate this to Yiddish",
  summarize: "Summarize this",
  email: "Turn this into a polished email",
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = body.projectId as string | undefined;
    const text = body.text as string | undefined;
    const action = body.action as string | undefined;
    const mode = (body.mode as ModelMode) ?? "writing";

    if (!projectId || !text?.trim() || !action) {
      return NextResponse.json(
        { error: "projectId, text, and action are required." },
        { status: 400 },
      );
    }

    const prompt = ACTION_PROMPTS[action];

    if (!prompt) {
      return NextResponse.json({ error: "Unknown action." }, { status: 400 });
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

    const content = await rewriteText(text, prompt, mode);

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
