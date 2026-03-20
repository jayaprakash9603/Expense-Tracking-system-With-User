export function buildSidebarDisplayName(user) {
  if (!user) return "";
  const full = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  return full || user.name || user.email || "";
}
