/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import WibbuException from '@/exceptions/WibbuException';
import { server } from '@/server';
import { generateTokens } from '@/utils/auth';
import { isDev } from '@/utils/misc';
import { AuthProviderType } from '@prisma/client';
import { JWTPayloadType, LoginRequest, RegisterRequest, authProvidersSchema } from './auth.schema';
import { findUserById, login, register, upsertUserWithToken } from './auth.services';

/**
 * Login controller.
 */
export const loginController = async (request: FastifyRequest<{ Body: LoginRequest }>, reply: FastifyReply) => {
	const { accessToken, refreshToken, user } = await login(request.body);

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

/**
 * Register controller.
 */
export const registerController = async (
	request: FastifyRequest<{
		Body: RegisterRequest;
	}>,
	reply: FastifyReply
) => {
	const { accessToken, refreshToken, user } = await register(request.body);

	// Let's login the user.
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

/**
 * Refresh token controller.
 */
export const refreshController = async (request: FastifyRequest, reply: FastifyReply) => {
	if ((request.body && Object.keys(request.body).length !== 0) || (request.query && Object.keys(request.query).length !== 0)) {
		throw new WibbuException({
			code: 'BAD_REQUEST',
			message: 'Bad request',
			statusCode: 400,
		});
	}

	// Verify refresh token.
	await request.jwtVerify();

	// At this point we have user data in request.user.
	const { sub } = request.user as JWTPayloadType;
	const user = await findUserById(sub);

	if (!user) {
		throw new WibbuException({
			code: 'UNAUTHORIZED',
			message: 'User not found',
			statusCode: 401,
		});
	}

	// Generate new access token and refresh token.
	const { accessToken, refreshToken } = generateTokens(user);

	// Set refresh token in cookie.
	reply.setCookie('refreshToken', refreshToken, {
		path: '/', // cookie is valid for all routes
		httpOnly: true, // client JS cannot access the cookie
		sameSite: 'strict', // cookie cannot be sent with cross-origin requests
		secure: !isDev(), // send cookie over https only if not in development
	});

	// Send response.
	reply.send({
		success: true,
		data: {
			accessToken,
		},
	});
};

/**
 * Connect controller.
 */
export const loginConnectController = async (request: FastifyRequest, reply: FastifyReply) => {
	const { provider } = request.params as { provider: AuthProviderType };

	// Check if provider exists.
	const parsed = authProvidersSchema.safeParse(provider);

	if (!parsed.success) {
		throw new WibbuException({
			code: 'BAD_REQUEST',
			message: 'Invalid provider',
			statusCode: 400,
		});
	}

	// @ts-ignore
	const redirectUri: string = server[provider].generateAuthorizationUri(request);
	reply.redirect(redirectUri);
};

/**
 * Login callback controller.
 */
export const loginCallbackController = async (request: FastifyRequest, reply: FastifyReply) => {
	const { provider } = request.params as { provider: AuthProviderType };

	// Check if provider exists.
	const parsed = authProvidersSchema.safeParse(provider);

	if (!parsed.success) {
		throw new WibbuException({
			code: 'BAD_REQUEST',
			message: 'Invalid provider',
			statusCode: 400,
		});
	}

	// @ts-ignore
	const oauthToken = await server[provider].getAccessTokenFromAuthorizationCodeFlow(request);

	// Create or update user.
	const user = await upsertUserWithToken(oauthToken.token, provider);

	// create jwt

	reply.send({
		success: true,
		data: {
			user,
		},
	});
};
