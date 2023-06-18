/**
 * External dependencies.
 */
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import Fastify from 'fastify';

/**
 * Internal dependencies.
 */
import { API_PREFIX, JWT_SECRET, PORT } from '@/config/environment';
import { handleError } from '@/utils/handleErrors';
import { authProviders } from './config/authProviders';
import authRoutes from './modules/auth/auth.routes';
import userRoutes from './modules/user/user.routes';
import { fastifySchemas } from './utils/buildFastifySchemas';

const logger =
	process.env.NODE_ENV === 'development'
		? {
				transport: {
					target: 'pino-pretty',
					options: {
						levelFirst: true,
					},
				},
		  }
		: false;

export const server = Fastify({ logger });

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

		// Register cookie plugin.
		server.register(cookie);

		// Register helmet plugin.
		server.register(helmet, {
			crossOriginOpenerPolicy: false, // @todo: look for better solution.
		});

		// Register JWT plugin.
		server.register(jwt, {
			secret: JWT_SECRET,
			cookie: {
				cookieName: 'refreshToken',
				signed: false, // already signed by jwt
			},
		});

		// Add schemas to server.
		for (const schema of fastifySchemas) {
			server.addSchema(schema);
		}

		// Register routes.
		server.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
		server.register(userRoutes, { prefix: `${API_PREFIX}/user` });

		// Register OAuth2 auth providers.
		for (const config of authProviders) {
			server.register(oauth2, config);
		}

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
