import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
	console.error('Missing environment variables. Set variable in .env file and restart the application.');
	process.exit(1);
}

export const API_VERSION = 'v1' as const;

export const WIBBU_DOMAIN = 'https://socialsnap.com' as const;
export const API_BASE = 'http://localhost:3300' as const;
export const API_PREFIX = `${API_VERSION}` as const;

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;
export const CSRF_SECRET = process.env.CSRF_SECRET;
export const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3300;

// Social Connections - OAuth2
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
