import { FastifyInstance, FastifyRequest } from 'fastify';
import { createUserController } from './user.controller';
import { $ref } from './user.schema';

const userRoutes = async (server: FastifyInstance) => {
	/**
	 * @route POST / - Create a new user.
	 * @body {CreateUserInput} - User input.
	 */
	server.post(
		'/',
		{
			schema: {
				body: $ref('createUserInputSchema'),
				response: {
					201: $ref('createUserResponseSchema'),
				},
			},
		},
		createUserController
	);
};

export default userRoutes;
