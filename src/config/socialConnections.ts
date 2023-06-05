/**
 * External dependencies.
 */
import oauth2, { FastifyOAuth2Options } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import { API_BASE, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from './environment';

const googleConfig: FastifyOAuth2Options = {
	name: 'google',
	scope: ['profile', 'email'],
	credentials: {
		auth: oauth2.GOOGLE_CONFIGURATION,
		client: {
			id: GOOGLE_CLIENT_ID!,
			secret: GOOGLE_CLIENT_SECRET!,
		},
	},
	callbackUri: `${API_BASE}/v1/auth/callback/google`,
	callbackUriParams: {
		access_type: 'offline', // will tell Google to send a refreshToken too
	},
};

export const socialConnections = [googleConfig];
