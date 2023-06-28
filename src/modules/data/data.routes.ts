/**
 * External dependencies.
 */
import { FastifyInstance } from 'fastify/types/instance';

/**
 * Internal dependencies.
 */
import { dataCallbackController, pinterestController } from './data.controller';
import { FastifyRequest } from 'fastify/types/request';

const dataRoutes = async (server: FastifyInstance) => {
	/**
	 * @route GET /pinterest - Get Pinterest data.
	 */
	server.post('/pinterest', pinterestController);

	/**
	 * @route GET /callback/:provider - Data callback.
	 */
	server.get('/callback/:provider', dataCallbackController);
};

export default dataRoutes;
