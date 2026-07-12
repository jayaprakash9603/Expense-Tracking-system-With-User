const ROLE_HIERARCHY = {
  ADMIN: 3,
  MANAGER: 2,
  USER: 1,
  GUEST: 0,
};

export function hasRole(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  return userLevel >= requiredLevel;
}

export function hasPermission(permissions = [], required) {
  if (Array.isArray(required)) return required.every((r) => permissions.includes(r));
  return permissions.includes(required);
}

export function hasAnyPermission(permissions = [], required = []) {
  return required.some((r) => permissions.includes(r));
}

export function canAccess(user, resource) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (resource.ownerId && resource.ownerId === user.id) return true;
  if (resource.sharedWith?.includes(user.id)) return true;
  return false;
}

export function canEdit(user, resource) {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  if (resource.ownerId === user.id) return true;
  return false;
}

export function canDelete(user, resource) {
  return canEdit(user, resource);
}

export { ROLE_HIERARCHY };
