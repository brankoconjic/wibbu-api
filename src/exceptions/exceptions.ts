import WibbuExceptionProp from './WibbuException';

export const BAD_REQUEST_EXCEPTION = {
	code: 'BAD_REQUEST',
	message: 'Bad request',
	statusCode: 400,
} as WibbuExceptionProp;

export const UNAUTHORIZED_EXCEPTION = {
	code: 'UNAUTHORIZED',
	message: 'User not found',
	statusCode: 401,
} as WibbuExceptionProp;

export const FORBIDDEN_EXCEPTION = {
	statusCode: 403,
	code: 'FORBIDDEN',
	message: 'You are not allowed to access this resource.',
} as WibbuExceptionProp;

export const INVALID_VERIFICATION_CODE = {
	code: 'INVALID_CODE',
	message: 'Invalid verification code',
	statusCode: 400,
} as WibbuExceptionProp;

export const EMAIL_ALREADY_VERIFIED_EXCEPTION = {
	code: 'EMAIL_VERIFIED',
	message: 'Email already verified',
	statusCode: 200,
} as WibbuExceptionProp;

export const USER_NOT_FOUND_EXCEPTION = {
	code: 'USER_NOT_FOUND',
	message: 'User not found',
	statusCode: 404,
} as WibbuExceptionProp;

export const INVALID_PROVIDER_EXCEPTION = {
	code: 'BAD_REQUEST',
	message: 'Invalid provider',
	statusCode: 400,
} as WibbuExceptionProp;
