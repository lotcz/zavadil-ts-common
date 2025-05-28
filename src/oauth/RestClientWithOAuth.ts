import {OAuthTokenManager} from "./OAuthTokenManager";
import {RestClient} from "../client";
import {IdTokenPayload} from "./OAuthRestClient";
import {LazyAsync} from "../cache";
import {StringUtil, JsonUtil} from "../util";

export type ServerOAuthInfoPayload = {
	debugMode?: boolean;
	targetAudience: string;
	oauthServerUrl: string;
	version: string;
}

export class RestClientWithOAuth extends RestClient {

	private tokenName = 'token';

	private insecureClient: RestClient;

	private tokenManager: LazyAsync<OAuthTokenManager>;

	private serverInfo: LazyAsync<ServerOAuthInfoPayload>;

	private defaultPrivilege: string;

	private redirecting?: string;

	constructor(url: string, defaultPrivilege: string = '*') {
		super(url);
		this.defaultPrivilege = defaultPrivilege;

		// rest client without OAuth headers
		this.insecureClient = new RestClient(url);

		this.serverInfo = new LazyAsync<ServerOAuthInfoPayload>(() => this.getServerInfoInternal());
		this.tokenManager = new LazyAsync<OAuthTokenManager>(() => this.getTokenManagerInternal());
	}

	isRedirecting(): boolean {
		return StringUtil.notBlank(this.redirecting);
	}

	redirectingTo(): string {
		return StringUtil.getNonEmpty(this.redirecting);
	}

	redirectTo(url: string): Promise<any> {
		this.redirecting = url;
		document.location.href = url;
		return Promise.reject(`Redirecting to ${url}`);
	}

	initializeIdToken(): Promise<any> {
		const urlToken = this.getIdTokenFromUrl();
		if (urlToken !== null) {
			return this
				.setIdTokenRaw(urlToken)
				.then(
					() => this.redirectTo(this.deleteIdTokenFromUrl())
				);
		} else {
			const storageToken = this.getIdTokenFromLocalStorage();
			if (storageToken) return this.setIdToken(storageToken);
		}
		return Promise.reject("No valid ID token!");
	}

	/**
	 * Attempt to get ID token from URL or storage, redirect to login page when not successful
	 */
	redirectToLogin(): Promise<any> {
		if (this.isRedirecting()) return Promise.reject("Already redirecting!");
		return this.getServerInfo().then(
			(si) => {
				const location = `${si.oauthServerUrl}/login?app_name=${si.targetAudience}&redirect_url=${this.deleteIdTokenFromUrl()}`;
				return this.redirectTo(location);
			}
		).catch((err) => {
			console.error('Redirection failed: OAuth info not fetched:', err);
			return Promise.reject(err);
		});
	}

	/**
	 * Attempt to get ID token from URL or storage, redirect to login page when not successful
	 */
	initialize(): Promise<any> {
		return this.initializeIdToken()
			.then(() => {
				if (!this.isRedirecting()) return this.checkAccessToken();
			})
			.catch(
				(reason) => {
					console.log('OAuth initialization failed:', reason);
					return this.redirectToLogin();
				}
			);
	}

	logout(): Promise<any> {
		return this.getTokenManager()
			.then((m) => m.reset())
			.then(() => this.initialize());
	}

	/**
	 * Override this if a different privilege is needed for different endpoints
	 * @param url
	 */
	getPrivilege(url: string): string {
		return this.defaultPrivilege;
	}

	deleteIdTokenFromUrl(): string {
		const url = new URL(document.location.toString());
		url.searchParams.delete(this.tokenName);
		return StringUtil.trimTrailingSlashes(url.toString());
	}

	getIdTokenFromUrl(): string | null {
		const up = new URLSearchParams(document.location.search);
		return up.get(this.tokenName);
	}

	getIdTokenFromLocalStorage(): IdTokenPayload | null | undefined {
		return JsonUtil.parse(localStorage.getItem('id-token'));
	}

	saveIdTokenToLocalStorage(token: IdTokenPayload | null) {
		const raw = token ? JSON.stringify(token) : null;
		if (raw === null) {
			localStorage.removeItem('id-token');
			return;
		}
		localStorage.setItem('id-token', raw);
	}

	addIdTokenChangedHandler(handler: () => any) {
		this.getTokenManager().then((m) => m.addIdTokenChangedHandler(handler));
	}

	removeIdTokenChangedHandler(handler: () => any) {
		this.getTokenManager().then((m) => m.removeIdTokenChangedHandler(handler));
	}

	private getServerInfoInternal(): Promise<ServerOAuthInfoPayload> {
		return this.insecureClient.getJson('status/oauth/info');
	}

	getServerInfo(): Promise<ServerOAuthInfoPayload> {
		return this.serverInfo.get();
	}

	private getTokenManagerInternal(): Promise<OAuthTokenManager> {
		return this.getServerInfo()
			.then(
				(info) => {
					const tm = new OAuthTokenManager(info.oauthServerUrl, info.targetAudience);
					tm.addIdTokenChangedHandler((t: IdTokenPayload) => this.saveIdTokenToLocalStorage(t));
					return tm;
				}
			);
	}

	getTokenManager(): Promise<OAuthTokenManager> {
		return this.tokenManager.get();
	}

	login(login: string, password: string): Promise<any> {
		return this.getTokenManager().then((m) => m.login(login, password));
	}

	setIdToken(token: IdTokenPayload): Promise<any> {
		return this.getTokenManager()
			.then((m) => m.setIdToken(token));
	}

	setIdTokenRaw(token: string): Promise<any> {
		return this.getTokenManager().then(m => m.verifyIdToken(token))
	}

	getHeaders(endpoint: string): Promise<Headers> {
		return this.getTokenManager()
			.then(tm => tm.getAccessToken(this.getPrivilege(endpoint)))
			.then(
				(accessToken) => super.getHeaders(endpoint)
					.then(
						(headers) => {
							headers.set('Authorization', `Bearer ${accessToken}`);
							return headers;
						}
					)
			);
	}

	/**
	 * Try to obtain access token, then return if everything is okay.
	 * This is basically only used when initializing and trying to determine whether we need to redirect user to login page
	 */
	checkAccessToken(privilege?: string): Promise<any> {
		return this.getTokenManager()
			.then(tm => tm.getAccessToken(StringUtil.getNonEmpty(privilege, this.defaultPrivilege)))
			.catch((e) => Promise.reject(`Access token check failed: ${e}`));
	}

}
