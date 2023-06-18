/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import WibbuException from '@/exceptions/WibbuException';
import { $ref } from '@/modules/auth/auth.schema';
import { loginCallbackController, loginConnectController, loginController, refreshController, registerController } from './auth.controllers';

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
					200: $ref('loginRegisterResponseSchema'),
				},
			},
		},
		loginController
	);

	/**
	 * @route GET /connect/:provider - Create OAuth redirection link for the specified provider.
	 */
	server.get('/connect/:provider', loginConnectController);

	/**
	 * @route GET /callback/:provider - Callback for OAuth redirection.
	 */
	server.get('/callback/:provider', loginCallbackController);

	/**
	 * @route POST /logout - Logout user.
	 */
	server.post('/logout', (request: FastifyRequest, reply: FastifyReply) => {
		if (request.body) {
			reply.send({
				test: request.query,
			});

			throw new WibbuException({
				code: 'BAD_REQUEST',
				message: 'Invalid body',
				statusCode: 400,
			});
		}

		// Clear cookie.
		reply.clearCookie('refreshToken', { path: '/' }).send({ success: true });
	});

	/**
	 * @route POST /register - Register user.
	 */
	server.post(
		'/register',
		{
			schema: {
				body: $ref('registerRequestSchema'),
				response: {
					200: $ref('loginRegisterResponseSchema'),
				},
			},
		},
		registerController
	);

	/**
	 * @route POST /refresh-token - Refresh access token.
	 * @description Refresh tokens using refresh token.
	 */
	server.post('/refresh-token', refreshController);
};

export default authRoutes;
