/**
 * External dependencies.
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { CreateUserInput, CreateUserResponse } from './user.schema';
import { createUserService } from './user.service';

/**
 * Create a user controller.
 */
export const createUserController = async (request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) => {
	const newUser = await createUserService(request.body);

	const payload: CreateUserResponse = {
		success: true,
		data: newUser,
	};

	return reply.status(201).send(payload);
};
