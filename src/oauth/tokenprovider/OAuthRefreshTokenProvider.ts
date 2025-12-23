import {IdTokenPayload, RefreshTokenPayload} from "../OAuthRestClient";

export interface OAuthRefreshTokenProvider {
	getRefreshToken(): Promise<RefreshTokenPayload>;
	reset(): Promise<any>;
}
