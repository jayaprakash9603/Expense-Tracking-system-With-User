export function pathTemplateToRegex(template) {
  const trimmed = template.startsWith("/") ? template : `/${template}`;
  const segments = trimmed.split("/").filter(Boolean);
  const parts = segments.map((seg) => {
    if (seg.startsWith(":")) return "[^/]+";
    return seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  });
  return new RegExp(`^/${parts.join("/")}$`);
}
