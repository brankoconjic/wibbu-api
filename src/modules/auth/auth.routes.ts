/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify';

/**
 * Internal dependencies.
 */
import { $ref } from '@/modules/auth/auth.schema';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';
import { loginController } from './auth.controllers';
import WibbuException from '@/exceptions/WibbuException';

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
			throw new WibbuException({
				code: 'BAD_REQUEST',
				message: 'Invalid body',
				statusCode: 400,
			});
		}

		// Clear cookie.
		reply.clearCookie('refreshToken', { path: '/' }).send({ success: true });
	});
};

export default authRoutes;
