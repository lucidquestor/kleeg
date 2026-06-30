export const ACTION_GROUPS = [
  {
    label: "Tone",
    actions: [
      { id: "improve", label: "Improve", icon: "sparkles" },
      { id: "professional", label: "Professional", icon: "briefcase" },
      { id: "shorten", label: "Shorten", icon: "compress" },
    ],
  },
  {
    label: "Translate",
    actions: [
      { id: "translate_en", label: "English", icon: "globe" },
      { id: "translate_he", label: "Hebrew", icon: "globe" },
      { id: "translate_yi", label: "Yiddish", icon: "globe" },
    ],
  },
  {
    label: "Format",
    actions: [
      { id: "summarize", label: "Summarize", icon: "list" },
      { id: "email", label: "Email", icon: "mail" },
    ],
  },
] as const;

export type ActionId =
  (typeof ACTION_GROUPS)[number]["actions"][number]["id"];
