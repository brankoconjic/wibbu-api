export type GoogleIdTokenType = {
	iss: string;
	azp: string;
	aud: string;
	sub: string;
	at_hash: string;
	name: string;
	picture: string;
	given_name: string;
	family_name: string;
	locale: string;
	iat: number;
	exp: number;
	email: string;
	email_verified: boolean;
};

export type TokenUserDataType = {
	providerId: string;
	name: string;
	email?: string | null;
	profileImage?: string;
};
