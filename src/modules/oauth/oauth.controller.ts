/**
 * External dependencies.
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { server } from '@/server';

export const discordController = async (
	request: FastifyRequest<{
		Querystring: {
			code: string;
			state: string;
		};
	}>,
	reply: FastifyReply
) => {
	const { token } = await server.discord.getAccessTokenFromAuthorizationCodeFlow(request);
	const { returnUrl } = server.jwt.decode(request.query.state) as { csrf: string; returnUrl: string };

	// Store token to DB and other logic...

	reply.send({ token, returnUrl });

	// reply.redirect(returnUrl);
};
