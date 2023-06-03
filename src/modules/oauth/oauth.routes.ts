/**
 * External dependencies.
 */
import type { FastifyInstance } from 'fastify';

/**
 * Internal dependencies.
 */
import { discordCallbackController, connectController } from './oauth.controller';
import { SocialConnection } from '@/types/fastify';

const oauthRoutes = async (server: FastifyInstance) => {
	const connections: SocialConnection[] = ['DISCORD'];

	// Check authorization.
	// @todo - enable on production.
	// server.addHook('onRequest', server.authorize(['ADMIN']));

	// Register ouath connect controllers.
	for (const connection of connections) {
		server.get(`/connect/${connection.toLowerCase()}`, connectController);
	}

	// Register callback controllers.
	server.get(`/callback/discord`, discordCallbackController);
};

export default oauthRoutes;
