/**
 * Externam dependencies.
 */
import { buildJsonSchemas } from 'fastify-zod';

/**
 * Internal dependencies.
 */
import { loginRequestSchema, loginResponseSchema, protectedResponseSchema } from '@/modules/auth/auth.schema';
import { createUserInputSchema, createUserResponseSchema } from '@/modules/user/user.schema';

export const { schemas, $ref } = buildJsonSchemas({
	loginRequestSchema,
	loginResponseSchema,
	protectedResponseSchema,
	createUserInputSchema,
	createUserResponseSchema,
});
