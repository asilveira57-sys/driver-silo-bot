import DOMPurify from "dompurify";

/**
 * Detects double-escaped HTML (e.g. &lt;h1&gt;) and unescapes it before sanitizing.
 * Preserves images and all valid HTML elements.
 */
export function sanitizeContent(html: string | null | undefined): string {
  if (!html) return "";
  let content = html;

  // Only unescape if the content looks fully double-escaped
  // (i.e. starts with &lt; or <p>&lt; indicating all tags are escaped)
  const trimmed = content.trim();
  const looksDoubleEscaped =
    trimmed.startsWith("&lt;") ||
    trimmed.startsWith("&amp;lt;") ||
    (trimmed.startsWith("<p>&lt;") && !trimmed.includes("<h1>") && !trimmed.includes("<h2>") && !trimmed.includes("<img"));

  if (looksDoubleEscaped) {
    const doc = new DOMParser().parseFromString(content, "text/html");
    const text = doc.body.textContent;
    // Only use textContent if it actually produces HTML tags
    if (text && text.includes("<")) {
      content = text;
    }
  }

  return DOMPurify.sanitize(content, {
    ADD_TAGS: ["img", "iframe", "table", "thead", "tbody", "tr", "th", "td", "caption", "figure", "figcaption"],
    ADD_ATTR: ["src", "alt", "title", "width", "height", "loading", "style", "target", "rel", "class", "colspan", "rowspan", "allow", "frameborder", "allowfullscreen"],
  });
}
