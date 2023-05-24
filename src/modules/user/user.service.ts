/**
 * External dependencies.
 */
import prisma from '@/config/database';
import bcrypt from 'bcrypt';

/**
 * Internal dependencies.
 */
import { CreateUserInput } from './user.schema';

export const createUserService = async (user: CreateUserInput) => {
	const { password, ...rest } = user;
	const hashedPassword = await bcrypt.hash(password, 10);

	const newUser = await prisma.user.create({
		data: {
			...rest,
			password: hashedPassword,
		},
	});

	return newUser;
};
