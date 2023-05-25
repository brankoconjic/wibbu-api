import { ProtectedUserRequest } from '@/modules/auth/auth.schema';
import { FastifyInstance as FastifyInstanceBase } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance extends FastifyInstanceBase {
		jwt: string;
		authenticate: any;
	}
}
