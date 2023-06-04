/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify';

/**
 * Internal dependencies.
 */
import { $ref } from '@/modules/auth/auth.schema';
import { loginController } from './auth.controllers';

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
};

export default authRoutes;
