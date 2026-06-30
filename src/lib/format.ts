export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Turn plain AI text (with blank-line paragraphs) into TipTap-friendly HTML. */
export function aiTextToHtml(text: string): string {
  return text
    .trim()
    .split(/\n\n+/)
    .map((paragraph) => {
      const lines = paragraph
        .trim()
        .split("\n")
        .map((line) => escapeHtml(line.trim()))
        .filter(Boolean);
      return lines.length ? `<p>${lines.join("<br>")}</p>` : "";
    })
    .filter(Boolean)
    .join("");
}
