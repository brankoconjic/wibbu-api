import { FastifyInstance as FastifyInstanceBase } from 'fastify';

declare module 'fastify' {
	interface FastifyInstance extends FastifyInstanceBase {
		jwt: string;
		authenticate: any;
	}
}
