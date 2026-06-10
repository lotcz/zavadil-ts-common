
export const PERMISSION_LEVELS = ["read", "write", "admin"] as const;

export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export type TokenRequestPayloadBase = {
	targetAudience: string;
};

export type RequestAccessTokenPayload = TokenRequestPayloadBase & {
	refreshToken: string;
	scope: string;
};

export type RenewRefreshTokenPayload = {
	refreshToken: string;
};

export type RequestRefreshTokenFromLoginPayload = TokenRequestPayloadBase & {
	login: string;
	password: string;
};

export type TokenResponsePayloadBase = {
	token: string;
	issuedAt: Date;
	expires?: Date | null;
};

export type IdTokenPayload = TokenResponsePayloadBase & {};

export type AccessTokenPayload = TokenResponsePayloadBase & {
	scopes?: Array<string>;
};

export type RefreshTokenPayload = TokenResponsePayloadBase & {};

export type JwKeyPayload = {
	kty: string;
	kid: string;
	n: string;
	e: string;
};

export type JwksPayload = {
	keys: Array<JwKeyPayload>;
};
