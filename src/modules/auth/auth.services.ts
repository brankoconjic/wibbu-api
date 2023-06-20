/**
 * External dependencies.
 */
import { Token } from '@fastify/oauth2';
import bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { INVALID_VERIFICATION_CODE, UNAUTHORIZED_EXCEPTION } from '@/exceptions/exceptions';
import { server } from '@/server';
import { GoogleIdTokenType, TokenUserDataType } from '@/types/connectionTypes';
import { generateTokens, generateVerificationCode, getUserIdFromRefreshToken, verifyPassword } from '@/utils/auth';
import { pruneProperties } from '@/utils/misc';
import { AuthProvider, AuthProviderType, User } from '@prisma/client';
import { LoginRequest, RegisterRequest } from './auth.schema';

/**
 * Login user with email/password.
 */
export const login = async (data: LoginRequest) => {
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

	// Prune password from user.
	const prunedUser = pruneProperties<User>(user, ['password']) as User;

	// Generate tokens
	const { accessToken, refreshToken } = generateTokens(prunedUser);

	// Return user and tokens.
	return { accessToken, refreshToken, user };
};

/**
 * Register user with email/password
 */
export const register = async (data: RegisterRequest) => {
	// Check if user with that email already exists.
	let user = await findUserByEmail(data.email);

	if (user) {
		throw new WibbuException({
			code: 'EMAIL_IN_USE',
			message: 'That email is already in use',
			statusCode: 401,
		});
	}

	// Proceed to create a new user.
	const hashedPassword = await bcrypt.hash(data.password, 10);

	user = await prisma.user.create({
		data: {
			name: data.name,
			email: data.email,
			password: hashedPassword,
		},
	});

	// Create email verification record.
	await createEmailVerificationRecord(user.id);

	// Prune password from user.
	const prunedUser = pruneProperties<User>(user, ['password']) as User;

	// Generate tokens so we can login the user.
	const { accessToken, refreshToken } = generateTokens(prunedUser);

	// Return user and tokens.
	return { accessToken, refreshToken, user };
};

/**
 * Refresh accessToken and refreshToken using refreshToken.
 *
 * @param request - Fastify request.
 * @returns new accessToken and refreshToken.
 */
export const refreshTokens = async (request: FastifyRequest) => {
	// Get refreshToken from cookie.
	const refToken = request.cookies?.refreshToken;

	// Check if refreshToken exists.
	if (!refToken) {
		throw new WibbuException(UNAUTHORIZED_EXCEPTION);
	}

	// Obtain user from refreshToken.
	const userId = getUserIdFromRefreshToken(refToken);

	if (!userId) {
		throw new WibbuException(UNAUTHORIZED_EXCEPTION);
	}

	const user = await findUserById(userId);

	if (!user) {
		throw new WibbuException(UNAUTHORIZED_EXCEPTION);
	}

	// Prune password from user.
	const prunedUser = pruneProperties<User>(user, ['password']) as User;

	// Generate tokens
	const { accessToken, refreshToken } = generateTokens(prunedUser);

	return { accessToken, refreshToken };
};

/**
 * Update or create user with token (OAuth2). Used for both login and signup.
 *
 * @param token - Access token containing information from the user.
 * @returns User object.
 */
export const upsertUserWithToken = async (token: Token, provider: AuthProviderType) => {
	const userData = await getUserDataFromToken(token, provider);

	let existingUser: User | null | undefined = null;
	let authProvider: (AuthProvider & Partial<{ User: User }>) | null = null;

	// Look for user by providerId.
	authProvider = await findAuthProviderById(userData.providerId);
	existingUser = authProvider?.User;

	if (!existingUser && userData.email) {
		existingUser = await findUserByEmail(userData.email);
	}

	if (existingUser) {
		// Update user
		await prisma.user.update({
			where: { id: existingUser.id },
			data: {
				name: userData.name,
				email: existingUser.email || userData.email,
				profileImage: userData.profileImage,
				emailVerified: true,
			},
		});

		// Delete all related EmailVerification records
		await prisma.emailVerification.deleteMany({ where: { userId: existingUser.id } });
	} else {
		// If we cannot get User through authProvider or email, it means it's a new user so create new User and authProvider from token.
		existingUser = await prisma.user.create({
			data: {
				name: userData.name,
				email: userData.email,
				emailVerified: true,
				profileImage: userData.profileImage,
			},
		});
	}

	// This will update the updatedAt field in authProvider if it exists and create AuthProvider if it doesn't exist.
	authProvider = await prisma.authProvider.upsert({
		where: { id: userData.providerId },
		update: {
			updatedAt: new Date(),
		},
		create: {
			id: userData.providerId,
			provider,
			User: { connect: { id: existingUser.id } },
		},
		include: { User: true },
	});

	// Return newly created user.
	return authProvider.User;
};

/**
 * Endpoint service to handle user email verification.
 *
 * @param code - Email verification JWT token containing user ID and token identifier.
 */
export const verifyEmail = async (code: number, userId: string) => {
	// Get the email verification record
	const emailVerification = await prisma.emailVerification.findUnique({
		where: { userId },
	});

	if (!emailVerification || emailVerification.code !== code) {
		throw new WibbuException(INVALID_VERIFICATION_CODE);
	}

	// Check if the code has expired
	if (emailVerification.expiration.getTime() < new Date().getTime()) {
		throw new WibbuException({
			code: 'EXPIRED_CODE',
			message: 'Verification code expired',
			statusCode: 401,
		});
	}

	// Delete the email verification record.
	await prisma.emailVerification.delete({
		where: { userId },
	});

	// Set emailVerified to true.
	await prisma.user.update({
		where: { id: userId },
		data: { emailVerified: true },
	});
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
	} else if (provider === 'facebook') {
		const { id, name, email } = await fetchDataFromFacebook(token.access_token);

		// Set user data.
		userData = {
			providerId: id,
			name,
			email,
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
	return await prisma.user.findUnique({
		where: {
			email,
		},
	});
};

/**
 * Find user by id.
 *
 * @param id - User id.
 * @returns User object or null if not found.
 */
export const findUserById = async (id: string) => {
	return await prisma.user.findUnique({
		where: {
			id,
		},
	});
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

/**
 * Get user email by id.
 *
 * @param userId - User id.
 * @returns User email or null if not found.
 */
export const getUserEmailById = async (userId: string) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true },
	});

	return user?.email;
};

/**
 * Generate a random verification code and store in a record tied with userId.
 *
 * @param userId - User id.
 */
export const createEmailVerificationRecord = async (userId: string) => {
	// Generate a new verification code
	const verificationCode = generateVerificationCode();

	// Delete any existing EmailVerification record for the user
	await prisma.emailVerification.deleteMany({
		where: { userId },
	});

	// Create a new EmailVerification record
	await prisma.emailVerification.create({
		data: {
			userId,
			code: verificationCode,
			expiration: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
		},
	});

	// Send code verification email to user
	await sendEmailVerificationCode(verificationCode, userId);
};

/**
 * @TODO Implement email sending.
 * @param params
 */
const sendEmailVerificationCode = async (verificationCode: number, userId: string) => {
	const email = await getUserEmailById(userId);

	console.log('send email verification code!', {
		email,
		verificationCode,
	});
};

/**
 * Fetch data from Facebook.
 *
 * @param accessToken - Facebook access token.
 * @returns Facebook data.
 */
const fetchDataFromFacebook = async (accessToken: string) => {
	const apiVersion = '10.0';
	const profileDataUrl = `https://graph.facebook.com/v${apiVersion}/me?fields=name,email&access_token=${accessToken}`;

	const response = await fetch(profileDataUrl);
	const data = await response.json();

	return data;
};
