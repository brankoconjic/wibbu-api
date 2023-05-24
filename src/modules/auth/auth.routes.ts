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
					200: $ref('loginResponseSchema'),
				},
			},
		},
		loginController
	);

	server.get(
		'/protected',
		{
			onRequest: [server.authenticate],
		},

		// Temporary solution to get user data!
		async (request: any, reply: any) => {
			return {
				message: 'You are in a protected route',
				user: request.user,
			};
		}
	);
};

export default authRoutes;
