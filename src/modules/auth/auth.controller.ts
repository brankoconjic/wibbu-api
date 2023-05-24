/**
 * External dependencies.
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { LoginRequest, LoginResponse } from './auth.schema';
import { loginService } from './auth.service';

/**
 * Create a user controller.
 */
export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const loginRequest = request.body;
	const accessToken = await loginService(loginRequest);

	const payload: LoginResponse = {
		success: true,
		data: {
			accessToken,
		},
	};

	return reply.status(200).send(payload);
};
