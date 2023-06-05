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
import { callbackController, connectController, loginController } from './auth.controllers';

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
	 * @route GET /connect/:provider - Create OAuth redirection link for the specified provider.
	 */
	server.get('/connect/:provider', connectController);

	/**
	 * @route GET /callback/:provider - Callback for OAuth redirection.
	 */
	server.get('/callback/:provider', callbackController);
};

export default authRoutes;
