/**
 * External dependencies.
 */
import bcrypt from 'bcrypt';
import { FastifyRequest } from 'fastify/types/request';

/**
 * Internal dependencies.
 */
import prisma from '@/config/database';
import WibbuException from '@/exceptions/WibbuException';
import { BAD_REQUEST_EXCEPTION } from '@/exceptions/exceptions';
import { UpdateRequest, updateRequestSchema } from './user.schema';

/**
 * Update user profile details.
 *
 * @param request - Fastify request object containing update information.
 * @returns Updated user.
 */
export const updateUser = async (
  request: FastifyRequest<{
    Body: UpdateRequest;
  }>
) => {
  const parsedBody = updateRequestSchema.safeParse(request.body);

  if (!parsedBody.success) {
    throw new WibbuException(BAD_REQUEST_EXCEPTION);
  }

  let data = {
    ...parsedBody.data,
  };

  const { id } = request.user;

  const requestPassword = parsedBody.data.password;
  let hashedPassword = null;

  if (requestPassword) {
    hashedPassword = await bcrypt.hash(requestPassword, 10);

    data = {
      ...parsedBody.data,
      password: hashedPassword,
    };
  }

  // Update the user in the database.
  const updatedUser = prisma.user.update({
    where: {
      id,
    },
    data,
  });

  return updatedUser;
};

/**
 * Get user details.
 *
 * @returns All users.
 */
export const findUsers = async (page: number, limit: number) => {
  const skip = (page - 1) * limit;

  return await prisma.user.findMany({
    skip: skip,
    take: limit,
  });
};

/**
 * Get total number of users.
 *
 * @returns - Total number of users.
 */
export const getUsersCount = async () => {
  return await prisma.user.count();
};
