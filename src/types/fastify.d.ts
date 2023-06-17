/**
 * External dependencies.
 */
import { OAuth2Namespace } from '@fastify/oauth2';
import { FastifyInstance as FastifyInstanceBase } from 'fastify';

/**
 * Internal dependencies.
 */
import { Role } from '@/utils/roles';

declare module 'fastify' {
	interface FastifyInstance extends FastifyInstanceBase {
		jwt: string;
		authorize: (roles: Role[]) => (request: any) => Promise<void>;
	}
}

declare module 'fastify' {
	interface FastifyInstance {
		google: OAuth2Namespace;
		facebook: OAuth2Namespace;
	}
}
