/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { LoginRequest } from '@/modules/auth/auth.schema';
import { CreateUserDataResponse } from '@/modules/user/user.schema';
import { server } from '@/server';
import { generateAccessToken, generateRefreshToken, verifyPassword } from '@/utils/auth';
import { FastifyRequest } from 'fastify';

export const loginService = async (loginRequest: LoginRequest) => {
	const { email, password } = loginRequest;

	// Find by email
	const user = await findUserByEmail(email);

	if (!user) {
		throw new WibbuException({
			code: 'INVALID_CREDENTIALS',
			message: 'Invalid credentials',
			statusCode: 401,
		});
	}

	// Validate password
	const isPasswordValid = await verifyPassword(password, user.password);

	if (!isPasswordValid) {
		throw new WibbuException({
			code: 'INVALID_CREDENTIALS',
			message: 'Invalid credentials',
			statusCode: 401,
		});
	}

	// Remove sensitive information.
	const userData: CreateUserDataResponse = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	// Generate tokens
	const accessToken = generateAccessToken(userData);
	const refreshToken = generateRefreshToken(userData);

	// Return data
	return { accessToken, refreshToken };
};

/**
 * Refresh access token. Exchange refresh token for a new set of access and refresh tokens.
 */
export const refreshTokenService = async (request: FastifyRequest) => {
	// Validate refresh token from cookie, throws an error if invalid.
	await request.jwtVerify({ onlyCookie: true });

	// Decode refresh token
	// @ts-ignore
	const decodedToken = server.jwt.decode(request.cookies.refreshToken) as { id: string; iat: number; exp: number; exp: number };
	const { id } = decodedToken;

	if (!id) {
		throw new WibbuException({
			code: 'INVALID_ACCESS_TOKEN',
			message: 'Invalid access token',
			statusCode: 401,
		});
	}

	// Find user by id
	const user = await findUserById(id);

	if (!user) {
		throw new WibbuException({
			code: 'INVALID_REFRESH_TOKEN',
			message: 'Invalid refresh token',
			statusCode: 401,
		});
	}

	// Remove sensitive information.
	const userData: CreateUserDataResponse = {
		id: user.id,
		email: user.email,
		name: user.name,
		role: user.role,
	};

	// Generate tokens
	const newAccessToken = generateAccessToken(userData);
	const newRefreshToken = generateRefreshToken(userData);

	// Return data
	return { accessToken: newAccessToken, refreshToken: newRefreshToken };
};

/**
 * Find user by email.
 */
export const findUserByEmail = async (email: string) => {
	const foundUser = await prisma.user.findUnique({
		where: {
			email,
		},
	});

	return foundUser;
};

/**
 * Find user by id.
 */
export const findUserById = async (id: string) => {
	const foundUser = await prisma.user.findUnique({
		where: {
			id,
		},
	});

	return foundUser;
};
