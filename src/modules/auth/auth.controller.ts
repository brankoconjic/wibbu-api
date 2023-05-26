/**
 * External dependencies.
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import WibbuException from '@/exceptions/WibbuException';
import { hasAccess } from '@/utils/roles';
import { AuthUserResponse } from '../user/user.schema';
import { LoginRequest, LoginResponse, RefreshTokenResponse } from './auth.schema';
import { loginService, refreshTokenService } from './auth.service';

/**
 * Create a user controller.
 */
export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const loginRequest = request.body;

	const { accessToken, refreshToken, user } = await loginService(loginRequest);

	const payload: LoginResponse = {
		success: true,
		data: {
			accessToken,
			user,
		},
	};

	return reply
		.setCookie('refreshToken', refreshToken, {
			path: '/', // cookie is valid for all routes
			httpOnly: true, // client JS cannot access the cookie
			sameSite: 'strict', // cookie cannot be sent with cross-origin requests
			secure: process.env.NODE_ENV !== 'development', // send cookie over https only if not in development
		})
		.status(200)
		.send(payload);
};

export const refreshTokenController = async (request: FastifyRequest, reply: FastifyReply) => {
	const { accessToken, refreshToken } = await refreshTokenService(request);

	const payload: RefreshTokenResponse = {
		success: true,
		data: {
			accessToken,
		},
	};

	return reply
		.setCookie('refreshToken', refreshToken, {
			path: '/', // cookie is valid for all routes
			httpOnly: true, // client JS cannot access the cookie
			sameSite: 'strict', // cookie cannot be sent with cross-origin requests
			secure: process.env.NODE_ENV !== 'development', // send cookie over https only if not in development
		})
		.status(200)
		.send(payload);
};

export const protectedController = async (request: FastifyRequest, reply: FastifyReply) => {
	const payload: any = {
		success: true,
		data: {
			message: 'You are authorized to access this resource. Congratulations!',
		},
	};

	return reply.status(200).send(payload);
};
