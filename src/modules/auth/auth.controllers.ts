/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { LoginRequest } from './auth.schema';
import { loginService } from './auth.services';

export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const { accessToken, user } = await loginService(request.body);

	// Logic here
	reply.status(200).send({
		success: true,
		data: {
			accessToken,
			user,
		},
	});
};
