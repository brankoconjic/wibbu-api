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

/* ---------------------------------- Types --------------------------------- */
export type UpdateRequest = z.infer<typeof updateRequestSchema>;
