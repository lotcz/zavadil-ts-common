import {AccessTokenPayload, IdTokenPayload, OAuthRestClient} from "./OAuthRestClient";
import {OAuthIdTokenProvider} from "./tokenprovider/OAuthIdTokenProvider";
import {OAuthUtil} from "../util/OAuthUtil";

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

	hasValidIdToken(): boolean {
		return OAuthUtil.isValidToken(this.idToken);
	}

	hasValidAccessToken(privilege: string): boolean {
		return OAuthUtil.isValidToken(this.accessTokens.get(privilege));
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
					if (!OAuthUtil.isValidToken(t)) {
						return Promise.reject('Received invalid ID token!');
					}
					if (OAuthUtil.isTokenReadyForRefresh(t)) {
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
						if (!OAuthUtil.isValidToken(act)) {
							return Promise.reject("Received access token is not valid!");
						}
						this.accessTokens.set(privilege, act);
						return act;
					})
			);
	}

	getAccessToken(privilege: string): Promise<string> {
		const existing = this.accessTokens.get(privilege);
		if (existing === undefined || !OAuthUtil.isValidToken(existing)) return this.getAccessTokenInternal(privilege).then((t) => t.token);
		// preload access token if it is going to expire soon
		if (OAuthUtil.isTokenReadyForRefresh(existing)) this.getAccessTokenInternal(privilege);
		return Promise.resolve(existing.token);
	}

}

