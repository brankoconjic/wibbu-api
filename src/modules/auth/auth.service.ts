/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { LoginRequest } from '@/modules/auth/auth.schema';
import { generateAccessToken, verifyPassword } from '@/utils/auth';

export const loginService = async (loginRequest: LoginRequest) => {
	const { email, password } = loginRequest;

	// Find by email
	const foundUser = await findUserByEmail(email);

	if (!foundUser) {
		throw new WibbuException({
			code: 'INVALID_CREDENTIALS',
			message: 'Invalid credentials',
			statusCode: 401,
		});
	}

	// Validate password
	const isPasswordValid = await verifyPassword(password, foundUser.password);

	if (!isPasswordValid) {
		throw new WibbuException({
			code: 'INVALID_CREDENTIALS',
			message: 'Invalid credentials',
			statusCode: 401,
		});
	}

	// Generate access token
	const accessToken = generateAccessToken(foundUser);

	// Return data
	return accessToken;
};

/**
 * Find user by email.
 *
 * @param email string - User email
 * @returns User | null - Found user or null if not found.
 */
export const findUserByEmail = async (email: string) => {
	const foundUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	return foundUser;
};
