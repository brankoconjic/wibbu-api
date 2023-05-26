/**
 * External dependencies.
 */
import { z } from 'zod';

/**
 * Internal dependencies.
 */
import { ROLES } from '@/utils/roles';
export const roleSchema = z.enum(ROLES);

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

	email: z.string().email({ message: 'Invalid email address.' }),
};

export const userResponseCoreSchema = z.object({
	...userCore,
	id: z.string().regex(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/, 'Must be a valid UUID'),
	role: roleSchema,
});

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
	data: userResponseCoreSchema,
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
export type AuthUserResponse = z.infer<typeof userResponseCoreSchema>;
