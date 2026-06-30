/** Detect if text is primarily RTL (Hebrew, Yiddish, Arabic). */
export function detectTextDirection(text: string): "rtl" | "ltr" {
  const rtlChars = text.match(/[\u0590-\u08FF\uFB1D-\uFDFF\uFE70-\uFEFF]/g);
  const latinChars = text.match(/[A-Za-z]/g);
  const rtlCount = rtlChars?.length ?? 0;
  const latinCount = latinChars?.length ?? 0;
  return rtlCount > latinCount ? "rtl" : "ltr";
}

export function guessLanguageFromAction(action: string): string | undefined {
  if (action === "translate_yi") return "yi";
  if (action === "translate_he") return "he";
  if (action === "translate_en") return "en";
  return undefined;
}
