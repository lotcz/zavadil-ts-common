import {
	AccessTokenPayload,
	IdTokenPayload,
	OAuthRestClient,
	RefreshTokenPayload,
} from "./OAuthRestClient";
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

	constructor(
		oAuthServerBaseUrl: string,
		targetAudience: string,
		initialRefreshTokenProvider: OAuthRefreshTokenProvider,
	) {
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
		if (this.refreshToken !== undefined && this.hasValidRefreshToken()) {
			return Promise.resolve(this.refreshToken);
		}
		return this.initialRefreshTokenProvider.getRefreshToken();
	}

	/**
	 * Get id token, refresh it if needed
	 */
	getRefreshToken(): Promise<IdTokenPayload> {
		return this.getRefreshTokenInternal().then(
			(t: RefreshTokenPayload) => {
				if (!OAuthUtil.isValidToken(t)) {
					console.log("invalid refresh token", t);
					return Promise.reject("Received invalid refresh token!");
				}
				if (OAuthUtil.isTokenReadyForRefresh(t)) {
					return this.oAuthServer
						.renewRefreshToken({refreshToken: t.token})
						.then((t) => {
							this.setRefreshToken(t);
							return t;
						});
				}
				this.setRefreshToken(t);
				return Promise.resolve(t);
			}
		);
	}

	getRefreshTokenRaw(): Promise<string> {
		return this.getRefreshToken().then((t) => t.token);
	}

	setRefreshToken(token?: RefreshTokenPayload) {
		this.refreshToken = token;
	}

	verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
		return this.oAuthServer.verifyRefreshToken(token);
	}

	login(login: string, password: string): Promise<RefreshTokenPayload> {
		this.reset();
		return this.oAuthServer
			.requestRefreshTokenFromLogin({
				login: login,
				password: password,
				targetAudience: this.audience,
			})
			.then((t) => {
				this.setRefreshToken(t);
				return t;
			});
	}

	private storeAccessToken(scope: string, token: AccessTokenPayload) {
		this.accessTokens.set(scope, token);
	}

	private findStoredAccessToken(scope: string): AccessTokenPayload | undefined {
		const level = OAuthUtil.extractPermissionLevel(scope);
		const privilege = OAuthUtil.extractPrivilege(scope);
		for (const [s, token] of this.accessTokens) {
			if (OAuthUtil.hasPermission(s, privilege, level)) return token;
		}
		return undefined;
	}

	private getAccessTokenInternal(scope: string): Promise<AccessTokenPayload> {
		return this.getRefreshTokenRaw().then(
			(refreshToken: string) => this.oAuthServer
				.requestAccessToken(
					{
						refreshToken: refreshToken,
						targetAudience: this.audience,
						scope: scope,
					}
				)
				.then(
					(act: AccessTokenPayload) => {
						if (!OAuthUtil.isValidToken(act)) {
							return Promise.reject("Received access token is not valid!");
						}
						if (act.scopes && act.scopes.length > 0) {
							act.scopes.forEach((s) => this.storeAccessToken(s, act));
						} else {
							this.storeAccessToken(scope, act);
						}
						return act;
					}
				)
		);
	}

	getAccessToken(scope: string): Promise<string> {
		const existing = this.findStoredAccessToken(scope);
		if (existing === undefined || !OAuthUtil.isValidToken(existing))
			return this.getAccessTokenInternal(scope).then((t) => t.token);
		// preload access token if it is going to expire soon
		if (OAuthUtil.isTokenReadyForRefresh(existing))
			this.getAccessTokenInternal(scope);
		return Promise.resolve(existing.token);
	}
}
