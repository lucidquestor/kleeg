export type DefaultLang = "en" | "yi" | "he";
export type YiddishScript = "hebrew" | "latin";

export interface UserPreferences {
  defaultLang: DefaultLang;
  yiddishScript: YiddishScript;
  noNekudos: boolean;
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  defaultLang: "yi",
  yiddishScript: "hebrew",
  noNekudos: true,
};

export function normalizePreferences(
  raw: Partial<UserPreferences> | null | undefined,
): UserPreferences {
  if (!raw) return DEFAULT_PREFERENCES;

  return {
    defaultLang:
      raw.defaultLang === "en" || raw.defaultLang === "yi" || raw.defaultLang === "he"
        ? raw.defaultLang
        : DEFAULT_PREFERENCES.defaultLang,
    yiddishScript:
      raw.yiddishScript === "hebrew" || raw.yiddishScript === "latin"
        ? raw.yiddishScript
        : DEFAULT_PREFERENCES.yiddishScript,
    noNekudos: raw.noNekudos ?? DEFAULT_PREFERENCES.noNekudos,
  };
}

export function buildPreferencesSystemPrompt(prefs: UserPreferences): string {
  const langLabel =
    prefs.defaultLang === "yi"
      ? "Yiddish"
      : prefs.defaultLang === "he"
        ? "Hebrew"
        : "English";

  const lines = [
    `User language preference: ${langLabel}.`,
    prefs.defaultLang === "yi" && prefs.yiddishScript === "latin"
      ? "When writing Yiddish, use Latin letters unless the user writes in Hebrew letters."
      : prefs.defaultLang === "yi"
        ? "When writing Yiddish, use Hebrew letters with standard community spelling."
        : null,
    prefs.noNekudos
      ? "Never add nekudos, nikud, or vowel points unless explicitly requested."
      : null,
  ].filter(Boolean);

  return lines.join(" ");
}

export function yiddishScriptInstruction(prefs: UserPreferences): string | undefined {
  if (prefs.yiddishScript === "latin") {
    return "Write Yiddish in Latin letters (standard romanization), not Hebrew letters.";
  }
  return undefined;
}
