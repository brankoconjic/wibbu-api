/**
 * External dependencies.
 */
import { FastifyReply } from 'fastify/types/reply';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import { findUserById } from '../auth/auth.services';
import { UpdateRequest, UsersDetailsQuery } from './user.schema';
import { findUsers, getUsersCount, updateUser } from './user.services';

/**
 * Update user controller.
 */
export const updateController = async (request: FastifyRequest<{ Body: UpdateRequest }>, reply: FastifyReply) => {
	const updatedUser = await updateUser(request);
	reply.send({
		success: true,
		data: {
			user: updatedUser,
		},
	});
};

/**
 * Get user details controller.
 */
export const myDetailsController = async (request: FastifyRequest, reply: FastifyReply) => {
	const { id } = request.user;
	const user = await findUserById(id);

	reply.send({
		success: true,
		data: {
			user,
		},
	});
};

/**
 * Get user details for id controller.
 */
export const userDetailsController = async (
	request: FastifyRequest<{
		Params: { id: string };
	}>,
	reply: FastifyReply
) => {
	const { id } = request.params;
	const user = await findUserById(id);

	reply.send({
		success: true,
		data: {
			user,
		},
	});
};

/**
 * Get all users controller.
 */
export const usersController = async (request: FastifyRequest<{ Querystring: UsersDetailsQuery }>, reply: FastifyReply) => {
	const { page = 1, limit = 100 } = request.query;

	const users = await findUsers(page, limit);
	const totalUsersCount = await getUsersCount();
	const totalPages = Math.ceil(totalUsersCount / limit);

	reply.headers({
		'X-Total-Count': totalUsersCount,
		'X-Current-Page': page,
		'X-Total-Pages': totalPages,
		'X-Per-Page': limit,
		'Access-Control-Expose-Headers': 'X-Total-Count X-Current-Page X-Total-Pages X-Per-Page',
	});

	reply.send({
		success: true,
		data: {
			pagination: {
				total: totalUsersCount,
				currentPage: page,
				totalPages: totalPages,
				perPage: limit,
			},
			users,
		},
	});
};
