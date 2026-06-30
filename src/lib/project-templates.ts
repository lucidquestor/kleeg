export interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  documentTitle: string;
  initialText: string;
}

export const PROJECT_TEMPLATES: ProjectTemplate[] = [
  {
    id: "blank",
    name: "Blank",
    description: "Start from scratch",
    documentTitle: "Main document",
    initialText: "",
  },
  {
    id: "client-email",
    name: "Client email",
    description: "Draft or polish a professional email",
    documentTitle: "Email draft",
    initialText:
      "Paste your rough email here, or write a few bullet points about what you want to say.\n\nUse Improve or Email format when you're ready.",
  },
  {
    id: "newsletter",
    name: "Newsletter",
    description: "Community or business update",
    documentTitle: "Newsletter",
    initialText:
      "Newsletter topic:\n\nKey points:\n-\n-\n\nPaste notes or a rough draft below and use Improve or Summarize.",
  },
  {
    id: "yiddish-letter",
    name: "Yiddish letter",
    description: "Letter or message in Yiddish",
    documentTitle: "Yiddish letter",
    initialText:
      "Write in English or Hebrew letters first, then use Translate → Yiddish.\n\nOr draft directly in Yiddish here.",
  },
  {
    id: "hebrew-letter",
    name: "Hebrew letter",
    description: "Letter or message in Hebrew",
    documentTitle: "Hebrew letter",
    initialText:
      "Write your draft here in any language, then use Translate → Hebrew.\n\nKleeg uses modern unpointed Hebrew.",
  },
];

export function getProjectTemplate(id: string | undefined): ProjectTemplate {
  return PROJECT_TEMPLATES.find((t) => t.id === id) ?? PROJECT_TEMPLATES[0];
}
