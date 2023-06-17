/**
 * External dependecies.
 */
import { FastifyInstance } from 'fastify/types/instance';

/**
 * Internal dependencies.
 */
import { $ref } from './user.schema';
import { updateController } from './user.controller';

const userRoutes = async (server: FastifyInstance) => {
	/**
	 * @route POST /login - Login user.
	 */
	server.patch(
		'/update',
		{
			schema: {
				body: $ref('updateRequestSchema'),
				response: {
					200: $ref('updateResponseSchema'),
				},
			},
		},
		updateController
	);
};

export default userRoutes;
