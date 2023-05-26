/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import { JWTPayloadType } from '@/modules/auth/auth.schema';
import { server } from '@/server';

/**
 * Generate access token. This token contains user data.
 */
export const generateAccessToken = (userData: JWTPayloadType) => {
	return server.jwt.sign(userData, {
		expiresIn: '15m',
	});
};

/**
 * Generate refresh token. This token contains user ID.
 */
export const generateRefreshToken = (userData: JWTPayloadType) => {
	return server.jwt.sign({ sub: userData.sub }, { expiresIn: '7d' });
};

/**
 * Verify password.
 */
export const verifyPassword = async (p1: string, p2: string) => {
	return await bcrypt.compare(p1, p2);
};
