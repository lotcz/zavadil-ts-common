import {AccessTokenPayload, IdTokenPayload, OAuthRestClient, SessionPayload} from "./OAuthRestClient";

export class OAuthSessionManager {

	oAuthServer: OAuthRestClient;

	audience: string;

	idToken?: IdTokenPayload;

	accessToken?: AccessTokenPayload;

	sessionId?: string;

	session?: SessionPayload;

	constructor(oAuthServerBaseUrl: string, targetAudience: string) {
		this.audience = targetAudience;
		this.oAuthServer = new OAuthRestClient(oAuthServerBaseUrl);
		setInterval(() => this.checkAccessTokenRefresh(), 5000);
	}

	isTokenExpired(expires?: Date | null): boolean {
		if (expires === undefined || expires === null) return false;
		const now = Date.now();
		const exp = new Date(expires).getTime();
		return (exp < now);
	}

	isTokenReadyForRefresh(expires?: Date | null): boolean {
		if (expires === undefined || expires === null) return false;
		const now = Date.now();
		const exp = new Date(expires).getTime() - (1000 * 10);
		return (exp < now);
	}

	isValidIdToken(idToken?: IdTokenPayload): boolean {
		return idToken !== undefined && !this.isTokenExpired(idToken.expires);
	}

	hasValidIdToken(): boolean {
		return this.isValidIdToken(this.idToken);
	}

	isValidAccessToken(accessToken?: AccessTokenPayload): boolean {
		return accessToken !== undefined && !this.isTokenExpired(accessToken.expires);
	}

	hasValidAccessToken(): boolean {
		return this.isValidAccessToken(this.accessToken);
	}

	reset() {
		this.sessionId = undefined;
		this.session = undefined;
		this.idToken = undefined;
		this.accessToken = undefined;
	}

	initializeSessionId(sessionId: string) {
		this.reset();
		this.sessionId = sessionId;
	}

	getSession(): Promise<SessionPayload> {
		if (this.session !== undefined) {
			return Promise.resolve(this.session);
		} else {
			if (this.sessionId === undefined) {
				return Promise.reject("No session ID!");
			}
			return this.oAuthServer
				.loadSessionById(this.sessionId)
				.then((session: SessionPayload) => {
					this.session = session;
					return this.session;
				});
		}
	}

	getIdToken(): Promise<string> {
		if (this.hasValidIdToken()) {
			return Promise.resolve(String(this.idToken?.idToken));
		} else {
			if (this.sessionId === undefined) {
				return Promise.reject("No session ID!");
			}
			return this.oAuthServer
				.requestIdTokenFromSession({sessionId: this.sessionId, targetAudience: this.audience})
				.then((idToken: IdTokenPayload) => {
					if (!this.isValidIdToken(idToken)) {
						return Promise.reject("Received ID token is not valid!");
					}
					this.idToken = idToken;
				})
				.then(() => this.getIdToken());
		}
	}

	getAccessToken(): Promise<string> {
		if (this.hasValidAccessToken()) {
			return Promise.resolve(String(this.accessToken?.accessToken));
		} else {
			return this.getIdToken()
				.then(
					(idToken: string) => this.oAuthServer
						.requestAccessToken({idToken: idToken, targetAudience: this.audience})
						.then((act: AccessTokenPayload) => {
							if (!this.isValidAccessToken(act)) {
								return Promise.reject("Received access token is not valid!");
							}
							this.accessToken = act;
						})
				)
				.then(() => this.getAccessToken());
		}
	}

	refreshAccessToken() {
		if (this.accessToken === undefined) throw new Error("No access token to be refreshed!");
		this.oAuthServer.refreshAccessToken(
			{
				targetAudience: this.audience,
				accessToken: this.accessToken?.accessToken,
				refreshToken: this.accessToken?.refreshToken
			}
		).then(
			(act: AccessTokenPayload) => {
				if (!this.isValidAccessToken(act)) {
					throw new Error("Refreshed access token is not valid!");
				}
				this.accessToken = act;
			}
		)
	}

	checkAccessTokenRefresh() {
		if (this.hasValidAccessToken() && this.isTokenReadyForRefresh(this.accessToken?.expires)) {
			this.refreshAccessToken();
		}
	}
}

