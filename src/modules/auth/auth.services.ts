/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { generateAccessToken, generateRefreshToken } from '@/utils/auth';
import { pruneProperties } from '@/utils/misc';
import { User } from '@prisma/client';
import { LoginRequest, UserType, userSchema } from './auth.schema';

export const loginService = async (data: LoginRequest) => {
	if (data.type === 'password') {
		// Find user by email.
		const user = await findUserByEmail(data.email);

		if (!user) {
			throw new WibbuException({
				code: 'INVALID_CREDENTIALS',
				message: 'Invalid credentials',
				statusCode: 401,
			});
		}

		// Check if user has password, if not, it is an oauth user.
		if (!user.password) {
			throw new WibbuException({
				code: 'OAUTH_ONLY',
				message: 'User logged with OAuth only',
				statusCode: 401,
			});
		}

		// Validate password.
		// const isPasswordValid = await verifyPassword(data.password, user.password);
		const isPasswordValid = true;

		if (!isPasswordValid) {
			throw new WibbuException({
				code: 'INVALID_CREDENTIALS',
				message: 'Invalid credentials',
				statusCode: 401,
			});
		}

		// Remove sensitive information, such as password.
		const schemaKeys = Object.keys(userSchema.shape) as (keyof UserType)[];
		const prunedUser = pruneProperties(user, schemaKeys);

		// Generate tokens
		const accessToken = generateAccessToken(prunedUser);
		const refreshToken = generateRefreshToken(prunedUser.id);

		return { accessToken, refreshToken, user: prunedUser };
	} else if (data.type === 'oauth') {
		return {
			user: 'bla',
		};
	} else {
		throw new WibbuException({
			message: 'Invalid payload',
			code: 'BAD_REQUEST',
			statusCode: 400,
		});
	}
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */
export const findUserByEmail = async (email: string) => {
	const foundUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	return foundUser;
};
