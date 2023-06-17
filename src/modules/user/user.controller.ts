/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { updateUser } from './user.services';

export const updateController = async (
	request: FastifyRequest,
	reply: FastifyReply
) => {
	const updatedUser = await updateUser();
};
