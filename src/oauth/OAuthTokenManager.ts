import {AccessTokenPayload, IdTokenPayload, OAuthRestClient} from "./OAuthRestClient";
import {EventManager} from "../component";
import {StringUtil} from "../util";
import {OAuthIdTokenProvider} from "./tokenprovider/OAuthIdTokenProvider";

/**
 * Manages refresh of id and access tokens.
 */
export class OAuthTokenManager implements OAuthIdTokenProvider {

	oAuthServer: OAuthRestClient;

	audience: string;

	idToken?: IdTokenPayload;

	freshIdTokenProvider: OAuthIdTokenProvider;

	accessTokens: Map<string, AccessTokenPayload>;

	constructor(oAuthServerBaseUrl: string, targetAudience: string, freshIdTokenProvider: OAuthIdTokenProvider) {
		this.freshIdTokenProvider = freshIdTokenProvider;
		this.audience = targetAudience;
		this.oAuthServer = new OAuthRestClient(oAuthServerBaseUrl);
		this.accessTokens = new Map<string, AccessTokenPayload>();
	}

	isTokenExpired(expires?: Date | null): boolean {
		if (expires === undefined || expires === null) return false;
		return (expires < new Date());
	}

	isTokenReadyForRefresh(issuedAt: Date, expires?: Date | null): boolean {
		if (expires === undefined || expires === null) return false;
		const middle = new Date((expires.getTime() + issuedAt.getTime()) / 2);
		const now = new Date();
		return (middle < now);
	}

	isValidIdToken(idToken?: IdTokenPayload): boolean {
		return idToken !== undefined && StringUtil.notEmpty(idToken.token) && !this.isTokenExpired(idToken.expires);
	}

	hasValidIdToken(): boolean {
		return this.isValidIdToken(this.idToken);
	}

	isValidAccessToken(accessToken?: AccessTokenPayload): boolean {
		return accessToken !== undefined && StringUtil.notEmpty(accessToken.token) && !this.isTokenExpired(accessToken.expires);
	}

	hasValidAccessToken(privilege: string): boolean {
		return this.isValidAccessToken(this.accessTokens.get(privilege));
	}

	reset() {
		this.idToken = undefined;
		this.accessTokens.clear();
	}

	/**
	 * Get stored id token or ask the provider, this will trigger redirect to login screen in case of the default provider
	 */
	getIdTokenInternal(): Promise<IdTokenPayload> {
		if (this.idToken === undefined || !this.hasValidIdToken()) {
			return this.freshIdTokenProvider.getIdToken();
		}
		return Promise.resolve(this.idToken);
	}

	/**
	 * Get id token, refresh it if needed
	 */
	getIdToken(): Promise<IdTokenPayload> {
		return this.getIdTokenInternal()
			.then(
				(t: IdTokenPayload) => {
					if (!this.isValidIdToken(t)) {
						return Promise.reject('Received invalid ID token!');
					}
					if (this.isTokenReadyForRefresh(t.issuedAt, t.expires)) {
						return this.oAuthServer
							.refreshIdToken({idToken: t.token})
							.then(
								(t) => {
									this.setIdToken(t);
									return t;
								}
							);
					}
					this.setIdToken(t);
					return Promise.resolve(t);
				}
			);
	}

	getIdTokenRaw(): Promise<string> {
		return this.getIdToken().then(t => t.token);
	}

	setIdToken(token?: IdTokenPayload) {
		this.idToken = token;
	}

	verifyIdToken(token: string): Promise<IdTokenPayload> {
		return this.oAuthServer.verifyIdToken(token);
	}

	login(login: string, password: string): Promise<any> {
		this.reset();
		return this.oAuthServer
			.requestIdTokenFromLogin({login: login, password: password, targetAudience: this.audience})
			.then((t) => this.setIdToken(t));
	}

	private getAccessTokenInternal(privilege: string): Promise<AccessTokenPayload> {
		return this.getIdTokenRaw()
			.then(
				(idToken: string) => this.oAuthServer
					.requestAccessToken({idToken: idToken, targetAudience: this.audience, privilege: privilege})
					.then((act: AccessTokenPayload) => {
						if (!this.isValidAccessToken(act)) {
							return Promise.reject("Received access token is not valid!");
						}
						this.accessTokens.set(privilege, act);
						return act;
					})
			);
	}

	getAccessToken(privilege: string): Promise<string> {
		const existing = this.accessTokens.get(privilege);
		if (existing === undefined || !this.isValidAccessToken(existing)) return this.getAccessTokenInternal(privilege).then((t) => t.token);
		// preload access token if it is going to expire soon
		if (this.isTokenReadyForRefresh(existing.issuedAt, existing.expires)) this.getAccessTokenInternal(privilege);
		return Promise.resolve(existing.token);
	}

}

