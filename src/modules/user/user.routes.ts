/**
 * External dependecies.
 */
import { FastifyInstance } from 'fastify/types/instance';

/**
 * Internal dependencies.
 */
import { $ref } from '@/utils/buildFastifySchemas';
import { updateController } from './user.controller';

const userRoutes = async (server: FastifyInstance) => {
	/**
	 * @route PATCH /update - Login user.
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
