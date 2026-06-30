import type { ModelMode } from "@/lib/types";

export interface GatewayMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: GatewayMessage[];
  mode: ModelMode;
  projectContext?: string;
}

export interface ChatResponse {
  content: string;
  model: string;
  provider: "openai";
}

const MODE_TO_MODEL: Record<ModelMode, string> = {
  auto: "gpt-4o-mini",
  fast: "gpt-4o-mini",
  best: "gpt-4o",
  writing: "gpt-4o",
};

const SYSTEM_PROMPT = `You are Kleeg, an AI workspace assistant. You help users complete real work: writing, translating, planning, summarizing, and editing documents.

Be practical, clear, and action-oriented. When project context is provided, use it. Support English, Hebrew, and Yiddish when asked.

If the user asks you to rewrite or improve text, return the improved version directly unless they ask for explanation.`;

export function resolveModel(mode: ModelMode): string {
  return MODE_TO_MODEL[mode] ?? MODE_TO_MODEL.auto;
}

export function buildSystemMessages(projectContext?: string): GatewayMessage[] {
  const messages: GatewayMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (projectContext?.trim()) {
    messages.push({
      role: "system",
      content: `Project context:\n\n${projectContext.trim()}`,
    });
  }

  return messages;
}

export async function routeChat(request: ChatRequest): Promise<ChatResponse> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error(
      "OPENAI_API_KEY is not configured. Add it to .env.local to enable chat.",
    );
  }

  const OpenAI = (await import("openai")).default;
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = resolveModel(request.mode);

  const completion = await openai.chat.completions.create({
    model,
    messages: [
      ...buildSystemMessages(request.projectContext),
      ...request.messages.filter((m) => m.role !== "system"),
    ],
    temperature: request.mode === "writing" ? 0.7 : 0.4,
  });

  const content = completion.choices[0]?.message?.content?.trim();

  if (!content) {
    throw new Error("The model returned an empty response.");
  }

  return {
    content,
    model,
    provider: "openai",
  };
}

export async function rewriteText(
  text: string,
  action: string,
  mode: ModelMode = "writing",
): Promise<string> {
  const response = await routeChat({
    mode,
    messages: [
      {
        role: "user",
        content: `${action}:\n\n${text}`,
      },
    ],
  });

  return response.content;
}
