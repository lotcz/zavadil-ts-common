import {AccessTokenPayload, IdTokenPayload, OAuthRestClient, RefreshTokenPayload} from "./OAuthRestClient";
import {OAuthRefreshTokenProvider} from "./tokenprovider/OAuthRefreshTokenProvider";
import {OAuthUtil} from "../util/OAuthUtil";

/**
 * Manages refresh of id and access tokens.
 */
export class OAuthTokenManager implements OAuthRefreshTokenProvider {

	oAuthServer: OAuthRestClient;

	audience: string;

	refreshToken?: RefreshTokenPayload;

	initialRefreshTokenProvider: OAuthRefreshTokenProvider;

	accessTokens: Map<string, AccessTokenPayload>;

	constructor(oAuthServerBaseUrl: string, targetAudience: string, initialRefreshTokenProvider: OAuthRefreshTokenProvider) {
		this.initialRefreshTokenProvider = initialRefreshTokenProvider;
		this.audience = targetAudience;
		this.oAuthServer = new OAuthRestClient(oAuthServerBaseUrl);
		this.accessTokens = new Map<string, AccessTokenPayload>();
	}

	hasValidRefreshToken(): boolean {
		return OAuthUtil.isValidToken(this.refreshToken);
	}

	hasValidAccessToken(privilege: string): boolean {
		return OAuthUtil.isValidToken(this.accessTokens.get(privilege));
	}

	reset(): Promise<any> {
		this.refreshToken = undefined;
		this.accessTokens.clear();
		return this.initialRefreshTokenProvider.reset();
	}

	/**
	 * Get stored id token or ask the provider, this will trigger redirect to login screen in case of the default provider
	 */
	getRefreshTokenInternal(): Promise<RefreshTokenPayload> {
		if (this.hasValidRefreshToken() && this.refreshToken !== undefined) {
			return Promise.resolve(this.refreshToken);
		}
		return this.initialRefreshTokenProvider.getRefreshToken();
	}

	/**
	 * Get id token, refresh it if needed
	 */
	getRefreshToken(): Promise<IdTokenPayload> {
		return this.getRefreshTokenInternal()
			.then(
				(t: RefreshTokenPayload) => {
					if (!OAuthUtil.isValidToken(t)) {
						console.log("invalid token", t);
						return Promise.reject('Received invalid ID token!');
					}
					if (OAuthUtil.isTokenReadyForRefresh(t)) {
						return this.oAuthServer
							.renewRefreshToken({refreshToken: t.token})
							.then(
								(t) => {
									this.setRefreshToken(t);
									return t;
								}
							);
					}
					this.setRefreshToken(t);
					return Promise.resolve(t);
				}
			);
	}

	getRefreshTokenRaw(): Promise<string> {
		return this.getRefreshToken().then(t => t.token);
	}

	setRefreshToken(token?: IdTokenPayload) {
		this.refreshToken = token;
	}

	verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
		return this.oAuthServer.verifyRefreshToken(token);
	}

	login(login: string, password: string): Promise<any> {
		this.reset();
		return this.oAuthServer
			.requestRefreshTokenFromLogin({login: login, password: password, targetAudience: this.audience})
			.then((t) => this.setRefreshToken(t));
	}

	private getAccessTokenInternal(privilege: string): Promise<AccessTokenPayload> {
		return this.getRefreshTokenRaw()
			.then(
				(refreshToken: string) => this.oAuthServer
					.requestAccessToken({refreshToken: refreshToken, targetAudience: this.audience, privilege: privilege})
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

