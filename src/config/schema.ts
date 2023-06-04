/* -------------------------------------------------------------------------- */
/*                             General API Schema                             */
/* -------------------------------------------------------------------------- */

/**
 * External dependencies.
 */
import { z } from 'zod';

// Specific API responses will extend this schema.
export const apiBaseSchema = z.object({
	success: z.boolean(),
});
