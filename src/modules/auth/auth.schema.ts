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
export const authProvidersSchema = z.enum(['google']);

export const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email().nullish(),
	role: roleEnum,
});

const passwordLoginSchema = z.object({
	type: z.literal('password'),
	email: z.string().email(),
	password: z.string().min(8),
});

const oauthLoginSchema = z.object({
	type: z.literal('oauth'),
	token: z.string(),
});

export const loginRequestSchema = z.discriminatedUnion('type', [passwordLoginSchema, oauthLoginSchema]);

export const loginResponseSchema = apiBaseSchema.extend({
	data: z.object({
		accessToken: z.string(),
		user: userSchema,
	}),
});

/* ---------------------------------- Types --------------------------------- */
export type UserType = z.infer<typeof userSchema>;
export type LoginType = z.infer<typeof loginEnum>;
export type RoleType = z.infer<typeof roleEnum>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;

/* --------------------- Build and add schemas to server -------------------- */
export const { schemas: authSchemas, $ref } = buildJsonSchemas({ loginRequestSchema, loginResponseSchema });
