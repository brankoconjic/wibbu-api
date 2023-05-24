import { ErrorResponseType } from '@/modules/user/user.schema';
import { Prisma } from '@prisma/client';
import { FastifyReply, FastifyRequest } from 'fastify';

const GENERIC_ERROR_MESSAGE = 'An error occurred.' as const;

type ReturnErrorType = {
	status: number;
	error: ErrorResponseType;
};

export const handleError = (error: any, request: FastifyRequest, reply: FastifyReply) => {
	let errObj: ReturnErrorType = {
		status: 500,
		error: {
			message: GENERIC_ERROR_MESSAGE,
			code: 'UNKNOWN_ERROR',
		},
	};

	// Handle duplicate record error
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		errObj.status = 409;
		errObj.error = {
			message: `Record already exists. Please use a different value for {${error?.meta?.target}}.`,
			code: 'DUPLICATE_ERROR',
		};

		return reply.status(errObj.status).send(errObj);
	}

	// Handle other errors
	if (error instanceof Error) {
		errObj.status = 500;
		errObj.error = {
			message: process.env.NODE_ENV === 'development' ? error.message : GENERIC_ERROR_MESSAGE,
			code: 'INTERNAL_SERVER_ERROR',
		};

		return reply.status(errObj.status).send(errObj);
	}

	// Send error response
	return reply.status(errObj.status).send(errObj);
};
