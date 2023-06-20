/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify';
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { $ref } from '@/utils/buildFastifySchemas';
import {
	forgotPasswordController,
	loginCallbackController,
	loginConnectController,
	loginController,
	refreshController,
	registerController,
	resendVerificationController,
	resetPasswordController,
	verifyEmailController,
} from './auth.controllers';

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
					200: $ref('loginRegisterResponseSchema'),
				},
			},
		},
		loginController
	);

	/**
	 * @route GET /connect/:provider - Create OAuth redirection link for the specified provider.
	 */
	server.get('/connect/:provider', loginConnectController);

	/**
	 * @route GET /callback/:provider - Callback for OAuth redirection.
	 */
	server.get('/callback/:provider', loginCallbackController);

	/**
	 * @route POST /logout - Logout user.
	 */
	server.post('/logout', { preHandler: server.verifyEmptyDataRequest }, (request: FastifyRequest, reply: FastifyReply) => {
		reply.clearCookie('refreshToken', { path: '/' }).send({ success: true });
	});

	/**
	 * @route POST /register - Register user.
	 */
	server.post(
		'/register',
		{
			schema: {
				body: $ref('registerRequestSchema'),
				response: {
					201: $ref('loginRegisterResponseSchema'),
				},
			},
		},
		registerController
	);

	/**
	 * @route POST /refresh-token - Refresh access token.
	 * @description Refresh tokens using refresh token.
	 */
	server.post('/refresh-token', { preHandler: server.verifyEmptyDataRequest }, refreshController);

	/**
	 *  @route POST /verify-email/:code - Forgot password.
	 */
	server.post('/verify-email/:code', { preHandler: server.authorize() }, verifyEmailController);

	/**
	 * @route POST /resend-verify-email - Resend verification email.
	 */
	server.post('/resend-verify-email', { preHandler: [server.authorize(), server.verifyEmptyDataRequest] }, resendVerificationController);

	/**
	 * @route POST /reset-password - Forgot password.
	 */
	server.post(
		'/reset-password',
		{
			schema: {
				body: $ref('forgotPasswordRequestSchema'),
			},
		},
		forgotPasswordController
	);

	/**
	 * @route POST /reset-password/:token - Reset password.
	 */
	server.post(
		'/reset-password/:token',
		{
			schema: {
				params: $ref('resetPasswordParamsSchema'),
				body: $ref('resetPasswordRequestSchema'),
			},
		},
		resetPasswordController
	);
};

export default authRoutes;
