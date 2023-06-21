/**
 * External dependencies.
 */
import { z } from 'zod';

/*
 * Internal dependencies.
 */
import { apiBaseSchema } from '@/config/schema';
import { userSchema } from '../auth/auth.schema';

/**
 * Update user request
 */
// export const updateRequestSchema = userSchema.omit({ id: true });
export const updateRequestSchema = z
	.object({
		email: z.string().email().optional(),
		name: z.string().optional(),
		password: z.string().min(8).optional(),
	})
	.strict();

/**
 * Update user response
 */
export const updateResponseSchema = apiBaseSchema.extend({
	data: z.object({
		user: userSchema.omit({ password: true }),
	}),
});

/**
 * User details response
 */
export const userDetailsResponseSchema = apiBaseSchema.extend({
	data: z.object({
		user: userSchema.omit({ password: true }),
	}),
});

export const usersDetailsResponseSchema = apiBaseSchema.extend({
	data: z.object({
		pagination: z.object({
			total: z.number(),
			currentPage: z.number(),
			totalPages: z.number(),
			perPage: z.number(),
		}),
		users: z.array(userSchema.omit({ password: true })),
	}),
});

export const userDetailsParamsSchema = z.object({
	id: z.string().uuid(),
});

export const userDetailsQuerySchema = z.object({
	page: z.number().min(1).optional(),
	limit: z.number().min(1).max(100).optional(),
});

/* ---------------------------------- Types --------------------------------- */
export type UpdateRequest = z.infer<typeof updateRequestSchema>;
export type UserDetailsResponse = z.infer<typeof userDetailsResponseSchema>;
export type UsersDetailsResponse = z.infer<typeof usersDetailsResponseSchema>;
export type UsersDetailsQuery = z.infer<typeof userDetailsQuerySchema>;
