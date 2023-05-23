/**
 * External dependencies.
 */
import dotenv from 'dotenv';
import Fastify from 'fastify';

/**
 * Internal dependencies.
 */
import { PORT, API_PREFIX } from './config/environment';
import userRoutes from './modules/user/user.routes';
import { userSchemas } from './modules/user/user.schema';

// Load environment variables from .env file.
dotenv.config();

const server = Fastify({
	logger: true,
});

const start = async () => {
	// Register schemas.
	for (const schema of userSchemas) {
		server.addSchema(schema);
	}

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
