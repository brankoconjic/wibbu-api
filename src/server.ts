/**
 * External dependencies.
 */
import Fastify from 'fastify';

/**
 * Internal dependencies.
 */
import { API_PREFIX, PORT } from '@/config/environment';
import userRoutes from '@/modules/user/user.routes';
import { userSchemas } from '@/modules/user/user.schema';
import { handleError } from '@/utils/handleErrors';

const logger =
	process.env.NODE_ENV === 'development'
		? {
				transport: {
					target: 'pino-pretty',
				},
		  }
		: false;

const server = Fastify({ logger: logger });

// Handle SIGTERM signal
process.on('SIGTERM', async () => {
	try {
		await server.close();
		server.log.info('Server gracefully closed.');
		process.exit(0);
	} catch (err) {
		server.log.error('Error while closing server:', err);
		process.exit(1);
	}
});

const start = async () => {
	// Register schemas.
	for (const schema of userSchemas) {
		server.addSchema(schema);
	}

	// Register custom error handler.
	server.setErrorHandler(handleError);

	// Register routes.
	server.register(userRoutes, { prefix: `${API_PREFIX}/users` });

	try {
		await server.listen({
			port: PORT,
			host: '0.0.0.0',
		});
	} catch (err) {
		server.log.error(err);
		process.exit(1);
	}
};

// Run the server!
start();
