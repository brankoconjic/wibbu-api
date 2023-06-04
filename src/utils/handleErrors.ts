/**
 * External dependencies.
 */
import { Prisma } from '@prisma/client';
import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

/**
 * Internal dependencies.
 */
import { isDev } from './misc';

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.' as const;

type ErrorResponseType = {
	message: string;
	code: string | 'UNKNOWN_ERROR' | 'INTERNAL_SERVER_ERROR' | 'DUPLICATE_ERROR';
};

type ReturnErrorType = {
	success: false;
	error: ErrorResponseType;
};

/**
 * Handle errors. Returns default error response if in production.
 *
 * @param error - The error to handle.
 * @param request - The request object.
 * @param reply - The reply object.
 * @returns The error response.
 */
export const handleError = (error: Prisma.PrismaClientKnownRequestError | FastifyError | Error, request: FastifyRequest, reply: FastifyReply) => {
	let errObj: ReturnErrorType = {
		success: false,
		error: {
			message: DEFAULT_ERROR_MESSAGE,
			code: 'INTERNAL_SERVER_ERROR',
		},
	};

	// Handle duplicate record error
	if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
		errObj.error = {
			message: isDev() ? `Record already exists. Please use a different value for {${error?.meta?.target}}.` : DEFAULT_ERROR_MESSAGE,
			code: 'DUPLICATE_ERROR',
		};

		return reply.status(409).send(errObj);
	}

	// Handle other errors
	const fastifyError = error as FastifyError;

	if (fastifyError instanceof Error) {
		const statusCode = fastifyError?.statusCode ? fastifyError.statusCode : 500;
		errObj.error = {
			message: isDev() ? fastifyError.message : DEFAULT_ERROR_MESSAGE,
			code: isDev() ? fastifyError.code : DEFAULT_ERROR_MESSAGE,
		};

		return reply.status(statusCode).send(errObj);
	}

	// Send error response
	return reply.status(500).send(errObj);
};
