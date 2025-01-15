import {RestClient} from "./RestClient";
import {StringUtil} from "../util";

export type TokenRequestPayloadBase = {
	targetAudience: string;
}

export type RequestAccessTokenPayload = TokenRequestPayloadBase & {
	idToken: string;
}

export type RequestIdTokenFromSessionPayload = TokenRequestPayloadBase & {
	sessionId: string;
}

export type RequestIdTokenFromLoginPayload = TokenRequestPayloadBase & {
	login: string;
	password: string;
}

export type RefreshAccessTokenPayload = TokenRequestPayloadBase & {
	accessToken: string;
	refreshToken: string;
}

export type TokenResponsePayloadBase = {
	expires?: Date | null;
}

export type IdTokenPayload = TokenResponsePayloadBase & {
	idToken: string;
}

export type AccessTokenPayload = TokenResponsePayloadBase & {
	accessToken: string;
	refreshToken: string;
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

export type SessionPayload = {
	session_id: string;
	plugin_id: number;
	user_id: number;
	account_id: number;
	server: string;
	user_name: string;
	timezone: string;
}

/**
 * This implements rest client for Incomaker OAuth server - https://gitlab.incomaker.com/apis/oauth-server
 */
export class OAuthRestClient extends RestClient {

	constructor(baseUrl: string) {
		super(`${StringUtil.trimSlashes(baseUrl)}/api`);
	}

	jwks(): Promise<JwksPayload> {
		return this.getJson('jwks.json');
	}

	requestIdTokenFromLogin(request: RequestIdTokenFromLoginPayload): Promise<IdTokenPayload> {
		return this.postJson('id-tokens/from-login', request);
	}

	requestIdTokenFromSession(request: RequestIdTokenFromSessionPayload): Promise<IdTokenPayload> {
		return this.postJson('id-tokens/from-session', request);
	}

	requestAccessToken(request: RequestAccessTokenPayload): Promise<AccessTokenPayload> {
		return this.postJson('access-tokens/from-id-token', request);
	}

	refreshAccessToken(request: RefreshAccessTokenPayload): Promise<AccessTokenPayload> {
		return this.postJson('access-tokens/refresh', request);
	}

	loadSessionById(sessionId: string): Promise<SessionPayload> {
		return this.getJson(`sessions/${sessionId}`);
	}
}
