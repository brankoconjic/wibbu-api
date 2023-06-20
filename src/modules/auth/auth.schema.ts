/**
 * External dependencies.
 */
import { z } from 'zod';

/**
 * Internal dependencies.
 */
import { apiBaseSchema } from '@/config/schema';

const loginEnum = z.enum(['password', 'oauth']);
const roleEnum = z.enum(['user', 'admin']);
export const authProvidersSchema = z.enum(['google', 'facebook']);

export const userSchema = z.object({
	id: z.string().uuid(),
	name: z.string(),
	email: z.string().email().nullish(),
	emailVerified: z.boolean(),
	password: z.string().min(8),
	profileImage: z.string().url().nullish(),
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

export const JWTPayloadSchema = z.object({
	sub: z.string().uuid(),
	iat: z.number(),
	exp: z.number(),
});

/**
 * Verify email schema
 */
export const verifyEmailParamsSchema = z.string();
export const verifyEmailResponseSchema = apiBaseSchema;

/* ---------------------------------- Types --------------------------------- */
export type UserType = z.infer<typeof userSchema>;
export type JWTPayloadType = z.infer<typeof JWTPayloadSchema>;

export type LoginType = z.infer<typeof loginEnum>;
export type RoleType = z.infer<typeof roleEnum>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginRegisterResponse = z.infer<typeof loginRegisterResponseSchema>;

export type RegisterRequest = z.infer<typeof registerRequestSchema>;
