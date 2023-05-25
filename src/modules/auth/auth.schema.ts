/**
 * External imports.
 */
import { z } from 'zod';
import { roleSchema } from '../user/user.schema';

export const loginRequestSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});

export const loginResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		accessToken: z.string(),
	}),
});

export const protectedResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		message: z.string(),
		user: z.object({
			id: z.string(),
			name: z.string(),
			email: z.string(),
			role: roleSchema,
		}),
	}),
});

const protectedUserRequestSchema = protectedResponseSchema.shape.data.shape.user;

export type RefreshTokenResponse = z.infer<typeof loginResponseSchema>;
export type ProtectedUserRequest = z.infer<typeof protectedUserRequestSchema>;

export type ProtectedRequest = any;
export type ProtectedResponse = z.infer<typeof protectedResponseSchema>;

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
