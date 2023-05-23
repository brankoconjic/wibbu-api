import { CreateUserResponse, ErrorResponseType } from '@/modules/user/user.schema';
import { Prisma } from '@prisma/client';

const GENERIC_ERROR_MESSAGE = 'An error occurred.' as const;

type ErrorType = {
	status: number;
	error: ErrorResponseType;
};

export const handleError = (err: any) => {
	let errObj: ErrorType = {
		status: 500,
		error: {
			message: GENERIC_ERROR_MESSAGE,
			code: 'UNKNOWN_ERROR',
		},
	};

	// Handle duplicate record error
	if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
		errObj.status = 409;
		errObj.error = {
			message: `Record already exists. Please use a different value for {${err?.meta?.target}}.`,
			code: 'DUPLICATE_ERROR',
		};

		return errObj;
	}

	// Handle other errors
	if (err instanceof Error) {
		errObj.status = 500;
		errObj.error = {
			message: process.env.NODE_ENV === 'development' ? err.message : GENERIC_ERROR_MESSAGE,
			code: 'INTERNAL_SERVER_ERROR',
		};

		return errObj;
	}

	// Handle unknown errors
	return errObj;
};
