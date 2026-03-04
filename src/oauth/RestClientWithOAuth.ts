import { OAuthTokenManager } from "./OAuthTokenManager";
import { RestClient } from "../client";
import { IdTokenPayload } from "./OAuthRestClient";
import { LazyAsync } from "../cache";
import { OAuthRefreshTokenProvider } from "./tokenprovider/OAuthRefreshTokenProvider";
import { RefreshTokenProviderDefault } from "./tokenprovider/RefreshTokenProviderDefault";

export type ServerOAuthInfoPayload = {
  debugMode?: boolean;
  targetAudience: string;
  oauthServerUrl: string;
  version: string;
};

export class RestClientWithOAuth
  extends RestClient
  implements OAuthRefreshTokenProvider
{
  private insecureClient: RestClient;

  private freshIdTokenProvider: OAuthRefreshTokenProvider;

  private tokenManager: LazyAsync<OAuthTokenManager>;

  private serverInfo: LazyAsync<ServerOAuthInfoPayload>;

  private defaultScope: string;

  constructor(
    url: string,
    freshIdTokenProvider?: OAuthRefreshTokenProvider,
    defaultScope: string = "admin:*",
  ) {
    super(url);

    this.freshIdTokenProvider =
      freshIdTokenProvider || new RefreshTokenProviderDefault(this);
    this.defaultScope = defaultScope;

    // rest client without OAuth headers
    this.insecureClient = new RestClient(url);

    this.serverInfo = new LazyAsync<ServerOAuthInfoPayload>(() =>
      this.getServerInfoInternal(),
    );
    this.tokenManager = new LazyAsync<OAuthTokenManager>(() =>
      this.getTokenManagerInternal(),
    );
  }

  getRefreshToken(): Promise<IdTokenPayload> {
    return this.getTokenManager().then((t) => t.getRefreshToken());
  }

  /**
   * Attempt to get ID token from token manager
   */
  initialize(): Promise<any> {
    return this.getRefreshToken();
  }

  logout(): Promise<any> {
    return this.reset().then(() => this.initialize());
  }

  reset(): Promise<any> {
    return this.getTokenManager().then((m) => m.reset());
  }

  /**
   * Override this if a different privilege is needed for different endpoints
   * @param url
   */
  getScope(url: string): string {
    return this.defaultScope;
  }

  private getServerInfoInternal(): Promise<ServerOAuthInfoPayload> {
    return this.insecureClient.getJson("status/oauth/info");
  }

  getServerInfo(): Promise<ServerOAuthInfoPayload> {
    return this.serverInfo.get();
  }

  protected getTokenManagerInternal(): Promise<OAuthTokenManager> {
    return this.getServerInfo().then(
      (info) =>
        new OAuthTokenManager(
          info.oauthServerUrl,
          info.targetAudience,
          this.freshIdTokenProvider,
        ),
    );
  }

  getTokenManager(): Promise<OAuthTokenManager> {
    return this.tokenManager.get();
  }

  login(login: string, password: string): Promise<any> {
    return this.getTokenManager().then((m) => m.login(login, password));
  }

  setIdToken(token: IdTokenPayload): Promise<any> {
    return this.getTokenManager().then((m) => m.setRefreshToken(token));
  }

  getHeaders(endpoint: string): Promise<Headers> {
    return this.getTokenManager()
      .then((tm) => tm.getAccessToken(this.getScope(endpoint)))
      .then((accessToken) =>
        super.getHeaders(endpoint).then((headers) => {
          headers.set("Authorization", `Bearer ${accessToken}`);
          return headers;
        }),
      );
  }
}
