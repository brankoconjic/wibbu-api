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
export const updateRequestSchema = userSchema.omit({ id: true });

/**
 * Update user response
 */
export const updateResponseSchema = apiBaseSchema.extend({
	data: z.object({
		user: userSchema.omit({ password: true }),
	}),
});

/* ---------------------------------- Types --------------------------------- */
export type updateRequest = z.infer<typeof updateRequestSchema>;
