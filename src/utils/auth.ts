/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import { server } from '@/server';

/**
 * Generate access and refresh tokens.
 *
 * @param userData - User data to be stored in the token.
 * @returns Access and refresh tokens.
 */
export const generateTokens = <T extends { id: string }>(userData: T) => {
	const accessToken = generateAccessToken(userData);
	const refreshToken = generateRefreshToken(userData.id);

	return {
		accessToken,
		refreshToken,
	};
};

/**
 * Generate access token. This token contains user data.
 */
const generateAccessToken = <T extends object>(userData: T) => {
	return server.jwt.sign(userData, {
		expiresIn: '15m',
	});
};

/**
 * Generate refresh token. This token contains user ID.
 */
const generateRefreshToken = (userId: string) => {
	return server.jwt.sign({ sub: userId }, { expiresIn: '7d' });
};

/**
 * Verify password.
 */
export const verifyPassword = async (p1: string, p2: string) => {
	return await bcrypt.compare(p1, p2);
};
