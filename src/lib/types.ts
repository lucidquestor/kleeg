export type ModelMode = "auto" | "fast" | "best" | "writing";

export type ChatRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  model?: string | null;
  created_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  context_text?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AiCorrection {
  id: string;
  user_id: string;
  project_id: string;
  document_id: string | null;
  action: string;
  source_text: string;
  ai_output: string;
  corrected_text: string;
  language: string | null;
  created_at: string;
}

export interface ProjectDocument {
  id: string;
  project_id: string;
  title: string;
  content: Record<string, unknown>;
  plain_text: string;
  created_at: string;
  updated_at: string;
}

export const MODEL_MODE_LABELS: Record<ModelMode, string> = {
  auto: "Auto",
  fast: "Fast",
  best: "Best reasoning",
  writing: "Best writing",
};

export const MODEL_MODE_SHORT_LABELS: Record<ModelMode, string> = {
  auto: "Auto",
  fast: "Fast",
  best: "Best",
  writing: "Writing",
};

export const siteConfig = {
  name: "Kleeg",
  tagline: "From idea to finished work — in one AI workspace.",
  description:
    "Kleeg brings your models, files, and tools together so you can chat, write, translate, and get real work done.",
};
