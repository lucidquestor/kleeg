import { NextResponse } from "next/server";
import { routeChat, type GatewayMessage } from "@/lib/ai/gateway";
import { getUserPreferences } from "@/lib/user-preferences-server";
import { createClient } from "@/lib/supabase/server";
import type { ModelMode } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const projectId = body.projectId as string | undefined;
    const mode = (body.mode as ModelMode) ?? "auto";
    const messages = (body.messages as GatewayMessage[]) ?? [];
    const projectContext = body.projectContext as string | undefined;

    if (!projectId || messages.length === 0) {
      return NextResponse.json(
        { error: "projectId and messages are required." },
        { status: 400 },
      );
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

    const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");

    if (lastUserMessage) {
      await supabase.from("chat_messages").insert({
        project_id: projectId,
        role: "user",
        content: lastUserMessage.content,
      });
    }

    const result = await routeChat({
      messages,
      mode,
      projectContext,
      preferences,
    });

    await supabase.from("chat_messages").insert({
      project_id: projectId,
      role: "assistant",
      content: result.content,
      model: result.model,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Something went wrong.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
