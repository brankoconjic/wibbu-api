import { FastifyInstance, FastifyRequest } from 'fastify';
import { createUserController } from './user.controller';
import { $ref } from './user.schema';

const userRoutes = async (server: FastifyInstance) => {
	// /**
	//  * @route GET /users - Get all users.
	//  */
	// server.get('/users', async () => {
	// 	return { path: 'get all users' };
	// });

	// /**
	//  * @route GET /users/:id - Get a single user.
	//  * @param {string} id - User ID.
	//  */
	// server.get(
	// 	'/users/:id',
	// 	async (
	// 		req: FastifyRequest<{
	// 			Params: { id: string };
	// 		}>
	// 	) => {
	// 		const { id } = req.params;
	// 		return { path: 'get a single user ' + id };
	// 	}
	// );

	/**
	 * @route POST / - Create a new user.
	 * @body {CreateUserInput} - User input.
	 */
	server.post(
		'/',
		{
			schema: {
				body: $ref('createUserInputSchema'),
				response: {
					201: $ref('createUserResponseSchema'),
				},
			},
		},
		createUserController
	);
};

export default userRoutes;
