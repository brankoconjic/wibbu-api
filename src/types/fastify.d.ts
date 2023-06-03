/**
 * External dependencies.
 */
import { FastifyInstance as FastifyInstanceBase } from 'fastify';
import { OAuth2Namespace } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import { Role } from '@/utils/roles';
import { ProtectedUserRequest } from '@/modules/auth/auth.schema';

declare module 'fastify' {
	interface FastifyInstance extends FastifyInstanceBase {
		jwt: string;
		authorize: (roles: Role[]) => (request: any) => Promise<void>;
	}
}

declare module 'fastify' {
	interface FastifyInstance {
		discord: OAuth2Namespace;
	}
}

const socialConnection = {
	discord: 'DISCORD',
	google: 'GOOGLE',
} as const;

export type SocialConnection = (typeof socialConnection)[keyof typeof socialConnection];
