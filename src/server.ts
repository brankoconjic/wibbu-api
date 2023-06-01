/**
 * External dependencies.
 */
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import oauth2 from '@fastify/oauth2';
import Fastify, { FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { API_BASE, API_PREFIX, CSRF_SECRET, DISCORD_CLIENT, DISCORD_SECRET, JWT_SECRET, PORT, WIBBU_DOMAIN } from '@/config/environment';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/user/user.routes';
import { handleError } from '@/utils/handleErrors';
import { Role } from '@prisma/client';
import WibbuException from './exceptions/WibbuException';
import oauthRoutes from './modules/oauth/oauth.routes';
import { schemas } from './utils/buildSchemas';
import { hasAccess } from './utils/roles';

const logger =
	process.env.NODE_ENV === 'development'
		? {
				transport: {
					target: 'pino-pretty',
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
		server.register(helmet, { global: true });

		// Register JWT plugin.
		server.register(jwt, {
			secret: JWT_SECRET,
			cookie: {
				cookieName: 'refreshToken',
				signed: false, // already signed by jwt
			},
		});

		/* -------------------------------------------------------------------------- */
		/*                  Add custom decorator to authorize users.                  */
		/* -------------------------------------------------------------------------- */
		server.decorate('authorize', (roles: Role[]) => {
			return async (request: any) => {
				// Check access token.
				await request.jwtVerify();
				const userRole = request.user.role;

				// Check if user role is contained within roles.
				if (!hasAccess(userRole, roles)) {
					throw new WibbuException({
						statusCode: 403,
						code: 'FORBIDDEN',
						message: 'You are not allowed to access this resource.',
					});
				}
			};
		});

		// Add schemas.
		for (const schema of schemas) {
			server.addSchema(schema);
		}

		// Register routes.
		server.register(userRoutes, { prefix: `${API_PREFIX}/users` });
		server.register(authRoutes, { prefix: `${API_PREFIX}` });
		server.register(oauthRoutes, { prefix: `oauth2` });

		// Check if user is authenticated when accessing.
		server.addHook('onRequest', async (request) => {
			// Check if request contains /api/v1/oauth
			// if (request.url.includes(`/oauth/redirect/`)) {
			// 	await request.jwtVerify();
			// }
		});

		// Register OAuth2 plugin.
		server.register(oauth2, {
			name: 'discord',
			scope: ['identify', 'email'],
			credentials: {
				client: {
					id: DISCORD_CLIENT!,
					secret: DISCORD_SECRET!,
				},
				auth: oauth2.DISCORD_CONFIGURATION,
			},
			startRedirectPath: `/oauth2/discord`,
			callbackUri: `${API_BASE}/oauth2/discord/callback`,
			generateStateFunction: (
				request: FastifyRequest<{
					Querystring: {
						returnUrl?: string;
					};
				}>
			) => {
				// Create state payload for OAuth2.
				const statePayload = {
					csrf: CSRF_SECRET,
					returnUrl: request.query.returnUrl || WIBBU_DOMAIN,
				};

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
						message: 'State verification failed.', // CSRF is not valid.
					});
				}

				callback();
			},
		});

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
