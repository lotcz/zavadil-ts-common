import { RestClient } from "../client";
import { StringUtil } from "../util";

export const PERMISSION_LEVELS = ["read", "write", "admin"] as const;

export type PermissionLevel = (typeof PERMISSION_LEVELS)[number];

export type TokenRequestPayloadBase = {
  targetAudience: string;
};

export type RequestAccessTokenPayload = TokenRequestPayloadBase & {
  refreshToken: string;
  scope: string;
};

export type RenewRefreshTokenPayload = {
  refreshToken: string;
};

export type RequestRefreshTokenFromLoginPayload = TokenRequestPayloadBase & {
  login: string;
  password: string;
};

export type TokenResponsePayloadBase = {
  token: string;
  issuedAt: Date;
  expires?: Date | null;
};

export type IdTokenPayload = TokenResponsePayloadBase & {};

export type AccessTokenPayload = TokenResponsePayloadBase & {
  scopes?: Array<string>;
};

export type RefreshTokenPayload = TokenResponsePayloadBase & {};

export type JwKeyPayload = {
  kty: string;
  kid: string;
  n: string;
  e: string;
};

export type JwksPayload = {
  keys: Array<JwKeyPayload>;
};

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
