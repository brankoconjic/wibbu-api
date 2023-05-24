import { $ref } from '@/utils/buildSchemas';
import { FastifyInstance } from 'fastify';
import { loginController } from './auth.controller';

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
					201: $ref('loginResponseSchema'),
				},
			},
		},
		loginController
	);
};

export default authRoutes;
