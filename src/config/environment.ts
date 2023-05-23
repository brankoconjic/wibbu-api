export const DATABASE_URL = process.env as Record<string, string>;
export const API_VERSION = 'v1' as const;
export const API_PREFIX = `api/${API_VERSION}` as const;
export const PORT = process.env.PORT !== undefined ? parseInt(process.env.PORT, 10) : 3300;
