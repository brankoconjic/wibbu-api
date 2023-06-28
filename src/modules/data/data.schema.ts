/**
 * External Dependencies
 */
import { z } from 'zod';

export const dataProvidersSchema = z.enum(['instagram']);

/* ---------------------------------- Types --------------------------------- */
export type DataProvider = z.infer<typeof dataProvidersSchema>;
