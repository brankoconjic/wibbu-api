export const ROLES = {
	admin: 'ADMIN',
	user: 'USER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

/**
 * Check if user has access.
 *
 * @param userRole - The user role.
 * @param requiredRoles - Array of required roles.
 * @returns True if user has access, false otherwise.
 */
export function hasAccess(userRole: Role, requiredRoles: Role[]) {
	return requiredRoles.includes(userRole);
}
