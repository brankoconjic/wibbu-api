import { z } from 'zod';

/**
 * User core schema. To be used in other schemas.
 */
const userCore = {
	name: z
		.string({
			required_error: 'Name is a required field.',
			invalid_type_error: 'Minimum 2 characters and maximum 100 characters are allowed.',
		})
		.min(2)
		.max(100),

	email: z.string().email({
		message: 'Invalid email address.',
	}),
};

/**
 * User schema for validating user input for creating a new user.
 */
export const createUserInputSchema = z.object({
	...userCore,
	password: z
		.string({
			required_error: 'Password is a required field.',
			invalid_type_error: 'Minimum 6 characters and maximum 100 characters are allowed.',
		})
		.min(6)
		.max(100),
});

export const createUserResponseSchema = z.object({
	success: z.boolean(),
	data: z.object({
		...userCore,
		id: z.string(),
	}),
	error: z
		.object({
			message: z.string().nullable(),
			code: z.string().nullable(),
		})
		.nullable()
		.optional(),
});

const createUserDataResponseSchema = createUserResponseSchema.shape.data;

export type CreateUserDataResponse = z.infer<typeof createUserDataResponseSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;
