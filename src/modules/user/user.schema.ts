/**
 * External dependencies.
 */
import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

/*
 * Internal dependencies.
 */
import { apiBaseSchema } from '@/config/schema';
import { userSchema } from '../auth/auth.schema';

/**
 * Update user request
 */
export const updateRequestSchema = userSchema.partial().omit({
	id: true,
});

export const updateResponseSchema = apiBaseSchema.extend({
	data: z.object({
		user: userSchema.omit({ password: true }),
	}),
});

/* ---------------------------------- Types --------------------------------- */
export type updateRequest = z.infer<typeof updateRequestSchema>;

/* --------------------- Build and add schemas to server -------------------- */
export const { schemas: userSchemas, $ref } = buildJsonSchemas({
	updateRequestSchema,
	updateResponseSchema,
});
