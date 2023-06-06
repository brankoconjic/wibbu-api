/**
 * External dependencies.
 */
import { Token } from '@fastify/oauth2';

/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { server } from '@/server';
import { GoogleIdTokenType, TokenUserDataType } from '@/types/connectionTypes';
import { generateAccessToken, generateRefreshToken, verifyPassword } from '@/utils/auth';
import { pruneProperties } from '@/utils/misc';
import { AuthProvider, AuthProviderType, User } from '@prisma/client';
import { LoginRequest, UserType, userSchema } from './auth.schema';

/**
 * Login user with username or oauth.
 */
export const login = async (data: LoginRequest) => {
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

/**
 * Update or create user with token. Used for both login and signup.
 *
 * @param token - Access token containing information from the user.
 * @returns User object.
 */
export const upsertUserWithToken = async (token: Token, provider: AuthProviderType) => {
	const userData = await getUserDataFromToken(token, provider);
	let user: User | null | undefined = null;
	let authProvider: (AuthProvider & Partial<{ User: User }>) | null = null;

	// Look for user by providerId.
	authProvider = await findAuthProviderById(userData.providerId);
	user = authProvider?.User;

	// If we cannot get User through authProvider, try getting user by email.
	if (!user && userData.email) {
		user = await findUserByEmail(userData.email);
	}

	if (user) {
		console.log('User already exists! Updating...');

		// Update user
		await prisma.user.update({
			where: {
				id: user.id,
			},
			data: {
				name: userData.name,
				email: userData.email,
				profileImage: userData.profileImage,
			},
		});
	} else {
		console.log('No user found! Creating User and AuthProvider...');

		// If we cannot get User through authProvider or email, it means it's a new user so create new User and authProvider from token.
		user = await prisma.user.create({
			data: {
				name: userData.name,
				email: userData.email,
				profileImage: userData.profileImage,
			},
		});
	}

	// This will update the updatedAt field in authProvider if it exists and create AuthProvider if it doesn't exist.
	authProvider = await prisma.authProvider.upsert({
		where: {
			id: userData.providerId,
		},
		update: {
			updatedAt: new Date(),
		},
		create: {
			id: userData.providerId,
			userId: user.id,
			provider,
		},
	});

	console.log({
		authProvider,
	});

	// Return newly created user.
	return user;
};

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

/**
 * Get user data from token. Return normalized user data.
 *
 * @param token - Access token containing information from the user.
 * @param provider - Auth provider.
 * @returns User data.
 */
const getUserDataFromToken = async (token: Token, provider: AuthProviderType) => {
	let userData: TokenUserDataType | null = null;

	// Google
	if (provider === 'google') {
		const { id_token } = token;

		if (!id_token) {
			throw new WibbuException({
				message: 'Invalid payload',
				code: 'BAD_REQUEST',
				statusCode: 400,
			});
		}

		const decodedProviderToken = server.jwt.decode<GoogleIdTokenType>(id_token);

		if (!decodedProviderToken) {
			throw new WibbuException({
				message: 'Invalid payload',
				code: 'BAD_REQUEST',
				statusCode: 400,
			});
		}

		// Set user data.
		userData = {
			providerId: decodedProviderToken?.sub,
			name: decodedProviderToken?.name,
			email: decodedProviderToken?.email_verified ? decodedProviderToken?.email : null,
			profileImage: decodedProviderToken?.picture,
		};
	}

	if (!userData) {
		throw new WibbuException({
			message: 'Unable to get user data from token',
			code: 'BAD_REQUEST',
			statusCode: 400,
		});
	}

	return userData;
};

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

/**
 * Find auth provider by provider id.
 *
 * @param providerId - Auth provider id.
 * @returns authProvider object or null if not found.
 */
export const findAuthProviderById = async (providerId: string) => {
	const authProvider = await prisma.authProvider.findUnique({
		where: { id: providerId },
		include: { User: true },
	});

	return authProvider;
};
