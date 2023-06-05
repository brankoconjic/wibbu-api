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
import { isDev } from '@/utils/misc';
import { AuthProviderType } from '@prisma/client';
import { LoginRequest, authProvidersSchema } from './auth.schema';
import { loginService } from './auth.services';

/**
 * Login controller.
 */
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

/**
 * Connect controller.
 */
export const connectController = async (request: FastifyRequest, reply: FastifyReply) => {
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

export const callbackController = async (request: FastifyRequest, reply: FastifyReply) => {
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
	const response = await server[provider].getAccessTokenFromAuthorizationCodeFlow(request);

	const refreshed = await response.refresh();

	console.log({
		expired: response.expired,
		refreshed,
	});

	reply.send({
		success: true,
		data: {
			token: response.token,
		},
	});
};
