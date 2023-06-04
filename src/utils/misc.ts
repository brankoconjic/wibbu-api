import { ZodAny, ZodObject, ZodRawShape } from 'zod';

/**
 * Check if the current environment is development.
 *
 * @returns {boolean} True if the current environment is development, false otherwise.
 */
export const isDev = (): boolean => process.env.NODE_ENV === 'development';

/**
 * Prune extra properties from data object based on Zod schema.
 *
 * @param data - Data object to prune.
 * @param schema - Zod schema to use as reference.
 * @returns {Partial<T>} Pruned data object.
 */

export const pruneProperties = <T>(data: Record<string, any>, keysToKeep: (keyof T)[]): Partial<T> => {
	const prunedData = {} as Partial<T>;

	for (const key of keysToKeep) {
		if (key in data) {
			prunedData[key] = data[key as keyof typeof data];
		}
	}

	return prunedData;
};
