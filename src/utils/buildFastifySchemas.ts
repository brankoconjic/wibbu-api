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

import {
  updateRequestSchema,
  updateResponseSchema,
  userDetailsParamsSchema,
  userDetailsResponseSchema,
  usersDetailsResponseSchema,
  userDetailsQuerySchema,
} from '@/modules/user/user.schema';

export const { schemas: fastifySchemas, $ref } = buildJsonSchemas({
  forgotPasswordRequestSchema,
  loginRegisterResponseSchema,
  loginRequestSchema,
  registerRequestSchema,
  resetPasswordParamsSchema,
  resetPasswordRequestSchema,
  updateRequestSchema,
  updateResponseSchema,
  userDetailsParamsSchema,
  userDetailsQuerySchema,
  userDetailsResponseSchema,
  usersDetailsResponseSchema,
  verifyEmailParamsSchema,
  verifyEmailResponseSchema,
});
