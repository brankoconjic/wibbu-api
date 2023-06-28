/**
 * External dependencies.
 */
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import Fastify from 'fastify';
import fs from 'fs';
import path from 'path';

/**
 * Internal dependencies.
 */
import { API_PREFIX, JWT_SECRET, PORT } from '@/config/environment';
import { handleError } from '@/utils/handleErrors';
import { FastifyRequest } from 'fastify/types/request';
import { authProviders } from './config/authProviders';
import { dataProviders } from './config/dataProviders';
import WibbuException from './exceptions/WibbuException';
import { BAD_REQUEST_EXCEPTION, FORBIDDEN_EXCEPTION } from './exceptions/exceptions';
import authRoutes from './modules/auth/auth.routes';
import dataRoutes from './modules/data/data.routes';
import userRoutes from './modules/user/user.routes';
import { fastifySchemas } from './utils/buildFastifySchemas';
import { Role, hasAccess } from './utils/roles';

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

export const server = Fastify({
	logger: false,
	https: {
		key: fs.readFileSync(path.join(__dirname, '/dev-cert/key.pem')),
		cert: fs.readFileSync(path.join(__dirname, '/dev-cert/cert.pem')),
	},
});

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

		/**
		 * Decorate server with authorize method.
		 */
		server.decorate('authorize', (roles: Role[]) => {
			return async (request: FastifyRequest) => {
				// Check access token.
				// jwtVerify() adds user to request.
				await request.jwtVerify();

				// Check if user's role matches required roles.
				if (roles && !hasAccess(request.user.role, roles)) {
					throw new WibbuException(FORBIDDEN_EXCEPTION);
				}
			};
		});

		/**
		 * Server decorator that verifies that the request data and query are empty.
		 */
		server.decorate('verifyEmptyDataRequest', async (request: FastifyRequest) => {
			if ((request.body && Object.keys(request.body).length !== 0) || (request.query && Object.keys(request.query).length !== 0)) {
				throw new WibbuException(BAD_REQUEST_EXCEPTION);
			}
		});

		// Add schemas to server.
		for (const schema of fastifySchemas) {
			server.addSchema(schema);
		}

		// Register routes.
		server.register(authRoutes, { prefix: `${API_PREFIX}/auth` });
		server.register(userRoutes, { prefix: `${API_PREFIX}/users` });
		server.register(dataRoutes, { prefix: `${API_PREFIX}/data` });

		// Register OAuth2 auth providers.
		for (const config of authProviders) {
			server.register(oauth2, config);
		}

		// Register OAuth2 data providers.
		for (const config of dataProviders) {
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
