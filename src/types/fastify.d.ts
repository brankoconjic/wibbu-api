/**
 * External dependencies.
 */
import { OAuth2Namespace } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import { Role } from '@/utils/roles';
import { User } from '@prisma/client';

declare module 'fastify' {
	interface FastifyInstance {
		jwt: string;
		authorize: (roles?: Role[]) => (request: any) => Promise<void>;
		verifyEmptyDataRequest: (request: FastifyRequest, reply: FastifyReply) => void;
		google: OAuth2Namespace;
		facebook: OAuth2Namespace;
		instagram: any;
	}
}

declare module '@fastify/jwt' {
	interface FastifyJWT {
		// payload: { Name: string; e_mail: string };
		user: User;
	}
}
