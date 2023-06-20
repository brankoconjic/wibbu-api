/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';
import { validate as uuidValidate, version as uuidVersion, v4 as uuidv4 } from 'uuid';

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

type VerificationCodeType = '2fa' | 'uuid';

/**
 * Generate a random 5-digit verification code or UUID depending on {type}.
 *
 * @returns 5-digit verification code.
 */
export const generateVerificationCode = (type: VerificationCodeType = '2fa') => {
	if (type === 'uuid') {
		return uuidv4();
	}

	return Math.floor(10000 + Math.random() * 90000);
};

/**
 * Validate UUID v4.
 *
 * @param uuid - UUID to validate.
 * @returns True if valid UUID v4.
 */
export const uuidValidateV4 = (uuid: string) => {
	return uuidValidate(uuid) && uuidVersion(uuid) === 4;
};
