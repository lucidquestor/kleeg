import { NextResponse } from "next/server";
import { rewriteText } from "@/lib/ai/gateway";
import { getUserPreferences } from "@/lib/user-preferences-server";
import { createClient } from "@/lib/supabase/server";
import type { ModelMode } from "@/lib/types";

const ACTION_PROMPTS: Record<string, string> = {
  improve: "Improve this writing while keeping the meaning. Return only the improved text.",
  professional:
    "Rewrite this in a more professional tone. Return only the rewritten text.",
  shorten: "Shorten this while keeping the key points. Return only the shortened text.",
  translate_en:
    "Translate this to natural English. Return only the translation.",
  translate_he: `Translate the following to natural modern Hebrew for everyday use.
Use correct grammar and standard unpointed spelling — NO nikud/nekudos. Return only the translation.`,
  translate_yi: `Translate the following to natural, grammatically correct Yiddish in Hebrew letters.
Use authentic Yiddish phrasing — not English words spelled in Hebrew letters.
NO nekudos/nikud. Return only the translation.`,
  summarize: "Summarize this clearly. Return only the summary.",
  email: `Turn this into a well-structured professional email. Use exactly this format with blank lines between sections:

Subject: [clear subject line]

[Greeting],

[Opening sentence]

[Body — 1–3 short paragraphs]

[Closing line]

[Sign-off],
[Name if known, otherwise leave a placeholder like [Your name]]

Return only the email text. No markdown, no bullet points unless the source clearly needs them.`,
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = body.projectId as string | undefined;
    const text = body.text as string | undefined;
    const action = body.action as string | undefined;
    const requestedMode = body.mode as ModelMode | undefined;

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

    const preferences = await getUserPreferences(supabase, user.id);

    const mode: ModelMode =
      requestedMode ??
      (action.startsWith("translate_") || action === "email" ? "best" : "writing");

    const content = await rewriteText(text, prompt, mode, action, preferences);

    return NextResponse.json({ content });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
