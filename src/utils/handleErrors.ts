import { Prisma } from '@prisma/client';
import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

const GENERIC_ERROR_MESSAGE = 'An error occurred.' as const;

type ErrorResponseType = {
	message: string;
	code: string | 'UNKNOWN_ERROR' | 'INTERNAL_SERVER_ERROR' | 'DUPLICATE_ERROR';
};

type ReturnErrorType = {
	success: false;
	error: ErrorResponseType;
};

export const handleError = (error: Prisma.PrismaClientKnownRequestError | FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
	let errObj: ReturnErrorType = {
		success: false,
		error: {
			message: GENERIC_ERROR_MESSAGE,
			code: 'UNKNOWN_ERROR',
		},
	};

	// Handle duplicate record error
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		errObj.error = {
			message: `Record already exists. Please use a different value for {${error?.meta?.target}}.`,
			code: 'DUPLICATE_ERROR',
		};

		return reply.status(409).send(errObj);
	}

	// Handle other errors
	const fastifyError = error as FastifyError;
	if ((error as FastifyError) instanceof Error) {
		const statusCode = fastifyError?.statusCode ? fastifyError.statusCode : 500;
		errObj.error = {
			message: process.env.NODE_ENV === 'development' ? fastifyError.message : GENERIC_ERROR_MESSAGE,
			code: process.env.NODE_ENV === 'development' ? fastifyError.code : 'INTERNAL_SERVER_ERROR',
		};

		return reply.status(statusCode).send(errObj);
	}

	// Send error response
	return reply.status(500).send(errObj);
};
