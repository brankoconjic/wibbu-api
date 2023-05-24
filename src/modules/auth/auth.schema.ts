/**
 * External imports.
 */
import { z } from 'zod';

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

export type LoginRequest = z.infer<typeof loginRequestSchema>;
export type LoginResponse = z.infer<typeof loginResponseSchema>;
