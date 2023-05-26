/**
 * External dependencies.
 */
import cookie from '@fastify/cookie';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import Fastify from 'fastify';

/**
 * Internal dependencies.
 */
import { API_PREFIX, JWT_SECRET, PORT } from '@/config/environment';
import authRoutes from '@/modules/auth/auth.routes';
import userRoutes from '@/modules/user/user.routes';
import { handleError } from '@/utils/handleErrors';
import { Role } from '@prisma/client';
import WibbuException from './exceptions/WibbuException';
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

export const server = Fastify({ logger: false });

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
