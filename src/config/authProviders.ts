/**
 * External dependencies.
 */
import oauth2, { FastifyOAuth2Options } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import { API_BASE, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, FACEBOOK_APP_ID, FACEBOOK_APP_SECRET } from './environment';

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

const facebookConfig: FastifyOAuth2Options = {
	name: 'facebook',
	scope: ['email', 'public_profile'],
	credentials: {
		auth: oauth2.FACEBOOK_CONFIGURATION,
		client: {
			id: FACEBOOK_APP_ID!,
			secret: FACEBOOK_APP_SECRET!,
		},
	},
	callbackUri: 'http://localhost:3300/v1/auth/callback/facebook',
	callbackUriParams: {
		access_type: 'offline', // will tell Facebook to send a refresh token
	},
};

export const authProviders = [googleConfig, facebookConfig];
