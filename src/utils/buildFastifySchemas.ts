/**
 * External dependencies.
 */
import { buildJsonSchemas } from 'fastify-zod';

/**
 * Internal dependencies.
 */
import {
	forgotPasswordRequestSchema,
	loginRegisterResponseSchema,
	loginRequestSchema,
	registerRequestSchema,
	resetPasswordParamsSchema,
	resetPasswordRequestSchema,
	verifyEmailParamsSchema,
	verifyEmailResponseSchema,
} from '@/modules/auth/auth.schema';

import { updateRequestSchema, updateResponseSchema } from '@/modules/user/user.schema';

export const { schemas: fastifySchemas, $ref } = buildJsonSchemas({
	loginRequestSchema,
	loginRegisterResponseSchema,
	registerRequestSchema,
	updateRequestSchema,
	updateResponseSchema,
	verifyEmailParamsSchema,
	verifyEmailResponseSchema,
	forgotPasswordRequestSchema,
	resetPasswordParamsSchema,
	resetPasswordRequestSchema,
});
