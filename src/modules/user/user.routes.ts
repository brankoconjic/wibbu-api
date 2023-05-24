import { $ref } from '@/utils/buildSchemas';
import { FastifyInstance } from 'fastify';
import { createUserController } from './user.controller';

const userRoutes = async (server: FastifyInstance) => {
	/**
	 * @route POST / - Create a new user.
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
