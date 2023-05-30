/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify';

/**
 * Internal dependencies.
 */
import { discordController } from './oauth.controller';

const oauthRoutes = async (server: FastifyInstance) => {
	/**
	 * @route GET /discord/callback - Discord OAuth2 login page redirect handler.
	 */
	server.get('/discord/callback', discordController);
};

export default oauthRoutes;
