export const ROLES = ['ADMIN', 'USER'] as const;
export type Role = (typeof ROLES)[number];

/**
 * Check if user has access.
 */
export function hasAccess(userRole: Role, requiredRoles: Role[]) {
	return requiredRoles.includes(userRole);
}
