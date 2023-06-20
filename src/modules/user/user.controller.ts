/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { UpdateRequest } from './user.schema';
import { updateUser } from './user.services';

export const updateController = async (request: FastifyRequest<{ Body: UpdateRequest }>, reply: FastifyReply) => {
	const updatedUser = await updateUser(request);
	reply.send({
		success: true,
		data: {
			user: updatedUser,
		},
	});
};
