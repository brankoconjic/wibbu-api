import dotenv from 'dotenv';

// Load environment variables from .env file.
dotenv.config();

if (!process.env.DATABASE_URL || !process.env.JWT_SECRET) {
  console.error(
    'Missing environment variables. Set variable in .env file and restart the application.'
  );
  process.exit(1);
}

export const API_VERSION = 'v1' as const;
export const API_BASE = process.env.API_BASE || ('https://api.wibbu.com' as const);
export const API_PREFIX = `${API_VERSION}` as const;

export const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3300;

export const DATABASE_URL = process.env.DATABASE_URL;
export const JWT_SECRET = process.env.JWT_SECRET;

// Auth providers - OAuth2
export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
export const FACEBOOK_APP_ID = process.env.FACEBOOK_APP_ID;
export const FACEBOOK_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
export const INSTAGRAM_APP_ID = process.env.INSTAGRAM_APP_ID;
export const INSTAGRAM_APP_SECRET = process.env.INSTAGRAM_APP_SECRET;
