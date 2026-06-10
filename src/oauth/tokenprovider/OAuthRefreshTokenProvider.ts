import { RefreshTokenPayload } from "../Types";

export interface OAuthRefreshTokenProvider {
  getRefreshToken(): Promise<RefreshTokenPayload>;
  reset(): Promise<any>;
}
