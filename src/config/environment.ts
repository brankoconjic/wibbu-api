import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

if (!process.env.DATABASE_URL) {
	console.error('Missing environment variable DATABASE_URL. Set this variable in .env file and restart the application.');
	process.exit(1);
}

export const DATABASE_URL = process.env.DATABASE_URL;
export const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3300;

export const API_VERSION = 'v1' as const;
export const API_PREFIX = `api/${API_VERSION}` as const;
