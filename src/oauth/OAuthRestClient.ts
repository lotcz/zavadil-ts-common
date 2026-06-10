import { RestClient } from "../client";
import { StringUtil } from "../util";
import {
	AccessTokenPayload,
	IdTokenPayload,
	JwksPayload,
	RefreshTokenPayload,
	RenewRefreshTokenPayload, RequestAccessTokenPayload,
	RequestRefreshTokenFromLoginPayload
} from "./Types";

/**
 * This implements rest client for OAuth server - https://github.com/lotcz/oauth-server
 * Provide basic url, /api/oauth path prefix will be added automatically
 */
export class OAuthRestClient extends RestClient {
  constructor(oauthUrl: string) {
    super(`${StringUtil.trimSlashes(oauthUrl)}/api/oauth`);
  }

  jwks(): Promise<JwksPayload> {
    return this.getJson("jwks.json");
  }

  verifyRefreshToken(refreshToken: string): Promise<RefreshTokenPayload> {
    return this.getJson(`refresh-tokens/verify/${refreshToken}`);
  }

  verifyAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    return this.getJson(`access-tokens/verify/${accessToken}`);
  }

  verifyIdToken(idToken: string): Promise<IdTokenPayload> {
    return this.getJson(`id-tokens/verify/${idToken}`);
  }

  requestRefreshTokenFromLogin(
    request: RequestRefreshTokenFromLoginPayload,
  ): Promise<RefreshTokenPayload> {
    return this.postJson("refresh-tokens/from-login", request);
  }

  renewRefreshToken(
    request: RenewRefreshTokenPayload,
  ): Promise<RefreshTokenPayload> {
    return this.postJson("refresh-tokens/renew", request);
  }

  requestAccessToken(
    request: RequestAccessTokenPayload,
  ): Promise<AccessTokenPayload> {
    return this.postJson("access-tokens/from-refresh-token", request);
  }
}
