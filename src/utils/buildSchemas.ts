/**
 * Externam dependencies.
 */
import { buildJsonSchemas } from 'fastify-zod';

/**
 * Internal dependencies.
 */
import { loginRequestSchema, loginResponseSchema } from '@/modules/auth/auth.schema';
import { createUserInputSchema, createUserResponseSchema } from '@/modules/user/user.schema';

export const { schemas, $ref } = buildJsonSchemas({
	loginRequestSchema,
	loginResponseSchema,
	createUserInputSchema,
	createUserResponseSchema,
});
