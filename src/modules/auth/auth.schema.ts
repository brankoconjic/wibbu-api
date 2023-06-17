/**
 * External dependencies.
 */
import { z } from 'zod';

/**
 * Internal dependencies.
 */
import { apiBaseSchema } from '@/config/schema';
import { buildJsonSchemas } from 'fastify-zod';

const loginEnum = z.enum(['password', 'oauth']);
const roleEnum = z.enum(['user', 'admin']);
export const authProvidersSchema = z.enum(['google', 'facebook']);

export const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email().nullish(),
	password: z.string().min(8),
	profilePicture: z.string().url().nullish(),
	role: roleEnum,
});

/**
 * Login request
 */
export const loginRequestSchema = z.object({
	email: z.string().email(),
	password: z.string().min(8),
});

export const loginRegisterResponseSchema = apiBaseSchema.extend({
	data: z.object({
		accessToken: z.string(),
		user: userSchema.omit({ password: true }),
	}),
});

/**
 * Register request
 */
export const registerRequestSchema = loginRequestSchema.extend({
	name: z.string(),
});

/* ---------------------------------- Types --------------------------------- */
export type UserType = z.infer<typeof userSchema>;

export type LoginType = z.infer<typeof loginEnum>;
export type RoleType = z.infer<typeof roleEnum>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginRegisterResponse = z.infer<typeof loginRegisterResponseSchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

/* --------------------- Build and add schemas to server -------------------- */
export const { schemas: authSchemas, $ref } = buildJsonSchemas({
	loginRequestSchema: loginRequestSchema,
	loginRegisterResponseSchema: loginRegisterResponseSchema,
	registerRequestSchema: registerRequestSchema,
});
