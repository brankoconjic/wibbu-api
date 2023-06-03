/**
 * Capitalize the first letter of a string, while keeping the rest of the string lowercase.
 */
export const capitalize = (str: string) => {
	return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
