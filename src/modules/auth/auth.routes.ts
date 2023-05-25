import { $ref } from '@/utils/buildSchemas';
import { FastifyInstance } from 'fastify';
import { loginController, protectedController, refreshTokenController } from './auth.controller';

const authRoutes = async (server: FastifyInstance) => {
	/**
	 * @route POST /login - Login user.
	 */
	server.post(
		'/login',
		{
			schema: {
				body: $ref('loginRequestSchema'),
				response: {
					200: $ref('loginResponseSchema'),
				},
			},
		},
		loginController
	);

	/**
	 * @route POST /refresh-token - Refresh tokens using refresh token.
	 */
	server.post(
		'/refresh-token',
		{
			schema: {
				response: {
					200: $ref('loginResponseSchema'),
				},
			},
		},
		refreshTokenController
	);

	/**
	 * @route GET /protected - Example protected route.
	 */
	server.get(
		'/protected',
		{
			schema: {
				response: {
					200: $ref('protectedResponseSchema'),
				},
			},
			onRequest: [server.authenticate],
		},
		protectedController
	);
};

export default authRoutes;
