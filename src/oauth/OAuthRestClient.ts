import {RestClient} from "../client";
import {StringUtil} from "../util";

export type TokenRequestPayloadBase = {
	targetAudience: string;
}

export type RequestAccessTokenPayload = TokenRequestPayloadBase & {
	idToken: string;
	privilege: string;
}

export type RequestIdTokenFromPrevTokenPayload = {
	idToken: string;
}

export type RequestIdTokenFromLoginPayload = TokenRequestPayloadBase & {
	login: string;
	password: string;
}

export type TokenResponsePayloadBase = {
	token: string;
	issuedAt: Date;
	expires?: Date | null;
}

export type IdTokenPayload = TokenResponsePayloadBase & {
}

export type AccessTokenPayload = TokenResponsePayloadBase & {
}

export type JwKeyPayload = {
	kty: string;
	kid: string;
	n: string;
	e: string;
}

export type JwksPayload = {
	keys: Array<JwKeyPayload>;
}

/**
 * This implements rest client for OAuth server - https://github.com/lotcz/oauth-server
 * Provide basic url, /api/oauth path prefix will be added automatically
 */
export class OAuthRestClient extends RestClient {

	constructor(oauthUrl: string) {
		super(`${StringUtil.trimSlashes(oauthUrl)}/api/oauth`);
	}

	jwks(): Promise<JwksPayload> {
		return this.getJson('jwks.json');
	}

	verifyIdToken(idToken: string): Promise<IdTokenPayload> {
		return this.getJson(`id-tokens/verify/${idToken}`);
	}

	requestIdTokenFromLogin(request: RequestIdTokenFromLoginPayload): Promise<IdTokenPayload> {
		return this.postJson('id-tokens/from-login', request);
	}

	refreshIdToken(request: RequestIdTokenFromPrevTokenPayload): Promise<IdTokenPayload> {
		return this.postJson('id-tokens/refresh', request);
	}

	requestAccessToken(request: RequestAccessTokenPayload): Promise<AccessTokenPayload> {
		return this.postJson('access-tokens/from-id-token', request);
	}

}
