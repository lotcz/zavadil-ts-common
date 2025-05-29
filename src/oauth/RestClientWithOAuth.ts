import {OAuthTokenManager} from "./OAuthTokenManager";
import {RestClient} from "../client";
import {IdTokenPayload, TokenResponsePayloadBase} from "./OAuthRestClient";
import {LazyAsync} from "../cache";
import {OAuthIdTokenProvider} from "./tokenprovider/OAuthIdTokenProvider";
import {IdTokenProviderDefault} from "./tokenprovider/IdTokenProviderDefault";

export type ServerOAuthInfoPayload = {
	debugMode?: boolean;
	targetAudience: string;
	oauthServerUrl: string;
	version: string;
}

export class RestClientWithOAuth extends RestClient implements OAuthIdTokenProvider {

	private insecureClient: RestClient;

	private freshIdTokenProvider: OAuthIdTokenProvider;

	private tokenManager: LazyAsync<OAuthTokenManager>;

	private serverInfo: LazyAsync<ServerOAuthInfoPayload>;

	private defaultPrivilege: string;

	constructor(url: string, freshIdTokenProvider?: OAuthIdTokenProvider, defaultPrivilege: string = '*') {
		super(url);

		this.freshIdTokenProvider = freshIdTokenProvider || new IdTokenProviderDefault(this);
		this.defaultPrivilege = defaultPrivilege;

		// rest client without OAuth headers
		this.insecureClient = new RestClient(url);

		this.serverInfo = new LazyAsync<ServerOAuthInfoPayload>(() => this.getServerInfoInternal());
		this.tokenManager = new LazyAsync<OAuthTokenManager>(() => this.getTokenManagerInternal());
	}

	getIdToken(): Promise<IdTokenPayload> {
        return this.getTokenManager().then(t => t.getIdToken());
    }

	/**
	 * Attempt to get ID token from token manager
	 */
	initialize(): Promise<any> {
		return this.getIdToken();
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

	private getServerInfoInternal(): Promise<ServerOAuthInfoPayload> {
		return this.insecureClient.getJson('status/oauth/info');
	}

	getServerInfo(): Promise<ServerOAuthInfoPayload> {
		return this.serverInfo.get();
	}

	protected getTokenManagerInternal(): Promise<OAuthTokenManager> {
		return this
			.getServerInfo()
			.then((info) =>  new OAuthTokenManager(info.oauthServerUrl, info.targetAudience, this.freshIdTokenProvider));
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

}
