import type { ModelMode } from "@/lib/types";
import { getLanguageGuideForAction, isTranslationAction } from "@/lib/ai/language-guides";
import {
  buildPreferencesSystemPrompt,
  yiddishScriptInstruction,
  type UserPreferences,
} from "@/lib/preferences";

export interface GatewayMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatRequest {
  messages: GatewayMessage[];
  mode: ModelMode;
  projectContext?: string;
  temperature?: number;
  preferences?: UserPreferences;
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

Language rules for Hebrew and Yiddish:
- Use everyday modern spelling WITHOUT nekudos, nikud, vowel points, or cantillation marks unless the user explicitly asks for pointed/educational text.
- For Yiddish: use natural community-standard spelling in Hebrew letters (or Latin if the source used Latin). Never add diacritics under letters.
- For Hebrew: write standard unpointed Hebrew as used in emails, business, and daily life.

When rewriting or translating, return ONLY the final text — no explanations, labels like "Here is...", or markdown unless the action requires structure.

If the user asks you to rewrite or improve text, return the improved version directly unless they ask for explanation.`;

export function resolveModel(mode: ModelMode): string {
  return MODE_TO_MODEL[mode] ?? MODE_TO_MODEL.auto;
}

export function buildSystemMessages(
  projectContext?: string,
  preferences?: UserPreferences,
): GatewayMessage[] {
  const messages: GatewayMessage[] = [
    { role: "system", content: SYSTEM_PROMPT },
  ];

  if (preferences) {
    messages.push({
      role: "system",
      content: buildPreferencesSystemPrompt(preferences),
    });
  }

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
      ...buildSystemMessages(request.projectContext, request.preferences),
      ...request.messages.filter((m) => m.role !== "system"),
    ],
    temperature:
      request.temperature ??
      (request.mode === "writing" ? 0.7 : 0.4),
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
  actionPrompt: string,
  mode: ModelMode = "writing",
  actionId?: string,
  preferences?: UserPreferences,
): Promise<string> {
  const languageGuide = actionId ? getLanguageGuideForAction(actionId) : undefined;
  const messages: GatewayMessage[] = [];

  if (preferences) {
    messages.push({
      role: "system",
      content: buildPreferencesSystemPrompt(preferences),
    });
  }

  if (languageGuide) {
    messages.push({ role: "system", content: languageGuide });
    if (actionId === "translate_yi" && preferences) {
      const scriptNote = yiddishScriptInstruction(preferences);
      if (scriptNote) {
        messages.push({ role: "system", content: scriptNote });
      }
    }
  }

  messages.push({
    role: "user",
    content: `${actionPrompt}\n\n${text}`,
  });

  const response = await routeChat({
    mode,
    messages,
    temperature: actionId && isTranslationAction(actionId) ? 0.2 : undefined,
  });

  return response.content;
}
