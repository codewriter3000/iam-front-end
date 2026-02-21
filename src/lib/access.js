const ADMIN_PERMISSION_NAMES = new Set(["administrator", "admin"]);

const normalizePermissionName = (permission) => {
  if (!permission) {
    return "";
  }

  if (typeof permission === "string") {
    return permission.toLowerCase();
  }

  if (typeof permission === "object") {
    return String(permission.name || permission.permission || "").toLowerCase();
  }

  return "";
};

export const hasAdministratorAccess = (user) => {
  if (!user) {
    return false;
  }

  if (typeof user.is_admin === "boolean") {
    return user.is_admin;
  }

  const permissions = Array.isArray(user.permissions) ? user.permissions : [];

  return permissions.some((permission) =>
    ADMIN_PERMISSION_NAMES.has(normalizePermissionName(permission))
  );
};
