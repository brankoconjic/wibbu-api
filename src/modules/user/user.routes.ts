/**
 * External dependecies.
 */
import { FastifyInstance } from 'fastify/types/instance';

/**
 * Internal dependencies.
 */
import { $ref } from '@/utils/buildFastifySchemas';
import { myDetailsController, updateController, userDetailsController, usersController } from './user.controller';
import { FastifyRequest } from 'fastify/types/request';
import { UsersDetailsQuery } from './user.schema';

const userRoutes = async (server: FastifyInstance) => {
	/**
	 * @route PATCH /me - Update user profile details.
	 */
	server.patch(
		'/me',
		{
			preHandler: server.authorize(),
			schema: {
				response: {
					200: $ref('updateResponseSchema'),
				},
			},
		},
		updateController
	);

	/**
	 * @route GET /me - Get user profile details.
	 */
	server.get(
		'/me',
		{
			preHandler: [server.authorize(), server.verifyEmptyDataRequest],
			schema: {
				response: {
					200: $ref('userDetailsResponseSchema'),
				},
			},
		},
		myDetailsController
	);

	/**
	 * @route GET /:id - Get user profile details for id.
	 */
	server.get(
		'/:id',
		{
			preHandler: server.authorize(['admin']),
			schema: {
				params: $ref('userDetailsParamsSchema'),
				response: {
					200: $ref('userDetailsResponseSchema'),
				},
			},
		},
		userDetailsController
	);

	interface UsersDetailsParams extends FastifyRequest {
		Querystring: UsersDetailsQuery;
	}

	/**
	 * @route GET / - Get all users.
	 */
	server.get<UsersDetailsParams>(
		'/',
		{
			preHandler: [server.authorize(['admin'])],
			schema: {
				querystring: $ref('userDetailsQuerySchema'),
				response: {
					200: $ref('usersDetailsResponseSchema'),
				},
			},
		},
		usersController
	);
};

export default userRoutes;
