/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import { CreateUserDataResponse } from '@/modules/user/user.schema';
import { server } from '@/server';

/**
 * Generate access token. This token contains user data.
 */
export const generateAccessToken = (user: CreateUserDataResponse) => {
	return server.jwt.sign(user, {
		expiresIn: '15m',
	});
};

/**
 * Generate refresh token. This token contains user ID.
 */
export const generateRefreshToken = (user: CreateUserDataResponse) => {
	return server.jwt.sign({ id: user.id }, { expiresIn: '7d' });
};

/**
 * Verify password.
 */
export const verifyPassword = async (p1: string, p2: string) => {
	return await bcrypt.compare(p1, p2);
};
