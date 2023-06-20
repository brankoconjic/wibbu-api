/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import { server } from '@/server';
import { User } from '@prisma/client';

/**
 * Generate access and refresh tokens.
 *
 * @param userData - User data to be stored in the token.
 * @returns Access and refresh tokens.
 */
export const generateTokens = (userData: User) => {
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

/**
 * Get user ID from refresh token.
 *
 * @param refreshToken - Refresh token.
 * @returns User ID or null if token is invalid.
 */
export const getUserIdFromRefreshToken = (refreshToken: string) => {
	const decodedToken = server.jwt.decode<{ sub: string }>(refreshToken);
	return decodedToken?.sub ?? null;
};

/**
 * Generate a random 5-digit verification code.
 *
 * @returns 5-digit verification code.
 */
export const generateVerificationCode = () => {
	return Math.floor(10000 + Math.random() * 90000);
};
