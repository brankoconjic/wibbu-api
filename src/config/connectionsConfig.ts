/**
 * External dependencies.
 */
import oauth2 from '@fastify/oauth2';
import type { FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import WibbuException from '@/exceptions/WibbuException';
import { server } from '@/server';
import { API_BASE, CSRF_SECRET, DISCORD_CLIENT, DISCORD_SECRET } from './environment';

export const discordConfig = {
	name: 'discord',
	scope: ['identify', 'email'],
	credentials: {
		client: {
			id: DISCORD_CLIENT!,
			secret: DISCORD_SECRET!,
		},
		auth: oauth2.DISCORD_CONFIGURATION,
	},
	callbackUri: `${API_BASE}/oauth/callback/discord`,
	generateStateFunction: (request: FastifyRequest) => {
		// Create state payload for OAuth2.
		const statePayload = { csrf: CSRF_SECRET };

		// Send state as a JWT to prevent CSRF.
		return server.jwt.sign(statePayload);
	},

	// Custom function to check the stat is valid.
	checkStateFunction: (state: string, callback: () => void) => {
		const { csrf } = server.jwt.decode(state) as { csrf: string; returnUrl: string };

		if (csrf !== CSRF_SECRET) {
			throw new WibbuException({
				statusCode: 403,
				code: 'FORBIDDEN',
				message: 'Token verification failed.', // CSRF is not valid.
			});
		}

		callback();
	},
};
