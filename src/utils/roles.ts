export const ROLES = {
  admin: 'admin',
  user: 'user',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Check if user has access.
 *
 * @param userRole - The user role.
 * @param requiredRoles - Array of required roles. Optional.
 * @returns True if user has access, false otherwise.
 */
export function hasAccess(userRole: Role, requiredRoles?: Role[]) {
  if (!requiredRoles) {
    return true;
  }

  return requiredRoles.includes(userRole);
}
