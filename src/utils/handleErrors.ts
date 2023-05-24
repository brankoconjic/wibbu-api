import { ErrorResponseType } from '@/modules/user/user.schema';
import { Prisma } from '@prisma/client';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

const GENERIC_ERROR_MESSAGE = 'An error occurred.' as const;

type ReturnErrorType = {
	status: number;
	error: ErrorResponseType;
};

export const handleError = (error: Prisma.PrismaClientKnownRequestError | FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
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
	const fastifyError = error as FastifyError;
	if ((error as FastifyError) instanceof Error) {
		errObj.status = fastifyError?.statusCode ? fastifyError.statusCode : 500;

		errObj.error = {
			message: process.env.NODE_ENV === 'development' ? fastifyError.message : GENERIC_ERROR_MESSAGE,
			code: process.env.NODE_ENV === 'development' ? fastifyError.code : 'INTERNAL_SERVER_ERROR',
		};

		return reply.status(errObj.status).send(errObj);
	}

	// Send error response
	return reply.status(errObj.status).send(errObj);
};
