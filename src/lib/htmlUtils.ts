import DOMPurify from "dompurify";

/**
 * Detects double-escaped HTML (e.g. &lt;h1&gt;) and unescapes it before sanitizing.
 */
export function sanitizeContent(html: string | null | undefined): string {
  if (!html) return "";
  let content = html;
  // If content contains &lt; it's likely double-escaped HTML
  if (content.includes("&lt;") || content.includes("&amp;lt;")) {
    const doc = new DOMParser().parseFromString(content, "text/html");
    content = doc.body.textContent || content;
  }
  return DOMPurify.sanitize(content);
}
