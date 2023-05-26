import { ProtectedUserRequest } from '@/modules/auth/auth.schema';
import { Role } from '@/utils/roles';
import { FastifyInstance as FastifyInstanceBase } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance extends FastifyInstanceBase {
		jwt: string;
		authorize: (roles: Role[]) => (request: any) => Promise<void>;
	}
}
