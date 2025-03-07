import {AccessTokenPayload, IdTokenPayload, OAuthRestClient} from "./OAuthRestClient";
import {EventManager} from "../component";
import {StringUtil} from "../util";

/**
 * Manages refresh of id and access tokens.
 */
export class OAuthTokenManager {

	private eventManager: EventManager = new EventManager();

	oAuthServer: OAuthRestClient;

	audience: string;

	idToken?: IdTokenPayload;

	accessTokens: Map<string, AccessTokenPayload>;

	constructor(oAuthServerBaseUrl: string, targetAudience: string) {
		this.audience = targetAudience;
		this.oAuthServer = new OAuthRestClient(oAuthServerBaseUrl);
		this.accessTokens = new Map<string, AccessTokenPayload>();
	}

	addIdTokenChangedHandler(handler: (t: IdTokenPayload) => any) {
		this.eventManager.addEventListener('id-token-changed', handler);
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
		this.setIdToken(undefined);
		this.accessTokens.clear();
	}

	getIdToken(): Promise<string> {
		if (this.idToken === undefined || !this.hasValidIdToken()) {
			return Promise.reject("No valid ID token!");
		}
		if (this.isTokenReadyForRefresh(this.idToken.issuedAt, this.idToken.expires)) {
			return this.oAuthServer
				.refreshIdToken({idToken: this.idToken.token})
				.then(
					(t) => {
						this.setIdToken(t);
						return t.token;
					}
				);
		}
		return Promise.resolve(this.idToken.token);
	}

	setIdToken(token?: IdTokenPayload) {
		if (!this.isValidIdToken(token)) {
			throw new Error("Received ID token is not valid!");
		}
		this.idToken = token;
		this.eventManager.triggerEvent('id-token-changed', token);
	}

	verifyIdToken(token: string): Promise<boolean> {
		return this.oAuthServer.verifyIdToken(token)
			.then((t) => this.setIdToken(t))
			.then(() => true)
	}

	login(login: string, password: string): Promise<boolean> {
		this.reset();
		return this.oAuthServer.requestIdTokenFromLogin({login: login, password: password, targetAudience: this.audience})
			.then(
				(t) => {
					this.setIdToken(t);
					return true;
				})
	}

	private getAccessTokenInternal(privilege: string): Promise<AccessTokenPayload> {
		return this.getIdToken()
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

