import {IdTokenPayload} from "../OAuthRestClient";

export interface OAuthIdTokenProvider {
	getIdToken(): Promise<IdTokenPayload>;
	reset(): Promise<any>;
}
