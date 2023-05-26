/**
 * External imports.
 */
import { z } from 'zod';

/**
 * Internal imports.
 */
import { roleSchema, userResponseCoreSchema } from '../user/user.schema';

export const uuidSchema = z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/, 'Must be a valid UUID');

export const loginRequestSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const loginResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		accessToken: z.string(),
		user: userResponseCoreSchema,
	}),
});

export const JWTPayloadSchema = z.object({
	sub: uuidSchema,
	email: z.string(),
	name: z.string(),
	role: roleSchema,
});

export const protectedResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		message: z.string(),
		user: JWTPayloadSchema,
	}),
});

export const refreshTokenResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		accessToken: uuidSchema,
	}),
});

const protectedUserRequestSchema = protectedResponseSchema.shape.data.shape.user;

export type ProtectedUserRequest = z.infer<typeof protectedUserRequestSchema>;

export type RefreshTokenResponse = z.infer<typeof refreshTokenResponseSchema>;
export type JWTPayloadType = z.infer<typeof JWTPayloadSchema>;
export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
