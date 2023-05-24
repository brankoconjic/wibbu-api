/**
 * External dependencies.
 */
import jwt from '@fastify/jwt';
import Fastify, { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { API_PREFIX, JWT_SECRET, PORT } from '@/config/environment';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/user/user.routes';
import { handleError } from '@/utils/handleErrors';
import { schemas } from './utils/buildSchemas';

const logger =
	process.env.NODE_ENV === 'development'
		? {
				transport: {
					target: 'pino-pretty',
				},
		  }
		: false;

export const server = Fastify({ logger: logger });

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
	try {
		// Register custom error handler.
		server.setErrorHandler(handleError);

		// Register JWT plugin.
		server.register(jwt, {
			secret: JWT_SECRET,
		});

		server.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
			try {
				await request.jwtVerify();
			} catch (err) {
				reply.send(err);
			}
		});

		// Add schemas.
		for (const schema of schemas) {
			server.addSchema(schema);
		}

		// Register routes.
		server.register(userRoutes, { prefix: `${API_PREFIX}/users` });
		server.register(authRoutes, { prefix: `${API_PREFIX}` });

		// Listen on PORT.
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
