/**
 * External dependencies.
 */
import { FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { Prisma } from '@prisma/client';
import { CreateUserInput, CreateUserResponse } from './user.schema';
import { createUserService } from './user.service';
import { handleError } from '@/utils/handleErrors';

/**
 * Create a user controller.
 */
export const createUserController = async (request: FastifyRequest<{ Body: CreateUserInput }>, reply: FastifyReply) => {
	try {
		const newUser = await createUserService(request.body);

		const payload: CreateUserResponse = {
			success: true,
			data: newUser,
		};

		return reply.status(201).send(payload);
	} catch (err) {
		const { status, error } = handleError(err);

		return reply.status(status).send({
			success: false,
			error,
		});
	}
};
