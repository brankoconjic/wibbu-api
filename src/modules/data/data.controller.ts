/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import WibbuException from '@/exceptions/WibbuException';
import { BAD_REQUEST_EXCEPTION, INVALID_PROVIDER_EXCEPTION } from '@/exceptions/exceptions';
import { server } from '@/server';
import { DataProvider, dataProvidersSchema } from './data.schema';
import { getInstagramData, getLongInstagramToken, getPinterestData, refreshLongInstagramToken } from './data.service';

/**
 * @TODO - Get Pinterest data.
 */
export const pinterestController = async (
	request: FastifyRequest<{
		Body: {
			username: string;
		};
	}>,
	reply: FastifyReply
) => {
	const { username } = request.body;
	const data = await getPinterestData(username);

	reply.send({
		success: true,
		data,
	});
};

/**
 * Data callback controller.
 */
export const dataCallbackController = async (
	request: FastifyRequest<{
		Querystring: {
			code?: string;
			error?: string;
			error_reason?: string;
			error_description?: string;
		};
	}>,
	reply: FastifyReply
) => {
	const { provider } = request.params as { provider: DataProvider };

	// Check if provider exists.
	const parsed = dataProvidersSchema.safeParse(provider);

	if (!parsed.success) {
		throw new WibbuException(INVALID_PROVIDER_EXCEPTION);
	}

	// Check if user actually gave access to the app.
	if (request.query.error) {
		throw new WibbuException({
			statusCode: 400,
			message: 'User did not give access to the app.',
			code: request.query.error_reason !== undefined ? request.query.error_reason : 'AUTH_ERROR',
		});
	}

	const { token } = await server[provider].getAccessTokenFromAuthorizationCodeFlow(request);
	const longToken = await getLongInstagramToken(token.access_token);

	let refreshedToken = null;

	if (longToken.access_token) {
		refreshedToken = await refreshLongInstagramToken(longToken.access_token);

		if (refreshedToken.access_token) {
			const data = await getInstagramData(refreshedToken.access_token);
			reply.send({ success: true, data });
		}
	}

	// If we get here, something went wrong.
	throw new WibbuException(BAD_REQUEST_EXCEPTION);
};
