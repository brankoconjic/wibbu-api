/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { generateAccessToken, generateRefreshToken, verifyPassword } from '@/utils/auth';
import { pruneProperties } from '@/utils/misc';
import { LoginRequest, UserType, userSchema } from './auth.schema';

/**
 * Login user with username or oauth.
 */
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
				message: 'User logged in with OAuth only',
				statusCode: 401,
			});
		}

		// Validate password.
		const isPasswordValid = await verifyPassword(data.password, user.password);

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
		/* {token} is JWT encoded with id, email, name accessToken and refreshToken */
		// find user by email, if email exists update user with new login data (oAuth)
		// find user by id if email does not exist
		// if user exists, update user with new data

		// if user does not exist, create user with data

		return {
			user: 'bla',
			refreshToken: '1231',
			accessToken: '123',
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

/**
 * Find user by email.
 *
 * @param email - User email.
 * @returns User object or null if not found.
 */
export const findUserByEmail = async (email: string) => {
	const foundUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	return foundUser;
};
