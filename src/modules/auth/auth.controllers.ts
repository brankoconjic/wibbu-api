/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { isDev } from '@/utils/misc';
import { LoginRequest } from './auth.schema';
import { loginService } from './auth.services';

export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const { accessToken, refreshToken, user } = await loginService(request.body);

	reply.setCookie('refreshToken', refreshToken, {
		path: '/', // cookie is valid for all routes
		httpOnly: true, // client JS cannot access the cookie
		sameSite: 'strict', // cookie cannot be sent with cross-origin requests
		secure: !isDev(), // send cookie over https only if not in development
	});

	reply.status(200).send({
		success: true,
		data: {
			accessToken,
			user,
		},
	});
};
