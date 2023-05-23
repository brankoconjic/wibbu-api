import { buildJsonSchemas } from 'fastify-zod';
import { z } from 'zod';

/**
 * User core schema. To be used in other schemas.
 */
const userCore = {
	/**
	 * User name.
	 *
	 * @min 2
	 * @max 100
	 * @required
	 */
	name: z
		.string({
			required_error: 'Name is a required field.',
			invalid_type_error: 'Minimum 2 characters and maximum 100 characters are allowed.',
		})
		.min(2)
		.max(100),

	/**
	 * User email.
	 *
	 * @email
	 * @required
	 */
	email: z.string().email({
		message: 'Invalid email address.',
	}),
};

/**
 * User schema for validating user input for creating a new user.
 */
const createUserInputSchema = z.object({
	...userCore,

	/**
	 * User password.
	 *
	 * @min 6
	 * @max 100
	 * @required
	 */
	password: z
		.string({
			required_error: 'Password is a required field.',
			invalid_type_error: 'Minimum 6 characters and maximum 100 characters are allowed.',
		})
		.min(6)
		.max(100),
});

const createUserResponseSchema = z.object({
	success: z.boolean(),
	data: z
		.object({
			...userCore,
			id: z.string(),
		})
		.optional(),
	error: z
		.object({
			message: z.string().nullable(),
			code: z.string().nullable(),
		})
		.nullable()
		.optional(),
});

const errorSchema = createUserResponseSchema.shape.error;

export type ErrorResponseType = z.infer<typeof errorSchema>;
export type CreateUserInput = z.infer<typeof createUserInputSchema>;
export type CreateUserResponse = z.infer<typeof createUserResponseSchema>;

export const { schemas: userSchemas, $ref } = buildJsonSchemas({
	createUserInputSchema,
	createUserResponseSchema,
});
