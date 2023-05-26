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
					200: $ref('refreshTokenResponseSchema'),
				},
			},
		},
		refreshTokenController
	);

	/**
	 * @route GET /protected - Example protected route. Requires user to have 'ADMIN' role.
	 */
	server.get(
		'/protected',
		{
			onRequest: [server.authorize(['ADMIN'])],
		},
		protectedController
	);
};

export default authRoutes;
