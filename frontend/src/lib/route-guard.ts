import type { UserRoleType } from "@/lib/roles";

/** Maps route paths to the minimum roles allowed */
const ROUTE_ACCESS: Record<string, UserRoleType[]> = {
  "/admin/dashboard": ["admin", "manager", "requestor"],
  "/admin/catalog": ["admin", "manager", "requestor"],
  "/admin/requests": ["admin", "manager", "requestor"],
  "/admin/movements": ["admin", "manager"],
  "/admin/suppliers": ["admin", "manager"],
  "/admin/purchase-orders": ["admin", "manager", "requestor"],
  "/admin/analytics": ["admin", "manager"],
  "/admin/ai-insights": ["admin", "manager"],
  "/admin/settings": ["admin"],
};

/**
 * Returns true if the given role can access the path.
 * Unknown paths default to admin-only.
 */
export function canAccessRoute(path: string, role: UserRoleType): boolean {
  const allowed = ROUTE_ACCESS[path];
  if (!allowed) return role === "admin";
  return allowed.includes(role);
}
