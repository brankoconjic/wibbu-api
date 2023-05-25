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
import { LoginRequest, LoginResponse, ProtectedResponse, RefreshTokenResponse } from './auth.schema';
import { loginService, refreshTokenService } from './auth.service';

/**
 * Create a user controller.
 */
export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const loginRequest = request.body;

	const { accessToken, refreshToken } = await loginService(loginRequest);

	const payload: LoginResponse = {
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
	const user = request.user as AuthUserResponse;

	if (!hasAccess(user.role, 'ADMIN')) {
		throw new WibbuException({
			code: 'UNAUTHORIZED',
			message: 'You are not authorized to access this resource',
			statusCode: 401,
		});
	}

	const payload: ProtectedResponse = {
		success: true,
		data: {
			message: 'You are authorized!',
			user,
		},
	};

	return reply.status(200).send(payload);
};
